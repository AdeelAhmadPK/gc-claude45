# Heroku Deployment Guide

## Prerequisites
- Heroku CLI installed
- PostgreSQL database (Heroku Postgres or Supabase)

## Required Environment Variables

Set these on Heroku:

```bash
# Database
heroku config:set DATABASE_URL="your-postgresql-url"

# NextAuth - REQUIRED
heroku config:set NEXTAUTH_URL="https://your-app-name.herokuapp.com"
heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Optional: Google OAuth
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id"
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Deployment Steps

### 1. Create Heroku App
```bash
heroku create your-app-name
```

### 2. Add PostgreSQL Database
```bash
# Option 1: Heroku Postgres
heroku addons:create heroku-postgresql:mini

# Option 2: Use external database (Supabase)
heroku config:set DATABASE_URL="your-supabase-postgres-url"
```

### 3. Set Environment Variables
```bash
heroku config:set NEXTAUTH_URL="https://your-app-name.herokuapp.com"
heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

### 4. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 5. Run Database Migration
```bash
heroku run npx prisma db push
```

## Verify Deployment

Check logs:
```bash
heroku logs --tail
```

Open app:
```bash
heroku open
```

## Troubleshooting

### 500 Error on Signup
- Verify DATABASE_URL is set: `heroku config:get DATABASE_URL`
- Check if Prisma generated: `heroku run npx prisma generate`
- Run migration: `heroku run npx prisma db push`
- Check logs: `heroku logs --tail`

### Build Failures
- Ensure `postinstall` script is in package.json
- Verify all dependencies are in `dependencies` (not `devDependencies`)
- Check Node version in package.json engines

## Important Notes

1. **Prisma Client Generation**: The `postinstall` script automatically runs `prisma generate` after `npm install`

2. **Build Process**: The build script includes `prisma generate && next build`

3. **Database Sync**: After deployment, always run:
   ```bash
   heroku run npx prisma db push
   ```

4. **Environment**: Make sure NODE_ENV is not set to "development" on Heroku

## Update Deployment

```bash
git add .
git commit -m "Update"
git push heroku main
```
