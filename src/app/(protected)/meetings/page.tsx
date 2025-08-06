'use client'

import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react';
import React from 'react'
import MeetingCard from '../dashboard/meeting-card';
import Link from 'next/link';
import { Badge, Trash2, Eye, Calendar, AlertCircle, Plus, Clock, Users, TrendingUp, Sparkles, Mic, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge as UIBadge } from '@/components/ui/badge';

const MeetingPage = () => {
    const { projectId } = useProject();
    const { data: meetings, isLoading, error } = api.project.getMeetings.useQuery({ projectId }, {
        refetchInterval: 4000
    })
    const deleteMeeting = api.project.deleteMeeting.useMutation()
    const refetch = useRefetch()

    const handleDeleteMeeting = async (meetingId: string, meetingName: string) => {
        try {
            await deleteMeeting.mutateAsync({ meetingId })
            toast.success(`Meeting "${meetingName}" deleted successfully`)
            refetch()
        } catch (error) {
            toast.error("Failed to delete meeting. Please try again.")
            console.error('Delete meeting error:', error)
        }
    }

    if (error) {
        return (
            <div className="space-y-6">
                <MeetingCard />
                <div className="h-6"></div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load meetings. Please try refreshing the page.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent'>
                                Meeting Analysis
                            </h1>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                                <Mic className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <p className="text-gray-600 text-lg">Upload and analyze your meeting recordings with AI-powered insights and action items.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <UIBadge variant="outline" className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 px-4 py-2">
                            <Clock className="w-4 h-4 mr-2" />
                            {meetings?.length || 0} meeting{meetings?.length !== 1 ? 's' : ''}
                        </UIBadge>
                    </div>
                </div>

                {/* Upload Card */}
                <MeetingCard />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Meetings</p>
                                <p className="text-2xl font-bold text-gray-900">{meetings?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {meetings?.filter(m => m.status === 'COMPLETED').length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Issues</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {meetings?.reduce((acc, m) => acc + m.issues.length, 0) || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">AI Insights</p>
                                <p className="text-2xl font-bold text-gray-900">∞</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Meetings List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Your Meetings</h2>
                            <p className="text-gray-600">Analyzed recordings and insights</p>
                        </div>
                    </div>
                    {meetings && meetings.length > 0 && (
                        <Button variant="outline" size="sm" className="gap-2 hover:shadow-md transition-all duration-300">
                            <Plus className="w-4 h-4" />
                            Upload New
                        </Button>
                    )}
                </div>

                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-3">
                                            <Skeleton className="h-6 w-56" />
                                            <Skeleton className="h-4 w-40" />
                                        </div>
                                        <div className="flex gap-3">
                                            <Skeleton className="h-10 w-24" />
                                            <Skeleton className="h-10 w-24" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && meetings && meetings.length === 0 && (
                    <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 shadow-xl">
                        <CardContent className="p-16 text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
                                <Clock className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No meetings found</h3>
                            <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                                Upload your first meeting recording to get started with AI-powered analysis, transcription, and actionable insights.
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    AI Transcription
                                </UIBadge>
                                <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
                                    <Users className="w-4 h-4 mr-2" />
                                    Action Items
                                </UIBadge>
                                <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
                                    <Brain className="w-4 h-4 mr-2" />
                                    Smart Insights
                                </UIBadge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && meetings && meetings.length > 0 && (
                    <div className="space-y-4">
                        {meetings.map((meeting) => (
                            <Card key={meeting.id} className="border-gray-200/50 hover:shadow-xl transition-all duration-300 group bg-gradient-to-r from-white to-gray-50/50">
                                <CardContent className="p-8">
                                    <div className='flex items-center justify-between'>
                                        <div className="flex-1 min-w-0">
                                            <div className='flex items-center gap-4 mb-4'>
                                                <Link 
                                                    href={`/meetings/${meeting.id}`}
                                                    className='text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors truncate'
                                                >
                                                    {meeting.name}
                                                </Link>
                                                {meeting.status === "PROCESSING" && (
                                                    <UIBadge className='bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse shadow-lg'>
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        Processing...
                                                    </UIBadge>
                                                )}
                                                {meeting.status === "COMPLETED" && (
                                                    <UIBadge className='bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'>
                                                        <TrendingUp className="w-4 h-4 mr-2" />
                                                        Completed
                                                    </UIBadge>
                                                )}
                                            </div>
                                            <div className='flex items-center text-sm text-gray-500 gap-x-8'>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5" />
                                                    <span className="font-medium">{new Date(meeting.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-5 h-5" />
                                                    <span className="font-medium">{meeting.issues.length} issue{meeting.issues.length !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-5 h-5" />
                                                    <span className="font-medium">AI Enhanced</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-4 ml-8'>
                                            <Link href={`/meetings/${meeting.id}`}>
                                                <Button size='lg' variant='outline' className="flex items-center gap-2 group-hover:border-blue-300 group-hover:text-blue-600 transition-all duration-300 hover:shadow-md">
                                                    <Eye className="w-5 h-5" />
                                                    View Details
                                                </Button>
                                            </Link>
                                            <Button 
                                                disabled={deleteMeeting.isPending} 
                                                size='lg' 
                                                variant='destructive' 
                                                onClick={() => handleDeleteMeeting(meeting.id, meeting.name)}
                                                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-md"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MeetingPage;