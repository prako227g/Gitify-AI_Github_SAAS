import { Octokit } from 'octokit'
import axios from 'axios'
import { db } from '@/server/db'
import { aiSummariseCommit } from './gemini'
import { API_CONFIG } from './config'

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

export interface CommitInfo {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<CommitInfo[]> => {
    try {
        if (!process.env.GITHUB_TOKEN) {
            throw new Error('GitHub token is not configured')
        }

        const urlParts = githubUrl.replace('https://github.com/', '').split('/')
        if (urlParts.length !== 2) {
            throw new Error('Invalid GitHub URL format')
        }

        const [owner, repo] = urlParts

        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: API_CONFIG.COMMITS.MAX_COMMITS_PER_POLL,
        })

        return data.map((commit: any) => ({
            commitHash: commit.sha || '',
            commitMessage: commit.commit?.message || 'No message',
            commitAuthorName: (commit.commit?.author?.name || commit.author?.login || 'Unknown') as string,
            commitAuthorAvatar: (commit.author?.avatar_url || '') as string,
            commitDate: commit.commit?.author?.date || new Date().toISOString(),
        }))

    } catch (error) {
        console.error('Error fetching commits:', error)
        
        if (error instanceof Error) {
            if (error.message.includes('Not Found')) {
                throw new Error('Repository not found. Please check the GitHub URL.')
            }
            if (error.message.includes('rate limit')) {
                throw new Error('GitHub API rate limit exceeded. Please try again later.')
            }
        }
        
        throw new Error('Failed to fetch commits from GitHub')
    }
}

async function filterUnprocessedCommits(projectId: string, commits: CommitInfo[]) {
    try {
        const existingCommits = await db.commit.findMany({
            where: { projectId },
            select: { commitHash: true }
        })

        const existingHashes = new Set(existingCommits.map(c => c.commitHash))
        const unprocessed = commits.filter(commit => !existingHashes.has(commit.commitHash))

        console.log(`Found ${unprocessed.length} unprocessed commits out of ${commits.length} total`)
        return unprocessed

    } catch (error) {
        console.error('Error filtering unprocessed commits:', error)
        throw new Error('Failed to filter commits')
    }
}

// Rate limiting utility function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Process summaries in background with rate limiting
async function processSummariesInBackground(projectId: string, commits: CommitInfo[], githubUrl: string) {
    console.log(`Starting background summary processing for ${commits.length} commits`)
    
    // Process commits in batches to avoid overwhelming the API
    for (let i = 0; i < commits.length; i += API_CONFIG.COMMITS.MAX_COMMITS_PER_BATCH) {
        const batch = commits.slice(i, i + API_CONFIG.COMMITS.MAX_COMMITS_PER_BATCH)
        console.log(`Processing summary batch ${Math.floor(i / API_CONFIG.COMMITS.MAX_COMMITS_PER_BATCH) + 1}/${Math.ceil(commits.length / API_CONFIG.COMMITS.MAX_COMMITS_PER_BATCH)} (${batch.length} commits)`)
        
        for (let j = 0; j < batch.length; j++) {
            const commit = batch[j]!
            const globalIndex = i + j
            console.log(`Processing summary for commit ${globalIndex + 1}/${commits.length}: ${commit.commitHash.substring(0, 8)}`)
            
            try {
                const summary = await summarizeCommit(githubUrl, commit.commitHash)
                
                // Update the commit with the summary
                await db.commit.updateMany({
                    where: { 
                        projectId,
                        commitHash: commit.commitHash
                    },
                    data: { summary }
                })
                
                console.log(`✓ Summary generated for commit ${commit.commitHash.substring(0, 8)}`)
                
                // Add delay between requests to respect rate limit
                if (j < batch.length - 1) {
                    console.log(`Waiting ${API_CONFIG.GEMINI.DELAY_BETWEEN_REQUESTS / 1000} seconds before next summary...`)
                    await delay(API_CONFIG.GEMINI.DELAY_BETWEEN_REQUESTS)
                }
            } catch (error) {
                console.error(`Error processing summary for commit ${commit.commitHash}:`, error)
                
                // Update with error message
                await db.commit.updateMany({
                    where: { 
                        projectId,
                        commitHash: commit.commitHash
                    },
                    data: { summary: "Summary generation failed. Will retry later." }
                })
            }
        }
        
        // Add delay between batches if there are more commits to process
        if (i + API_CONFIG.COMMITS.MAX_COMMITS_PER_BATCH < commits.length) {
            console.log(`Summary batch complete. Waiting ${API_CONFIG.COMMITS.DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`)
            await delay(API_CONFIG.COMMITS.DELAY_BETWEEN_BATCHES)
        }
    }
    
    console.log('Background summary processing completed')
}

export const pollCommits = async (projectId: string) => {
    try {
        if (!projectId) {
            throw new Error('Project ID is required')
        }

        console.log(`Polling commits for project: ${projectId}`)

        const { project, githubUrl } = await fetchProjectGithubUrl(projectId)
        const commitHashes = await getCommitHashes(githubUrl)
        const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)

        if (unprocessedCommits.length === 0) {
            console.log('No new commits to process')
            return { processed: 0, total: commitHashes.length }
        }

        console.log(`Found ${unprocessedCommits.length} new commits. Saving immediately and processing summaries in background.`)

        // Immediately save all commits without summaries
        const commits = await db.commit.createMany({
            data: unprocessedCommits.map(commit => ({
                projectId: projectId,
                commitHash: commit.commitHash,
                commitMessage: commit.commitMessage,
                commitAuthorName: commit.commitAuthorName,
                commitAuthorAvatar: commit.commitAuthorAvatar,
                commitDate: commit.commitDate,
                summary: "Processing summary..." // Placeholder
            }))
        })

        console.log(`✓ Immediately saved ${commits.count} commits to database`)

        // Process summaries in background (non-blocking)
        processSummariesInBackground(projectId, unprocessedCommits, githubUrl)
            .catch(error => {
                console.error('Background summary processing failed:', error)
            })

        return { processed: commits.count, total: commitHashes.length }

    } catch (error) {
        console.error('Error polling commits:', error)
        throw error
    }
}

async function summarizeCommit(githubUrl: string, commitHash: string) {
    try {
        if (!githubUrl || !commitHash) {
            throw new Error('GitHub URL and commit hash are required')
        }

        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: 'application/vnd.github.v3.diff',
                Authorization: `token ${process.env.GITHUB_TOKEN}`
            },
            timeout: 10000 // 10 second timeout
        })

        if (!data) {
            throw new Error('No diff data received')
        }

        const summary = await aiSummariseCommit(data) || "No summary generated"
        return summary

    } catch (error) {
        console.error(`Error summarizing commit ${commitHash}:`, error)
        return "Failed to generate summary"
    }
}

async function fetchProjectGithubUrl(projectId: string) {
    try {
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: {
                githubUrl: true
            }
        })

        if (!project?.githubUrl) {
            throw new Error("Project has no GitHub URL configured")
        }

        return { project, githubUrl: project.githubUrl }

    } catch (error) {
        console.error('Error fetching project GitHub URL:', error)
        throw new Error('Failed to fetch project information')
    }
}
