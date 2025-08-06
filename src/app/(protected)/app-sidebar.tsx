'use client'

import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation, Github, Users, Sparkles, Zap, Brain, Mic } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard,
        description: "Overview and insights",
        color: "from-blue-500 to-indigo-500"
    },
    {
        title: 'Q&A',
        url: '/qa',
        icon: Bot,
        description: "Ask questions about code",
        color: "from-purple-500 to-pink-500"
    },
    {
        title: "Meetings",
        url: '/meetings',
        icon: Presentation,
        description: "Analyze meeting recordings",
        color: "from-green-500 to-emerald-500"
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard,
        description: "Manage subscription",
        color: "from-orange-500 to-red-500"
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { open } = useSidebar()
    const { projects, projectId, setProjectId } = useProject();

    return (
        <Sidebar collapsible="icon" variant="floating" className="border-r border-gray-200/50 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-lg">
            <SidebarHeader className="border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
                <div className='flex items-center gap-3 px-4 py-4'>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                            <div className="absolute -bottom-1 -left-1 h-2 w-2 bg-yellow-400 rounded-full border border-white animate-bounce"></div>
                        </div>
                        {open && (
                            <div>
                                <h1 className='text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent'>
                                    Gitify
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">AI Code Intelligence</p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarHeader>
            
            <SidebarContent className="px-3 py-6">
                {/* Navigation Menu */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link 
                                                href={item.url} 
                                                className={cn(
                                                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                                    isActive 
                                                        ? `bg-gradient-to-r ${item.color} text-white shadow-xl shadow-blue-500/25 transform scale-[1.02]` 
                                                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-lg hover:scale-[1.01]"
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                                                )}
                                                <div className={cn(
                                                    "flex items-center justify-center relative z-10",
                                                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                                                )}>
                                                    <item.icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <div className="font-semibold">{item.title}</div>
                                                    {open && (
                                                        <div className="text-xs opacity-70 truncate">{item.description}</div>
                                                    )}
                                                </div>
                                                {isActive && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-full"></div>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Projects Section */}
                <SidebarGroup className="mt-8">
                    <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {!projects ? (
                                // Loading state
                                Array.from({ length: 3 }).map((_, i) => (
                                    <SidebarMenuItem key={i}>
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <Skeleton className="h-8 w-8 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            ) : projects.length === 0 ? (
                                // Empty state
                                <SidebarMenuItem>
                                    <div className="px-4 py-8 text-center">
                                        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                                            <Github className="w-7 h-7 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2 font-medium">No projects yet</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">Create your first project to get started with AI-powered analysis</p>
                                    </div>
                                </SidebarMenuItem>
                            ) : (
                                // Projects list
                                projects.map(project => {
                                    const isSelected = project.id === projectId
                                    return (
                                        <SidebarMenuItem key={project.id}>
                                            <SidebarMenuButton asChild>
                                                <button
                                                    onClick={() => setProjectId(project.id)}
                                                    className={cn(
                                                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative",
                                                        isSelected 
                                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-lg transform scale-[1.02]" 
                                                            : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-md hover:scale-[1.01]"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 shadow-sm',
                                                        isSelected 
                                                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' 
                                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:shadow-md'
                                                    )}>
                                                        {project.name?.[0]?.toUpperCase() || 'P'}
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <div className="font-semibold truncate">{project.name}</div>
                                                        {open && (
                                                            <div className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                                                <Github className="w-3 h-3" />
                                                                {project.githubUrl ? project.githubUrl.split('/').slice(-2).join('/') : 'No URL'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full shadow-sm animate-pulse"></div>
                                                    )}
                                                </button>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })
                            )}
                            
                            {/* Create Project Button */}
                            <div className="mt-4">
                                <SidebarMenuItem>
                                    <Link href='/create' className="w-full">
                                        <Button 
                                            size='sm' 
                                            variant='outline' 
                                            className='w-full justify-start gap-2 h-11 rounded-2xl border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01] font-medium'
                                        >
                                            <Plus className="h-4 w-4" />
                                            {open && "Create Project"}
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>
                            </div>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Quick Stats */}
                {open && (
                    <div className="mt-8 px-1">
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-200/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-gray-700">Quick Stats</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Active Projects</span>
                                    <span className="font-semibold text-gray-900">{projects?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">AI Insights</span>
                                    <span className="font-semibold text-gray-900">∞</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SidebarContent>
        </Sidebar>
    )
}