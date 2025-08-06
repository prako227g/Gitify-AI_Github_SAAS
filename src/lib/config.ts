// Configuration for API rate limiting and processing
export const API_CONFIG = {
    // Gemini API rate limiting (Free tier: 15 requests per minute)
    GEMINI: {
        REQUESTS_PER_MINUTE: 15,
        DELAY_BETWEEN_REQUESTS: 3000, // 3 seconds (reduced from 4 for faster processing)
        MAX_RETRIES: 3,
        BASE_RETRY_DELAY: 2000, // 2 seconds
    },
    
    // Commit processing configuration
    COMMITS: {
        MAX_COMMITS_PER_BATCH: 3, // Process only 3 commits at a time (reduced for faster processing)
        DELAY_BETWEEN_BATCHES: 30000, // 30 seconds delay between batches (reduced from 60)
        MAX_COMMITS_PER_POLL: 20, // Maximum commits to fetch per poll
    },
    
    // GitHub API configuration
    GITHUB: {
        TIMEOUT: 10000, // 10 seconds
        MAX_COMMITS_PER_REQUEST: 20,
    }
}

// Helper function to calculate delays based on rate limits
export function calculateDelay(requestsPerMinute: number): number {
    return Math.ceil(60000 / requestsPerMinute) // Convert to milliseconds
}

// Helper function to get exponential backoff delay
export function getExponentialBackoffDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt)
} 