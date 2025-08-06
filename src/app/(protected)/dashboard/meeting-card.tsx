'use client';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload, AlertCircle, CheckCircle, Sparkles, Mic, Brain } from 'lucide-react'
import React from 'react'
import {useDropzone} from 'react-dropzone'
import {CircularProgressbar,buildStyles} from 'react-circular-progressbar'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MeetingCard = () => {
  const {project}=useProject()
  const [progress,setProgress]=React.useState(0)
  const [isUploading,setIsUploading]=React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const uploadMeeting = api.project.uploadMeeting.useMutation()
  const router=useRouter();

  const processMeeting=useMutation({
    mutationFn:async(data:{meetingUrl:string,meetingId:string,projectId:string})=>{
      const {meetingUrl,meetingId,projectId}=data
      const response=await axios.post('/api/process-meeting',{meetingUrl,meetingId,projectId})
      return response.data
    },
    onError: (error) => {
      console.error('Process meeting error:', error)
      toast.error('Failed to process meeting. Please try again.')
    }
  })

  const {getRootProps,getInputProps, isDragActive} = useDropzone({
    accept:{
        'audio/*':['.mp3','.wav','.m4a']
    },
    multiple:false,
    maxSize:50_000_000,
    onDrop: async acceptedFiles=>{
        if(!project) {
          toast.error('No project selected')
          return 
        }
        
        setIsUploading(true)
        setUploadError(null)
        console.log(acceptedFiles)
        const file=acceptedFiles[0]
        if(!file) return 
        
        try {
          const downloadURL=await uploadFile(file as File,setProgress) as string
          
          uploadMeeting.mutate({
            projectId: project.id,
            meetingUrl:downloadURL,
            name : file.name
          },{
            onSuccess:(meeting)=>{
              toast.success("Meeting uploaded successfully! Processing will begin shortly.")
              router.push('/meetings')
              processMeeting.mutateAsync({
                meetingUrl:downloadURL,
                meetingId: meeting.id, 
                projectId:project.id
              })
            },
            onError:(error)=>{
              console.error('Upload meeting error:', error)
              toast.error("Failed to upload meeting. Please try again.")
              setUploadError('Failed to upload meeting. Please check your file and try again.')
            }
          })
        } catch (error) {
          console.error('File upload error:', error)
          toast.error('Failed to upload file. Please try again.')
          setUploadError('Failed to upload file. Please check your internet connection and try again.')
        } finally {
          setIsUploading(false)
          setProgress(0)
        }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection && rejection.errors[0]?.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 50MB.')
      } else if (rejection && rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload an audio file (.mp3, .wav, .m4a).')
      } else {
        toast.error('File upload failed. Please try again.')
      }
    }
  })

  return (
    <Card className='col-span-2 flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl'>
      {uploadError && (
        <Alert variant="destructive" className="mb-6 w-full max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      {!isUploading && (
        <div className="text-center space-y-6">
          <div className="relative mb-8">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center transition-all duration-500 ${
              isDragActive ? 'bg-gradient-to-br from-blue-500 to-indigo-500 scale-110 shadow-2xl shadow-blue-500/30' : 'bg-gradient-to-br from-blue-100 to-indigo-100 shadow-xl'
            }`}>
              <Mic className={`h-10 w-10 transition-all duration-500 ${
                isDragActive ? 'text-white scale-110' : 'text-blue-600'
              }`} />
            </div>
            {isDragActive && (
              <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-blue-400 animate-pulse bg-blue-50/50"></div>
            )}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              {isDragActive ? 'Drop your meeting file here' : 'Upload Meeting Recording'}
            </h3>
            
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              {isDragActive 
                ? 'Release to upload and analyze your meeting with AI'
                : 'Drag and drop your meeting recording to get AI-powered transcription, insights, and action items.'
              }
            </p>
          </div>
          
          <div className="space-y-6">
            <Button 
              disabled={isUploading} 
              className="w-full max-w-xs h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              {...getRootProps()}
            >
              <Upload className="mr-3 h-5 w-5" />
              {isDragActive ? 'Drop File' : 'Upload Meeting'}
              <input className='hidden' {...getInputProps()} />
            </Button>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>AI Transcription</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Smart Insights</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Supported formats: MP3, WAV, M4A</p>
                <p>Maximum file size: 50MB</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center space-y-6">
          <div className="mb-8">
            <CircularProgressbar 
              value={progress} 
              text={`${progress}%`} 
              className='w-24 h-24 mx-auto' 
              styles={buildStyles({
                pathColor: '#3b82f6',
                textColor: '#3b82f6',
                trailColor: '#e5e7eb',
                strokeLinecap: 'round',
              })}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              Processing your meeting
            </h3>
            
            <p className="text-gray-600 text-lg">
              Please wait while we upload and prepare your file for AI analysis...
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Uploading...</span>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <span>Processing...</span>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            <span>Analyzing...</span>
          </div>
        </div>
      )}
    </Card>
  )
}

export default MeetingCard