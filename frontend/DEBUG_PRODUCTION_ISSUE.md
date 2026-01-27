# Debug Production Routing Issue

## 🐛 Issue
Clicking on listing cards or "View Details" redirects back to home page in production, but works fine locally.

## 🔍 Debug Steps After Deployment

### Step 1: Check Browser Console Logs

After deploying, open your Vercel app and **open browser console** (F12 → Console tab):

1. **Go to home page** and check console for:
   ```
   [Auth Check] { token: "exists", pathname: "/home", ... }
   [Auth] Token found, user authenticated
   ```

2. **Click on a listing card** and watch console for:
   ```
   [Auth Check] { token: "exists", pathname: "/listing/...", ... }
   [Listing] Loading listing ID: ...
   [API] Fetching: GET https://homiee.onrender.com/api/listings/...
   [API] Success: GET https://homiee.onrender.com/api/listings/...
   [Listing] Data loaded successfully: { listingId: ..., rent: ... }
   ```

3. **If you see errors**, note them down:
   ```
   [API] Error: ... 
   [Listing] Failed to load listing: { error: "...", id: "..." }
   ```

### Step 2: Common Issues & Solutions

#### Issue A: Environment Variable Not Set
**Console shows:**
```
[API] Fetching: GET http://localhost:5000/api/listings/...
[API] Fetch error: Failed to fetch
```

**Solution:**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Check if `NEXT_PUBLIC_API_URL` = `https://homiee.onrender.com` exists
3. If missing, add it:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://homiee.onrender.com`
   - Environment: Production ✅ Preview ✅
4. **Redeploy** (important! env changes need redeploy)

#### Issue B: Backend CORS Issue
**Console shows:**
```
Access to fetch at 'https://homiee.onrender.com/api/listings/...' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:**
Backend needs to allow your Vercel domain. Check `backennd/index.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',  // Add this
    'https://*.vercel.app'  // Or allow all Vercel
  ],
  credentials: true
}));
```

#### Issue C: Backend Not Responding
**Console shows:**
```
[API] Fetch error: Failed to fetch
```

**Check:**
1. Is backend deployed and running? Visit: `https://homiee.onrender.com/api/listings`
2. Should return JSON (not error page)
3. Check Render.com logs for backend errors

#### Issue D: Token Issue
**Console shows:**
```
[Auth Check] { token: "missing", pathname: "/listing/..." }
[Auth] No token, redirecting to login
```

**Solution:**
Token is getting cleared. Check:
1. Browser localStorage → Should have `rommie_token`
2. If missing after page load, auth is clearing it incorrectly
3. Try logging out and logging back in

#### Issue E: Still Redirecting After Auth Check
**Console shows:**
```
[Auth Check] { token: "exists" }
[Auth] Token found, user authenticated
[Listing] Loading listing ID: ...
// Then immediate redirect
```

**This fix added:**
- Increased delay from 100ms → 200ms in layout auth check
- Added `hasMounted` check to prevent premature auth checks
- Better error handling in listing page

### Step 3: Test Specific Pages

After deployment, test each scenario:

1. **Home → Listing Detail:**
   - Click any listing card
   - Should stay on `/listing/{id}` 
   - Should NOT redirect to `/home`

2. **Matches → View Details:**
   - Go to Matches page
   - Click "View Details" on any listing
   - Should open listing detail page

3. **Matches → Chat:**
   - Click "Chat" button
   - Should open `/chat/{matchId}`
   - Should NOT redirect

### Step 4: Manual API Test

Test backend directly in browser:

1. **Open new tab**
2. **Paste:** `https://homiee.onrender.com/api/listings`
3. **Should see:** JSON array of listings
4. **If error:** Backend has issues

### Step 5: Compare Local vs Production

**Local (Working):**
```
API URL: http://localhost:5000
Token: rommie_token from localStorage
Auth: Works
Listing: Loads correctly
```

**Production (Check These):**
```
API URL: https://homiee.onrender.com (verify in console logs)
Token: rommie_token exists? (check localStorage)
Auth: Token validated?
Listing: API call succeeds?
```

## 🔧 Latest Fixes Applied

### 1. Layout Auth Check (app/(app)/layout.tsx)
- ✅ Added `hasMounted` state to ensure client-side mount first
- ✅ Increased delay to 200ms for hydration
- ✅ Added extensive logging for debugging
- ✅ Prevents premature redirects

### 2. Listing Page (app/(app)/listing/[id]/page.tsx)
- ✅ Better error handling
- ✅ Shows error message before redirect
- ✅ 2 second delay before redirect (so user sees error)
- ✅ Added detailed logging

### 3. API Client (lib/api.ts)
- ✅ Logs every API call with URL
- ✅ Logs success/failure
- ✅ Shows actual API URL being called
- ✅ Helps identify environment variable issues

## 📊 Expected Console Output (Production)

**Successful Flow:**
```
[Auth Check] { token: "exists", pathname: "/home", ... }
[Auth] Token found, user authenticated

// Click listing
[Auth Check] { token: "exists", pathname: "/listing/123", ... }  
[Auth] Token found, user authenticated
[Listing] Loading listing ID: 123
[API] Fetching: GET https://homiee.onrender.com/api/listings/123
[API] Success: GET https://homiee.onrender.com/api/listings/123
[Listing] Data loaded successfully: { listingId: "123", rent: 5000 }
```

**Failed Flow (will help diagnose):**
```
[Auth Check] { token: "exists", pathname: "/listing/123", ... }
[Auth] Token found, user authenticated  
[Listing] Loading listing ID: 123
[API] Fetching: GET http://localhost:5000/api/listings/123  ← WRONG URL!
[API] Fetch error: { message: "Failed to fetch", url: "...", ... }
[Listing] Failed to load listing: { error: "...", id: "123" }
```

## ✅ Testing Checklist

After deployment:

- [ ] Open browser console (F12)
- [ ] Check logs show correct API URL (`https://homiee.onrender.com`)
- [ ] Check token exists in localStorage
- [ ] Click on listing card
- [ ] Watch console logs (should NOT show errors)
- [ ] Page should stay on `/listing/{id}` (NO redirect)
- [ ] Listing details should load
- [ ] Test matches → view details
- [ ] Test matches → chat
- [ ] All should work without redirects

## 🚀 Deployment Command

```bash
git add .
git commit -m "Fix: Add extensive logging and improve auth/routing stability"
git push
```

## 📝 Report Back

After deploying, please share:
1. **Browser console logs** (copy-paste entire log)
2. **Which step fails** (auth check? API call? redirect?)
3. **Any error messages** in console

This will help identify the exact issue! 🎯
