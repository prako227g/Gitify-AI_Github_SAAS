'use client'
import React from 'react'
import { useUser } from '@clerk/nextjs'
import useProject from '@/hooks/use-project'
import { ExternalLink, Github, AlertCircle, Loader2, TrendingUp, Users, Clock, GitBranch, Sparkles, Zap, Activity, Target } from 'lucide-react';
import Link from 'next/link';
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import ArchiveButton from './archive-button';
import InviteButton from './invite-button';
import TeamMembers from './team-members';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge as UIBadge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/trpc/react';

const DashboardPage = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { project } = useProject();
  
  // Poll commits mutation
  const pollCommitsMutation = api.project.pollCommits.useMutation({
    onSuccess: (data) => {
      if ('message' in data && data.message) {
        toast.success(data.message, {
          description: "You can view commits immediately while AI generates summaries in the background.",
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to fetch commits", {
        description: error.message,
      });
    }
  });

  // Auto-poll commits when project changes
  React.useEffect(() => {
    if (project?.id) {
      // Poll commits every 30 seconds
      const interval = setInterval(() => {
        pollCommitsMutation.mutate({ projectId: project.id });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [project?.id, pollCommitsMutation]);

  if (!userLoaded) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 shadow-lg">
          <CardContent className="p-16 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
              <Github className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Project Selected</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              Please select a project from the sidebar or create a new one to get started with AI-powered code analysis and insights.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
                <Users className="w-4 h-4 mr-2" />
                Team Collaboration
              </UIBadge>
              <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                AI Insights
              </UIBadge>
              <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
                <GitBranch className="w-4 h-4 mr-2" />
                Git Integration
              </UIBadge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'Developer'}! 👋
              </h1>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              Here's what's happening with your project today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <UIBadge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Active & Connected
            </UIBadge>
          </div>
        </div>

        {/* Project Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50 shadow-xl">
          <CardContent className="p-8">
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-6'>
                <div className="relative">
                  <div className="w-fit rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 shadow-xl shadow-blue-500/25">
                    <Github className='size-7 text-white'/>
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
                <div className='flex-1 min-w-0'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                    {project.name}
                  </h2>
                  <p className='text-gray-600 mb-3 text-lg'>
                    Connected to GitHub repository
                  </p>
                  <Link 
                    href={project?.githubUrl ?? ""} 
                    className='inline-flex items-center text-blue-600 hover:text-blue-700 text-base font-medium transition-colors hover:underline'
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project?.githubUrl}
                    <ExternalLink className='ml-2 size-5' />
                  </Link>
                </div>
              </div>
              
              <div className='flex items-center gap-4'>
                <TeamMembers/>
                <InviteButton/>
                <ArchiveButton/>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Commits</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">AI Insights</p>
                  <p className="text-2xl font-bold text-gray-900">∞</p>
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
                  <p className="text-sm text-gray-600 font-medium">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Performance</p>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className="lg:col-span-2">
          <AskQuestionCard/>
        </div>
        <div>
          <MeetingCard />
        </div>
      </div>

      {/* Commit Log Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-lg">
              <GitBranch className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Commits</h2>
              <p className="text-gray-600">Latest changes and updates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UIBadge variant="outline" className="text-sm px-4 py-2 bg-white/50 backdrop-blur-sm">
              <Clock className="w-4 h-4 mr-2" />
              Auto-updating
            </UIBadge>
            <button
              onClick={() => {
                if (project?.id) {
                  pollCommitsMutation.mutate({ projectId: project.id });
                  toast.info("Checking for new commits...", {
                    description: "This will fetch new commits immediately.",
                  });
                }
              }}
              disabled={pollCommitsMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pollCommitsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Refresh Commits
            </button>
          </div>
        </div>
        <Card className="border-gray-200/50 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <CommitLog />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage