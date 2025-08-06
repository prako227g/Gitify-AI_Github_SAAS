'use client'
import useProject from '@/hooks/use-project'
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ExternalLink, Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const CommitLog = () => {
  const {projectId,project}=useProject();
  const{data:commits}=api.project.getCommits.useQuery({projectId})

  const getSummaryStatus = (summary: string) => {
    if (summary === "Processing summary...") {
      return { status: 'processing', icon: Loader2, text: 'Processing summary...', className: 'text-blue-600' }
    } else if (summary.includes("Failed") || summary.includes("error")) {
      return { status: 'error', icon: AlertCircle, text: 'Summary failed', className: 'text-red-600' }
    } else if (summary === "No summary generated") {
      return { status: 'empty', icon: Clock, text: 'No summary available', className: 'text-gray-500' }
    } else {
      return { status: 'success', icon: CheckCircle, text: 'Summary ready', className: 'text-green-600' }
    }
  }

  return (
    <>
    <ul className='space-y-6'>
        {commits?.map((commit,commitIdx)=>{
            const summaryStatus = getSummaryStatus(commit.summary)
            const StatusIcon = summaryStatus.icon
            
            return <li key={commit.id} className='relative flex gap-x-4'>
                <div className={cn(
                    
                    commitIdx===commits.length-1 ?'h-6' : '-bottom-6',
                    'absolute left-0 top-0 flex w-6 justify-center'
                )}>
                
                <div className='w-px translate-x-1 bg-gray-200'></div>

                </div>
                <>
                <img src={commit.commitAuthorAvatar} alt='commit avatar' className='relative mt-4 size-8 flex-none rounded-full bg-gray-50 ' />
                <div className='flex-auto rounded-mg bg-white p-3 ring-1 ring-inset ring-gray-200 '>
                    <div className='flex justify-between gap-x-4'>
                        <Link target='_blank' href={`${project?.githubUrl}/commits/${commit.commitHash}`} className='py-0.5 text-xs leading-5 text-gray-500'>
                        <span className='font-medium text-gray-900 '>
                            {commit.commitAuthorName}

                        </span>
                        <span className='inline-flex items-center'>
                            Commited
                            <ExternalLink className='ml-1 size-4'/>

                        </span>
                    
                        </Link>

                        {/* Summary Status Indicator */}
                        <div className={cn('flex items-center gap-1 text-xs', summaryStatus.className)}>
                            <StatusIcon className={cn('w-3 h-3', summaryStatus.status === 'processing' && 'animate-spin')} />
                            <span>{summaryStatus.text}</span>
                        </div>

                    </div>
                     <span className='font-semibold'>
                    {commit.commitMessage}
                </span>
                
                {/* Summary Content */}
                <div className='mt-2'>
                    {summaryStatus.status === 'processing' ? (
                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            <span>AI is analyzing this commit...</span>
                        </div>
                    ) : summaryStatus.status === 'error' ? (
                        <div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md'>
                            <AlertCircle className='w-4 h-4' />
                            <span>Summary generation failed. Will retry automatically.</span>
                        </div>
                    ) : (
                        <pre className='whitespace-pre-wrap text-sm leading-6 text-gray-500'>
                            {commit.summary}
                        </pre>
                    )}
                </div>

                </div>
               
                </>

            </li>
        })}

    </ul>
    </>
  )
}

export default CommitLog