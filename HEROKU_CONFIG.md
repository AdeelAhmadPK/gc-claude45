# Heroku Configuration

## Required Environment Variables

Update these in Heroku Dashboard → Settings → Config Vars:

```bash
DATABASE_URL=postgresql://postgres.ehcdjulgoffjmcwhngih:Attahir@786786@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

NEXTAUTH_URL=https://task-managment-82499541fe28.herokuapp.com

NEXTAUTH_SECRET=23665061ee013d7156f458da467173952e915489835e8f833855ab197fe71c5a
```

## To update via CLI:

```bash
heroku config:set DATABASE_URL="postgresql://postgres.ehcdjulgoffjmcwhngih:Attahir@786786@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true" -a task-managment-82499541fe28

heroku config:set NEXTAUTH_URL="https://task-managment-82499541fe28.herokuapp.com" -a task-managment-82499541fe28
```

## Performance Improvements

The connection pooler (port 6543) provides:
- Faster connections
- Better connection management
- Improved performance under load
