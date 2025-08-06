import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

function msToTime(ms: number) {
    const seconds = ms / 1000
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const processMeeting = async (meetingUrl: string) => {
    try {
        if (!process.env.ASSEMBLYAI_API_KEY) {
            throw new Error('AssemblyAI API key is not configured')
        }

        if (!meetingUrl) {
            throw new Error('Meeting URL is required')
        }

        console.log('Starting transcription for:', meetingUrl)

        const transcript = await client.transcripts.transcribe({
            audio: meetingUrl,
            auto_chapters: true,
            speaker_labels: true,
            punctuate: true,
            format_text: true,
        })

        if (!transcript || !transcript.text) {
            throw new Error('No transcript was generated from the audio file')
        }

        console.log('Transcription completed, processing chapters...')

        const summaries = transcript.chapters?.map(chapter => ({
            start: msToTime(chapter.start),
            end: msToTime(chapter.end),
            gist: chapter.gist || 'No gist available',
            headline: chapter.headline || 'Untitled Chapter',
            summary: chapter.summary || 'No summary available'
        })) || []

        if (summaries.length === 0) {
            console.warn('No chapters found in transcript, creating a single summary')
            summaries.push({
                start: '00:00',
                end: msToTime(transcript.audio_duration || 0),
                gist: 'Meeting summary',
                headline: 'Meeting Overview',
                summary: transcript.text.substring(0, 500) + (transcript.text.length > 500 ? '...' : '')
            })
        }

        console.log(`Processing completed. Found ${summaries.length} chapters/sections`)

        return {
            summaries,
            transcriptLength: transcript.text.length,
            audioDuration: transcript.audio_duration,
            confidence: transcript.confidence
        }

    } catch (error) {
        console.error('Error processing meeting:', error)
        
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                throw new Error('AssemblyAI service is not properly configured')
            }
            if (error.message.includes('audio')) {
                throw new Error('Unable to process the audio file. Please check the file format and try again.')
            }
            if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Network error occurred while processing the meeting. Please try again.')
            }
            throw error
        }
        
        throw new Error('An unexpected error occurred while processing the meeting')
    }
}

