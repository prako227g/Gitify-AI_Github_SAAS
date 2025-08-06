import {GoogleGenerativeAI} from '@google/generative-ai'
import {Document} from '@langchain/core/documents';
import { API_CONFIG, getExponentialBackoffDelay } from './config'

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({
    model:'gemini-1.5-flash'
})

// Rate limiting utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry function with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>, 
    maxRetries: number = API_CONFIG.GEMINI.MAX_RETRIES, 
    baseDelay: number = API_CONFIG.GEMINI.BASE_RETRY_DELAY
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error: any) {
            if (attempt === maxRetries) {
                throw error
            }
            
            // Check if it's a rate limit error
            if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                const waitTime = getExponentialBackoffDelay(attempt, baseDelay)
                console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries + 1}`)
                await delay(waitTime)
                continue
            }
            
            // For other errors, throw immediately
            throw error
        }
    }
    throw new Error('Max retries exceeded')
}

export const aiSummariseCommit = async (diff: string): Promise<string> => {
    try {
        // Add a small delay before each request to help with rate limiting
        await delay(1000)
        
        const response = await retryWithBackoff(async () => {
            return await model.generateContent([
                `You are an expert programmer,and you are trying to summarize a git diff.
                For every file,there are a few metadata lines,like(for example):
                \'\'\'
                diff --git a/lib/index.js b/lib/index.js
                index aadf691..bfef603 100644
                --- a/lib/index.js
                +++ b/lib/index.js
                \'\'\'
                
                This means that \'lib/index.js\' was modified in this commit.Note that is only an example.
                Then there is a specifier of the lines that were modified.
                A line starting with \'+'\ means it was added/
                A line that starting with \'-'\ means that line was deleted.
                A line that starts with neither \'+\' nor \'-\' is code given for context and better understanding.
                It is not part of the diff.
                [...]

                EXAMPLE SUMMARY COMMENTS:
                \'\'\'
                *Raised the amount of returned recordings from \'10\' to \'100\' [packages/server/recordings_api.ts],[packages/server/constants.ts]
                *Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
                *Moved the \'octokit\' initialization to a separate file [src/octokit.ts],[src/index/ts]
                *Added an OpenAI API for completions [packages/utils/apis/openai.ts]
                *Lowered numeric tolerance for test files
                \'\'\'

                Most commits will have less comments than this example list.
                The last comment does not include the file names,because there were more than two relevant files in the hypothetical commit.
                Do not include parts of the example in your summary.
                It is given only as an example of appropriate comments.`,
                `Please Summarize the following diff file: \n\n${diff}`,
            ])
        })
        
        return response.response.text()
    } catch (error) {
        console.error('Error in aiSummariseCommit:', error)
        
        // Return a fallback summary instead of throwing
        return "Summary generation failed due to API limits. Please try again later."
    }
}

export async function summariseCode(doc: Document): Promise<string> {
    console.log("getting summary for", doc.metadata.source)
    try {
        const code = doc.pageContent.slice(0, 10000)
        
        const response = await retryWithBackoff(async () => {
            return await model.generateContent([
                `You are an intelligent senior software engineer who specialises in onboarding junior software engineer onto projects`,
                `YOu are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
                Here is the code :
                ---
                ${code}
                ---
                  GIve a summary no more than 100 words of the code above`,
            ])
        })

        return response.response.text()
        
    } catch (error) {
        console.error('Error in summariseCode:', error)
        return 'Summary generation failed due to API limits.'
    }
}

export async function generateEmbedding(summary: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({
            model: "text-embedding-004"
        })

        const result = await retryWithBackoff(async () => {
            return await model.embedContent(summary)
        })
        
        const embedding = result.embedding
        return embedding.values
    } catch (error) {
        console.error('Error in generateEmbedding:', error)
        // Return a zero vector as fallback
        return new Array(768).fill(0)
    }
}

