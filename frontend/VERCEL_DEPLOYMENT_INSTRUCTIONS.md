# Vercel Deployment Instructions

## ⚙️ Vercel Project Settings

### 1. Root Directory
Set the **Root Directory** to: `frontend`

### 2. Framework Preset
- Framework: **Next.js**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### 3. Environment Variables
Add the following environment variable:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://homiee.onrender.com` | Production, Preview |

### 4. Node.js Version (if needed)
If you face any version issues, set Node.js version to **20.x** in:
- Settings → General → Node.js Version → 20.x

## 🚀 Deployment Steps

1. **Connect GitHub Repository**
   - Go to Vercel Dashboard
   - New Project → Import Git Repository
   - Select your `homiee` repository

2. **Configure Project**
   - Root Directory: `frontend` ✅
   - Framework: Next.js (auto-detected) ✅
   - Build Command: Keep default ✅
   - Output Directory: Keep default ✅

3. **Add Environment Variables**
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` = `https://homiee.onrender.com`
   - Select: Production ✅ and Preview ✅

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live! 🎉

## 🔍 Troubleshooting 404 Errors

If you're getting 404 errors:

### ✅ Checklist:
- [ ] Root directory is set to `frontend` in Vercel settings
- [ ] Environment variable `NEXT_PUBLIC_API_URL` is added
- [ ] Build completed successfully (check deployment logs)
- [ ] All pages show ✓ in build output
- [ ] Next.js 14 is in package.json

### Common Fixes:

1. **Clear Build Cache**
   - Vercel Dashboard → Your Project → Settings → General
   - Scroll to "Build & Development Settings"
   - Click "Clear Cache" and redeploy

2. **Redeploy**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

3. **Check Deployment Logs**
   - Click on the deployment
   - Check "Building" tab for any errors
   - All pages should show ○ or λ symbols

4. **Verify Root Directory**
   - Settings → General → Root Directory
   - Should be: `frontend` (not empty, not `/`)

## 📁 Project Structure on Vercel

```
homiee/                     # GitHub repo root
├── frontend/               # ← Root Directory (set this in Vercel)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── next.config.js
│   ├── package.json
│   └── vercel.json         # ← Configuration file
├── backennd/
└── other files
```

## 🎯 Expected Build Output

Your build should show something like:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    782 B            85 kB
├ ○ /login                               1.42 kB          85.6 kB
├ ○ /signup                              767 B            84.9 kB
├ ○ /home                                4.32 kB          95.3 kB
...
└ ○ /requests                            5.08 kB          96.1 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand
```

## ✅ Success Indicators

After deployment, you should see:
- ✅ Build completed successfully
- ✅ Deployment completed
- ✅ No errors in runtime logs
- ✅ Homepage loads (redirects to /login or /home)
- ✅ API calls go to https://homiee.onrender.com

## 🔗 Useful Links

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Next.js Guide](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Note:** After adding environment variables, you MUST redeploy for changes to take effect!
