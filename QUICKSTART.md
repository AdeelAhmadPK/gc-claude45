# 🚀 Quick Start Guide - WorkOS Platform

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or later
- **PostgreSQL** 14.x or later (or use a cloud database)
- **npm** or **pnpm**

## Step 1: Install Dependencies

```bash
cd "c:\Users\Muhammad Adeel\Desktop\project1\gc-claude45"
npm install
```

## Step 2: Set Up Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE workos;
```

3. Update `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` and set:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/workos?schema=public"
```

### Option B: Cloud Database (Recommended for Quick Start)

Use a free cloud PostgreSQL service:

**Supabase (Recommended)**:
1. Go to [supabase.com](https://supabase.com/)
2. Create a free account
3. Create a new project
4. Go to Project Settings > Database
5. Copy the "Connection String" (Session mode)
6. Paste it in your `.env` file

**Neon**:
1. Go to [neon.tech](https://neon.tech/)
2. Sign up for free
3. Create a project
4. Copy the connection string
5. Paste it in `.env`

## Step 3: Configure Environment Variables

Edit `.env` file with your settings:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://..."

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage (Optional - for file uploads)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET_NAME=""

# Email (Optional - for notifications)
SENDGRID_API_KEY=""

# AI Features (Optional)
OPENAI_API_KEY=""
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Set Up Database Schema

Push the Prisma schema to your database:

```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Step 5: Run Development Server

Start the development server:

```bash
npm run dev
```

Your application will be available at: **http://localhost:3000**

## Step 6: Create Your First Account

1. Open http://localhost:3000
2. Click "Get Started" or navigate to http://localhost:3000/auth/signup
3. Create an account with:
   - Your name
   - Email address
   - Password (minimum 8 characters)
4. Sign in with your credentials
5. You'll be redirected to the dashboard!

## 📊 Database Management

### View Database (Prisma Studio)

Open Prisma Studio to view and edit your database:

```bash
npm run db:studio
```

This opens a visual database browser at http://localhost:5555

### Reset Database (if needed)

If you need to reset your database:

```bash
# WARNING: This deletes all data!
npm run db:push -- --force-reset
```

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- Check if PostgreSQL is running
- Verify your DATABASE_URL is correct
- Ensure the database exists

### Error: "Invalid credentials" when signing in
- Make sure you registered the account first
- Check if the password is at least 8 characters
- Try creating a new account

### Error: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 is already in use
```bash
# Run on a different port
npm run dev -- -p 3001
```

## 🎯 Next Steps

After your server is running:

1. **Create a Workspace**
   - Go to Dashboard
   - Click "New Workspace"
   - Name your workspace (e.g., "My Company")

2. **Create Your First Board**
   - Inside a workspace, click "Create Board"
   - Choose a template or start from scratch
   - Add columns, groups, and items

3. **Invite Team Members** (Coming soon)
   - Click "Invite" in workspace settings
   - Add email addresses
   - Assign roles

4. **Explore Features**
   - Try different views (Table, Kanban, Calendar)
   - Set up automations
   - Create dashboards
   - Track goals

## 📚 Key Features to Explore

### Boards
- **Multiple Views**: Table, Kanban, Calendar, Timeline (Gantt), Workload
- **20+ Column Types**: Status, People, Date, Files, Formula, and more
- **Groups & Items**: Organize work hierarchically
- **Subitems**: Break down tasks into smaller pieces

### Collaboration
- **Real-time Updates**: See changes instantly
- **Comments**: Discuss tasks with your team
- **@Mentions**: Notify specific team members
- **Activity Log**: Track all changes

### Automation (Coming Soon)
- **Visual Builder**: Create automations with no code
- **Triggers**: When status changes, date arrives, etc.
- **Actions**: Send notifications, create items, update fields

### Dashboards (Coming Soon)
- **Widgets**: Charts, numbers, timelines
- **Cross-board**: Aggregate data from multiple boards
- **Customizable**: Drag and drop layout

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting errors
```

## 📖 Project Structure

```
gc-claude45/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── workspaces/   # Workspace & board APIs
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Main app (protected routes)
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Sidebar, Header
│   ├── providers/        # Auth provider
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static files
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📝 Environment Setup for Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

## 🚀 Deployment (Production)

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Set Environment Variables in Vercel
- DATABASE_URL (from Supabase/Neon)
- NEXTAUTH_URL (your production URL)
- NEXTAUTH_SECRET (same as local)
- GOOGLE_CLIENT_ID (optional)
- GOOGLE_CLIENT_SECRET (optional)

## 🎉 You're All Set!

Your enterprise work management platform is ready to use. Start creating workspaces, boards, and collaborating with your team!

For questions or issues, check the main README.md file.

---

**Happy Building! 🚀**
