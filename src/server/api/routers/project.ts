import z from "zod";
import { createTRPCRouter, protectedProcedure} from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name:z.string(),
            githubUrl:z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) =>{
        const project = await ctx.db.project.create({
            data:{
                githubUrl:input.githubUrl,
                name:input.name,
                userToProjects: {
                    create: {
                      userId: ctx.user.userId!,
                    }
                }
            }
        })
        await indexGithubRepo(project.id,input.githubUrl,input.githubToken)
        await pollCommits(project.id)
        return project

    }),
    getProjects:protectedProcedure.query(async({ctx})=>{
        return await ctx.db.project.findMany({
            where:{
                userToProjects:{
                    some:{
                        userId:ctx.user.userId!
                    }
                },
                deletedAt:null
            }
        })
    }),
    getCommits:protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async({ctx,input})=>{
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({where:{projectId:input.projectId}})
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any()
    })).mutation(async({ctx,input})=>{
        return await ctx.db.question.create({
            data:{
                answer: input.answer,
                fileReferences: input.filesReferences,
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!
            }
        })
    }),
    getQuestions:protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.question.findMany({
            where:{
                projectId:input.projectId

            },
            include:{
                user:true
            },
            orderBy:{
                createdAt:'desc'
            }
        
        })
    }),
    uploadMeeting: protectedProcedure.input(z.object({projectId:z.string(),meetingUrl:z.string(),name:z.string()}))
    .mutation(async ({ctx,input})=>{
        const meeting=await ctx.db.meeting.create({
            data:{
                meetingUrl:input.meetingUrl,
                projectId:input.projectId,
                name:input.name,
                status:"PROCESSING"

            }
        })
        return meeting
    }),
    getMeetings: protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
            return await ctx.db.meeting.findMany({where:{projectId:input.projectId},include:{issues:true}})
    }),
    deleteMeeting: protectedProcedure.input(z.object({meetingId:z.string()})).mutation(async({ctx,input})=>{
        try {
            // First delete all related issues
            await ctx.db.issue.deleteMany({
                where: { meetingId: input.meetingId }
            });
            
            // Then delete the meeting
            return await ctx.db.meeting.delete({
                where: { id: input.meetingId }
            });
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw new Error('Failed to delete meeting. Please try again.');
        }
    }),
    getMeetingById: protectedProcedure.input(z.object({meetingId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.meeting.findUnique({where:{id:input.meetingId},include:{issues:true}})
    }),
    archiveProject:protectedProcedure.input(z.object({projectId:z.string()})).mutation(async({ctx,input})=>{
        return await ctx.db.project.update({where:{id:input.projectId},data:{deletedAt:new Date()}})
    }),
    getTeamMembers: protectedProcedure.input(z.object({projectId:z.string()})).query(async({ctx,input})=>{
        return await ctx.db.userToProject.findMany({where:{projectId:input.projectId},include:{user:true}})
    }),
    getMyCredits:protectedProcedure.query(async({ctx})=>{
        return await ctx.db.user.findUnique({where:{id:ctx.user.userId!},select:{credits:true}})
    }),
    pollCommits: protectedProcedure
            .input(z.object({ projectId: z.string() }))
            .mutation(async ({ ctx, input }) => {
                try {
                    console.log(`Polling commits for project: ${input.projectId}`)
                    const result = await pollCommits(input.projectId)
                    
                    if (result.processed > 0) {
                        console.log(`Successfully saved ${result.processed} commits immediately`)
                        return {
                            ...result,
                            message: `${result.processed} commits saved immediately. AI summaries are being generated in the background.`
                        }
                    }
                    
                    return result
                } catch (error) {
                    console.error('Error in pollCommits mutation:', error)
                    
                    // Check if it's a rate limit error
                    if (error instanceof Error && error.message.includes('rate limit')) {
                        throw new Error('API rate limit exceeded. Commits will be processed gradually. Please try again in a few minutes.')
                    }
                    
                    throw new Error('Failed to poll commits. Please try again.')
                }
            })




})