# Gitify - AI-Powered Code Analysis Platform

A modern, AI-powered platform for analyzing GitHub repositories, processing meeting recordings, and providing intelligent code insights.

## 🚀 Features

### Core Features
- **GitHub Integration**: Connect and analyze any GitHub repository
- **AI Code Analysis**: Ask questions about your codebase and get intelligent answers
- **Meeting Processing**: Upload and analyze meeting recordings with AI transcription
- **Commit Analysis**: Automatic analysis and summarization of Git commits
- **Team Collaboration**: Invite team members and share insights
- **Real-time Updates**: Live updates and notifications

### Technical Features
- **Modern UI/UX**: Beautiful, responsive design with professional styling
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Smooth loading animations and skeleton screens
- **Real-time Processing**: Background processing with progress indicators
- **Security**: Authentication with Clerk, secure API endpoints
- **Database**: PostgreSQL with Prisma ORM and vector embeddings

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma
- **AI Services**: Google Gemini, AssemblyAI
- **File Storage**: Firebase Storage
- **Payments**: Stripe
- **Real-time**: tRPC with React Query

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Git

## 🔧 Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-github
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/gitify"

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key

   # GitHub
   GITHUB_TOKEN=your_github_personal_access_token

   # File Storage (Firebase)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email

   # Payments (Stripe)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Key Improvements Made

### Error Handling & User Experience
- ✅ **Comprehensive Error Boundaries**: Added error boundary components to catch and handle errors gracefully
- ✅ **Enhanced Loading States**: Implemented skeleton screens and loading spinners throughout the app
- ✅ **Better Error Messages**: User-friendly error messages with actionable feedback
- ✅ **Form Validation**: Improved input validation with clear error states

### Meeting Management
- ✅ **Fixed Meeting Deletion**: Resolved foreign key constraint issues by properly deleting related issues first
- ✅ **Enhanced Upload Experience**: Better drag-and-drop interface with progress indicators
- ✅ **File Validation**: Improved file type and size validation with helpful error messages
- ✅ **Processing Status**: Real-time status updates during meeting processing

### UI/UX Enhancements
- ✅ **Modern Design System**: Implemented consistent design patterns with shadcn/ui
- ✅ **Responsive Layout**: Improved mobile and desktop responsiveness
- ✅ **Professional Styling**: Enhanced visual hierarchy and spacing
- ✅ **Interactive Elements**: Better hover states, transitions, and animations
- ✅ **Accessibility**: Improved keyboard navigation and screen reader support

### Code Quality
- ✅ **TypeScript Improvements**: Better type safety and error handling
- ✅ **Error Logging**: Comprehensive error logging for debugging
- ✅ **Performance Optimizations**: Improved loading times and data fetching
- ✅ **Code Organization**: Better file structure and component organization

### API & Backend
- ✅ **Enhanced API Routes**: Better error handling and validation in API endpoints
- ✅ **Database Transactions**: Proper transaction handling for data consistency
- ✅ **Rate Limiting**: Added rate limiting for external API calls
- ✅ **Security**: Improved authentication and authorization checks

## 🚀 Getting Started

1. **Create a Project**
   - Sign in to your account
   - Click "Create Project" in the sidebar
   - Enter your GitHub repository URL
   - Wait for the initial analysis to complete

2. **Ask Questions**
   - Navigate to the Dashboard
   - Use the "Ask a Question" card to query your codebase
   - Get AI-powered answers with code references

3. **Process Meetings**
   - Upload meeting recordings (MP3, WAV, M4A)
   - Get AI-generated transcripts and summaries
   - View meeting insights and action items

4. **Invite Team Members**
   - Share your projects with team members
   - Collaborate on code analysis and insights

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (protected)/       # Protected routes
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and services
├── server/              # tRPC server setup
└── trpc/                # tRPC client setup
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check your DATABASE_URL format
   - Run `npx prisma db push` to sync schema

2. **Authentication Issues**
   - Verify Clerk environment variables
   - Check domain configuration in Clerk dashboard

3. **File Upload Issues**
   - Ensure Firebase configuration is correct
   - Check file size limits (50MB max)
   - Verify supported file formats

4. **AI Service Issues**
   - Check API key configurations
   - Verify service quotas and limits
   - Check network connectivity

### Development Tips

- Use `npm run dev` for development
- Use `npm run build` to check for build errors
- Use `npm run lint` to check code quality
- Use `npm run typecheck` to verify TypeScript types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:
1. Check the troubleshooting section above
2. Review the documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ using Next.js, React, and AI technologies**

## 🚀 **Rate Limiting Solution**

### **Gemini API Rate Limiting**
The application includes a comprehensive rate limiting solution to handle Gemini API's free tier limitations:

- **Rate Limit**: 15 requests per minute (free tier)
- **Batch Processing**: Commits are processed in batches of 5 to avoid overwhelming the API
- **Delays**: 4-second delays between requests, 1-minute delays between batches
- **Retry Logic**: Exponential backoff with up to 3 retries for failed requests
- **Fallback Handling**: Graceful degradation when API limits are exceeded

### **Configuration**
Rate limiting settings can be adjusted in `src/lib/config.ts`:

```typescript
export const API_CONFIG = {
    GEMINI: {
        REQUESTS_PER_MINUTE: 15,
        DELAY_BETWEEN_REQUESTS: 4000, // 4 seconds
        MAX_RETRIES: 3,
        BASE_RETRY_DELAY: 2000, // 2 seconds
    },
    COMMITS: {
        MAX_COMMITS_PER_BATCH: 5,
        DELAY_BETWEEN_BATCHES: 60000, // 1 minute
        MAX_COMMITS_PER_POLL: 20,
    }
}
```

### **How It Works**
1. **Sequential Processing**: Commits are processed one by one instead of in parallel
2. **Batch Management**: Large commit sets are split into smaller batches
3. **Smart Delays**: Automatic delays between requests to respect rate limits
4. **Error Recovery**: Failed requests are retried with exponential backoff
5. **User Feedback**: Clear progress indicators and error messages

This ensures reliable commit processing even with API limitations while providing a smooth user experience.
