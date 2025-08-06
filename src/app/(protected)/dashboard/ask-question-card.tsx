'use client'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project'
import Image from 'next/image';
import React from 'react'
import { askQuestion } from './actions';
import { readStreamableValue } from '@ai-sdk/rsc';
import CodeReferences from './code-references';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Send, Save, X, AlertCircle, Loader2, Sparkles, Brain, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [filesReferences, setFileReferences] = React.useState<{fileName: string;sourceCode:string;summary:string}[]>([])
    const [answer, setAnswer] = React.useState('')

    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!project?.id) {
            toast.error('No project selected')
            return 
        }
        
        if (!question.trim()) {
            toast.error('Please enter a question')
            return
        }

        setAnswer('')
        setFileReferences([])
        setError(null)
        setLoading(true)
        setOpen(true)

        try {
            const { output, filesReferences } = await askQuestion(question, project.id)
            setFileReferences(filesReferences as {fileName: string;sourceCode:string;summary:string}[])

            for await (const delta of readStreamableValue(output)) {
                if (delta) {
                    setAnswer(ans => ans + delta)
                }
            }
        } catch (err) {
            console.error('Ask question error:', err)
            setError('Failed to get answer. Please try again.')
            toast.error('Failed to get answer. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveAnswer = async () => {
        if (!project?.id || !answer.trim()) {
            toast.error('No answer to save')
            return
        }

        try {
            await saveAnswer.mutateAsync({
                projectId: project.id,
                question,
                answer,
                filesReferences
            })
            toast.success('Answer saved successfully!')
            refetch()
            setOpen(false)
        } catch (err) {
            console.error('Save answer error:', err)
            toast.error('Failed to save answer. Please try again.')
        }
    }

    const refetch = useRefetch()

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-xl'>
                    <DialogHeader className="flex-shrink-0">
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                                        AI Code Assistant
                                    </DialogTitle>
                                    <p className="text-sm text-gray-500">Powered by advanced AI analysis</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    disabled={saveAnswer.isPending || loading} 
                                    variant='outline' 
                                    size="lg"
                                    onClick={handleSaveAnswer}
                                    className="flex items-center gap-2 hover:shadow-md transition-all duration-300"
                                >
                                    {saveAnswer.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save Answer
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="lg"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-hidden flex flex-col gap-6">
                        {error && (
                            <Alert variant="destructive" className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex-1 overflow-auto">
                            {loading && !answer && (
                                <div className="space-y-6 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                            <Brain className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">Analyzing your codebase...</div>
                                    </div>
                                    <div className="space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-5/6" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                </div>
                            )}
                            
                            {answer && (
                                <div className="p-6">
                                    <MDEditor.Markdown 
                                        source={answer} 
                                        className='max-w-full !h-full overflow-auto prose prose-lg max-w-none'
                                    />
                                </div>
                            )}
                        </div>
                        
                        {filesReferences.length > 0 && (
                            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50/50">
                                <CodeReferences filesReferences={filesReferences}/>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            
            <Card className='relative col-span-3 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-200/50'>
                <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                                Ask AI Assistant
                            </CardTitle>
                            <p className="text-gray-600 mt-1">Get intelligent answers about your codebase</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label htmlFor="question" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                What would you like to know about your codebase?
                            </label>
                            <Textarea 
                                id="question"
                                placeholder='e.g., Which file should I edit to change the home page? How do I add a new API endpoint? What is the authentication flow?'
                                value={question} 
                                onChange={e => setQuestion(e.target.value)}
                                className="min-h-[120px] resize-none text-lg border-gray-200 focus:border-purple-300 focus:ring-purple-200 transition-all duration-300"
                                disabled={loading}
                            />
                        </div>
                        
                        <Button 
                            type='submit' 
                            disabled={loading || !question.trim()}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                    Analyzing Codebase...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-3" />
                                    Ask AI Assistant
                                </>
                            )}
                        </Button>
                        
                        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <span>Smart Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                <span>Instant Answers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                <span>Code References</span>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard