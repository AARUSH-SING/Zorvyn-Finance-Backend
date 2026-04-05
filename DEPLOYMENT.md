# Deployment Guide - Zorvyn Finance Backend

## Part 1: Push to GitHub

### Step 1: Initialize Git Locally
```bash
cd zorvyn-backend
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Create .gitignore (if not exists)
Create a file named `.gitignore` in project root:
```
node_modules/
dist/
.env
.env.local
dev.db
test.db
*.log
.DS_Store
.vscode/
.idea/
```

### Step 3: Add All Files
```bash
git add .
git commit -m "Initial commit: Zorvyn Finance Backend with auth, RBAC, and dashboard"
```

### Step 4: Create Repository on GitHub
1. Go to [github.com](https://github.com) and sign in
2. Click **+** icon → **New repository**
3. Name it: `zorvyn-finance-backend`
4. Add description: "Secure, role-based finance data processing backend"
5. Choose **Public** (for easy sharing) or **Private**
6. **Don't** initialize with README (we have one)
7. Click **Create repository**

### Step 5: Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zorvyn-finance-backend.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## Part 2: Live Hosting Options


### **Render (Good Free Tier)**    

#### Setup:
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: zorvyn-finance-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build && npm run db:migrate && npm run db:seed`
   - **Start Command**: `npm start`

#### Environment Variables:
- Add all variables from Railway section above

#### Deploy:
- Click **Create Web Service**
- Deployment takes ~3-5 minutes
- URL: `https://zorvyn-finance-backend-1-99fv.onrender.com` --> My Deployment Link

---


## Part 3: Database for Production

### Local SQLite (Current Setup)
- ✅ Works with Railway/Render
- ⚠️ Not ideal for concurrent users
- ✅ No extra cost

### PostgreSQL (Recommended for Production)

#### Using Railway PostgreSQL:
1. In Railway project dashboard, click **+ New**
2. Select **PostgreSQL**
3. It auto-creates connection string
4. Update `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   ```
5. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
6. Remove adapter from schema:
   ```prisma
   // OLD: 
   adapter = "sqlite"  // REMOVE THIS
   
   // Just use provider = "postgresql"
   ```

---

## Part 4: Pre-Deployment Checklist

Before pushing live:

- [ ] Update `.env.example` with all required variables
- [ ] Test locally: `npm run dev` & `npm test`
- [ ] Ensure `.gitignore` excludes `.env` and `*.db`
- [ ] Remove any hardcoded secrets from code
- [ ] Test production build: `npm run build && npm start`
- [ ] Update `JWT_SECRET` to a strong random string (min 32 chars)
- [ ] Set `PORT` environment variable (not hardcoded)

---

## Part 5: Post-Deployment Testing

Once deployed:

### Test Health Endpoint
```bash
curl https://your-domain.railway.app/health
```

Expected:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test Login
```bash
curl -X POST https://your-domain.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zorvyn.dev","password":"Admin@123"}'
```

### Test Dashboard
```bash
# Use JWT token from login response
curl https://your-domain.railway.app/api/v1/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Part 6: Monitoring & Logs

### Railway
- Dashboard shows real-time logs
- Click on service → **View Logs**

### Render
- Dashboard shows deployment logs
- Click on service → **Logs** tab

### Helpful Commands
```bash
# View production logs
heroku logs --tail

# Check environment variables
heroku config

# Deploy specific branch
git push heroku your-branch:main
```

---

## Part 7: CI/CD (Optional - Auto-Deploy)**

All platforms above auto-deploy on push to main. To customize:

### Create `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## Summary

**Quickest Path to Live:**

1. Push to GitHub: 5 minutes
2. Deploy on Render: 2~5 minutes
3. Test endpoints: 5 minutes

**Total: ~12 minutes from now**


