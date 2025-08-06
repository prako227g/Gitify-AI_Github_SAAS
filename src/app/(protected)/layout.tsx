import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { AppSidebar } from './app-sidebar'
import { Toaster } from 'sonner'

type Props = {
    children: React.ReactNode
}

const SideBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
            </div>
            
            <AppSidebar />
            
            <main className='flex-1 flex flex-col min-w-0 relative z-10'>
                {/* Header */}
                <header className='sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-sm'>
                    <div className="flex h-16 items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <span className="text-white font-bold text-sm">G</span>
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                        Gitify
                                    </h1>
                                    <p className="text-xs text-gray-500 -mt-1 font-medium">AI-Powered Code Intelligence</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className='flex items-center gap-4'>
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200/50">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">Connected</span>
                            </div>
                            <div className="w-px h-6 bg-gray-200"></div>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 ring-2 ring-gray-100 shadow-sm hover:ring-blue-200 transition-all duration-200",
                                        userButtonPopoverCard: "shadow-xl border-0 rounded-xl",
                                        userButtonPopoverActionButton: "hover:bg-gray-50 rounded-lg transition-colors"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className='flex-1 overflow-auto'>
                    <div className="container mx-auto px-6 py-8 max-w-7xl">
                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
        
        <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderRadius: '12px',
                },
                className: 'rounded-xl',
            }}
        />
    </SidebarProvider>
  )
}

export default SideBarLayout