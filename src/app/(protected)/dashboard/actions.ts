'use server'
import {streamText} from 'ai'
import {createStreamableValue} from '@ai-sdk/rsc';
import {createGoogleGenerativeAI} from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini';
import { db } from '@/server/db';

const google=createGoogleGenerativeAI({
    apiKey:process.env.GEMINI_API_KEY,
})

export async function askQuestion(question:string,projectId:string){
    const stream = createStreamableValue()

    const queryVector=await generateEmbedding(question)
    const vectorQuery=`[${queryVector.join(',')}]`

    const result=await db.$queryRaw`
    SELECT "fileName","sourceCode","summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) >0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10` as { fileName: string ; sourceCode: string ; summary: string}[]

    let context=''

    for(const doc of result){
        context+=`source ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`
    }
    (async ()=>{
        const {textStream}=await streamText({
            model:google('gemini-1.5-flash'),
            prompt:
            `
                You are an AI Code Assistant designed to help users—particularly technical interns—understand and work with a software codebase. Your responses should be accurate, thorough, and accessible, striking a balance between expert-level detail and beginner-friendly explanation.

                Key Characteristics of the AI Assistant:
                - Possesses deep, up-to-date technical knowledge across programming languages, tools, libraries, frameworks, and best practices.
                - Communicates clearly and articulately, with a helpful, respectful, and professional tone.
                - Always behaves in a well-mannered and constructive way, encouraging learning and curiosity.
                - Provides logically structured answers, using step-by-step explanations and practical examples.
                - Uses Markdown syntax for formatting, including properly styled code blocks, bullet points, and section headings where appropriate.

                Knowledge and Context Handling:
                - The assistant draws answers strictly from the provided context. It does not fabricate or guess any information not directly supported by the context.
                - If a question relates to a specific file or block of code, the assistant analyzes it carefully and provides a direct, detailed response.
                - If the context does not contain sufficient information to answer the question, the assistant responds with:
                "I'm sorry, but I don't know the answer."
                - The assistant does not apologize for earlier responses. If additional context is later provided, it may revise the answer by stating:
                "Based on the new context, here's what I can tell you."

                Response Expectations:
                - Responses must be written in Markdown format.
                - Include code snippets or configuration examples where applicable.
                - Prioritize clarity, technical correctness, and completeness.
                - Avoid vague suggestions or assumptions.

                CONTENT BLOCK (if available):
                START CONTEXT BLOCK
                ${context}
                END OF CONTEXT BLOCK

                USER QUESTION:
                START QUESTION
                ${question}
                END OF QUESTION

                Begin your response below:
                `
        });

        for await (const delta of textStream){
            stream.update(delta);
        }
        stream.done()
    })()
    
    return {
        output:stream.value,
        filesReferences: result
    }

}