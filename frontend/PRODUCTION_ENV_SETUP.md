# Production Environment Setup

## Critical: Set Environment Variables in Vercel

The app will NOT work in production without these environment variables set in Vercel dashboard.

### Required Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add the following variable:

#### NEXT_PUBLIC_API_URL
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: Your backend API URL (e.g., `https://your-backend-domain.com`)
- **Environments**: Production, Preview, Development

**Example Values:**
- Heroku: `https://your-app-name.herokuapp.com`
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`
- Custom domain: `https://api.yourdomain.com`

⚠️ **Important**: Do NOT include `/api` at the end of the URL. The code will add it automatically.

### After Adding Environment Variables

1. Redeploy your application:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

2. The environment variables will be available in the new deployment

### Verify Configuration

After deployment, check browser console for:
```
[API Config] { API_URL: 'your-backend-url', BASE_URL: 'your-backend-url/api' }
```

If you see an empty string or localhost in production, the environment variable is not set correctly.

### Common Issues

**Issue**: "API URL not configured" error in production
**Solution**: Make sure `NEXT_PUBLIC_API_URL` is set in Vercel environment variables and you've redeployed

**Issue**: CORS errors in production  
**Solution**: Make sure your backend's CORS configuration includes your Vercel frontend URL

**Issue**: 401 Unauthorized errors on every page
**Solution**: Check that authentication token is being saved correctly in localStorage
