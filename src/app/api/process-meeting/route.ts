import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const bodyParser = z.object({
    meetingUrl: z.string().url("Invalid meeting URL"),
    projectId: z.string().min(1, "Project ID is required"),
    meetingId: z.string().min(1, "Meeting ID is required")
})

export const maxDuration = 300

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" }, 
                { status: 401 }
            )
        }

        const body = await req.json();
        const { meetingUrl, projectId, meetingId } = bodyParser.parse(body)

        // Verify the meeting exists and belongs to the user's project
        const meeting = await db.meeting.findFirst({
            where: { 
                id: meetingId,
                project: {
                    userToProjects: {
                        some: { userId }
                    }
                }
            },
            include: { project: true }
        })

        if (!meeting) {
            return NextResponse.json(
                { error: "Meeting not found or access denied" }, 
                { status: 404 }
            )
        }

        // Process the meeting
        const { summaries } = await processMeeting(meetingUrl);

        if (!summaries || summaries.length === 0) {
            return NextResponse.json(
                { error: "No content found in the meeting" }, 
                { status: 400 }
            )
        }

        // Create issues in a transaction
        await db.$transaction(async (tx) => {
            // Create all issues
            await tx.issue.createMany({
                data: summaries.map(summary => ({
                    start: summary.start,
                    end: summary.end,
                    gist: summary.gist,
                    headline: summary.headline,
                    summary: summary.summary,
                    meetingId,
                }))
            })

            // Update meeting status
            await tx.meeting.update({
                where: { id: meetingId },
                data: {
                    status: "COMPLETED",
                    name: summaries[0]?.headline || meeting.name
                }
            })
        })

        return NextResponse.json(
            { 
                success: true, 
                message: "Meeting processed successfully",
                issuesCount: summaries.length
            }, 
            { status: 200 }
        )

    } catch (error) {
        console.error('Process meeting error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors }, 
                { status: 400 }
            )
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: "Internal server error" }, 
            { status: 500 }
        )
    }
}