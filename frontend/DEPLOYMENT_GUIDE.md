# Deployment Guide

## Environment Variables Setup

### Local Development
The project is already configured for local development. The `.env.local` file contains:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This means your frontend will connect to your local backend at `localhost:5000` when running `npm run dev`.

### Production Deployment (Vercel)

When deploying to Vercel, you need to set the environment variable to point to your production backend:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://homiee.onrender.com`
   - **Environment:** Production (and Preview if you want)

4. Redeploy your application for changes to take effect

### How It Works

- **Local development:** Uses `http://localhost:5000` from `.env.local`
- **Production (Vercel):** Uses `https://homiee.onrender.com` from Vercel environment variables
- **Fallback:** If no environment variable is set, defaults to `http://localhost:5000`

### Verifying the Setup

After deployment, you can verify the API URL is correctly set by:
1. Opening browser console on your deployed site
2. Check network requests - they should go to `https://homiee.onrender.com/api/...`

### Files Updated

All fetch calls now use environment variables:

- `frontend/lib/api.ts` - Main API client
- `frontend/app/lib/api.ts` - Alternative API client  
- `frontend/lib/socket.ts` - Socket.io connection
- `frontend/components/ProfilePictureUpload.tsx` - Image upload
- `frontend/app/create/page.tsx` - Create listing page
- `frontend/app/listings/page.tsx` - Listings page
- `frontend/app/my-listings/page.tsx` - My listings page
- `frontend/app/signup/page.tsx` - Signup page
- `.env.local` - Local development environment variables
- `.env.example` - Template for environment variables

### Important Notes

- `.env.local` is gitignored and won't be committed
- Always use `NEXT_PUBLIC_` prefix for environment variables that need to be exposed to the browser
- After adding environment variables in Vercel, you must redeploy for changes to take effect
