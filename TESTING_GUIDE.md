# Complete Testing Guide - Rommie App

## 🐛 Issues Fixed

### 1. **Database Schema Mismatch** ✅
- **Problem**: Old listings had `owner` field, new code uses `creator`
- **Fix**: Migration script to update all listings
- **Solution**: Run migration (instructions below)

### 2. **Null Creator Error** ✅
- **Problem**: `Cannot read properties of null (reading 'name')`
- **Fix**: Added null checks in frontend + filter null creators
- **Files Updated**: 
  - `frontend/app/(app)/home/page.tsx`
  - `backennd/routes/listings.js`

### 3. **Request System** ✅
- **Problem**: Using old `listing.owner` instead of `listing.creator`
- **Fix**: Updated all request routes
- **Files Updated**: `backennd/routes/requests.js`

### 4. **Light Theme** ✅
- **Complete**: All pages converted to beautiful pink/purple light theme

---

## 🚀 Setup & Run

### Step 1: Fix Database (IMPORTANT!)

Backend terminal mein run karo:

```bash
cd backennd

# Migration script run karo
node migrate-listings.js
```

**Output expected**:
```
✅ Connected to MongoDB
📋 Found X listings
✅ Updated listing ... - moved owner to creator
✅ Updated listing ... - added default listingType
📊 Migration Summary:
   Updated: X listings
   Deleted: X invalid listings
✅ Migration complete!
```

### Step 2: Restart Backend

```bash
# Backend restart karo
cd backennd
node index.js
```

**Should see**:
```
🚀 Backend running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
```

### Step 3: Run Frontend

```bash
cd frontend
npm run dev
```

**Open**: http://localhost:3000

---

## 🧪 Complete Testing Flow

### Test 1: Login/Signup ✅

1. Go to http://localhost:3000
2. Signup with new account
3. Complete profile (name, age, city, etc.)
4. Should redirect to home

**Expected**: User logged in, token saved

---

### Test 2: Create Owner Listing ✅

**Scenario**: Main ek room rent pe dena chahta hoon

1. Go to **Profile** → Click **"Create New Listing"**
2. Select **"I Have a Place"** (Owner mode)
3. Choose **"Room"** or **"Flat"**
4. Fill details:
   ```
   Rent: 8000
   Location: Koramangala, Bangalore
   Description: Spacious room with attached bathroom
   Gender Preference: Any
   Furnishing: Furnished
   Available From: [Select date]
   ```
5. Click **"Create Listing"**

**Expected**: 
- ✅ Listing created
- ✅ Shows in Profile under "Owner" tab
- ✅ Does NOT appear in your own feed

---

### Test 3: Create Buyer Listing ✅

**Scenario**: Mujhe flat chahiye

1. Go to **Profile** → Click **"Create New Listing"**
2. Select **"I Need a Place"** (Buyer mode)
3. Choose **"Flat"**
4. Fill details:
   ```
   Budget: 10000
   Location: HSR Layout, Bangalore
   Description: Looking for 2BHK flat near metro
   Gender Preference: Any
   Move In Date: [Select date]
   Occupation: Single
   ```
5. Click **"Create Listing"**

**Expected**:
- ✅ Listing created
- ✅ Shows in Profile under "Buyer" tab

---

### Test 4: Feed Logic ✅

#### As Buyer (Looking for place):

1. Go to **Home**
2. Click **"I Need a Place"** button
3. Should show **OWNER listings** (people offering flats/rooms)

**Expected**:
- ✅ See properties available
- ✅ Owner badges visible
- ✅ Your own listings NOT shown

#### As Owner (Have a place):

1. Stay on **Home**
2. Click **"I Have a Place"** button
3. Should show **BUYER listings** (people looking for flats/rooms)

**Expected**:
- ✅ See buyer requirements
- ✅ Buyer badges visible
- ✅ Your own listings NOT shown

---

### Test 5: Send Interest/Request ✅

**Scenario**: User1 (Buyer) interested in User2's (Owner) listing

#### User1 (Buyer):

1. Home → "I Need a Place" mode
2. See User2's owner listing
3. Click on listing card
4. Click **"Contact Owner"** button

**Expected**:
- ✅ Request sent
- ✅ Shows in "Requests → Sent" tab

#### User2 (Owner):

1. Go to **Requests** tab
2. Switch to **"Incoming"**
3. Should see User1's request

**Expected**:
- ✅ See request from User1
- ✅ Shows listing details
- ✅ Shows User1's profile (age, gender, city)
- ✅ Two buttons: "Reject" and "Accept"

---

### Test 6: Accept Request → Create Match ✅

#### User2 accepts:

1. **Requests → Incoming**
2. Click **"Accept"** on User1's request

**Expected**:
- ✅ Status changes to "Accepted"
- ✅ Shows in **Matches** tab

#### Both users check Matches:

1. Go to **Matches** tab (❤️ icon)

**Expected**:
- ✅ Both see the match
- ✅ "It's a Match!" badge
- ✅ Shows listing details
- ✅ Shows other person's profile
- ✅ "Chat Now" button (future feature)

---

### Test 7: Mutual Match Scenario ✅

**Scenario**: User1 likes User2's listing, User2 likes User1's listing

#### Setup:
- **User1**: Has owner listing (Room for ₹8000)
- **User2**: Has buyer listing (Looking for room)

#### Flow:

1. **User1** clicks on **User2's buyer listing** → Sends interest
2. **User2** goes to **Requests → Incoming** → Accepts User1
3. **User2** clicks on **User1's owner listing** → Sends interest  
4. **User1** goes to **Requests → Incoming** → Accepts User2

**Expected Result**:
- ✅ **Both** matches show in Matches tab
- ✅ Match for User1's listing
- ✅ Match for User2's listing
- ✅ Both users can see each other

---

## 📱 UI Testing Checklist

### Light Theme ✅
- [ ] Home page - Pink/Purple gradients
- [ ] Profile - Light background, colored badges
- [ ] Create Listing - All steps light theme
- [ ] Listing Detail - White cards
- [ ] Requests - Beautiful request cards
- [ ] Matches - Match celebration UI
- [ ] Navbar - White bottom bar

### Responsive ✅
- [ ] Mobile view (375px)
- [ ] Tablet view (768px)
- [ ] Desktop view (1024px+)

### Interactions ✅
- [ ] Mode toggle works smoothly
- [ ] Tabs switch correctly
- [ ] Buttons have hover effects
- [ ] Cards have shadow on hover
- [ ] Forms validate inputs

---

## 🔍 Debug Console Logs

### Home Page:
```javascript
console.log("Listings loaded:", data);
console.log("Mode:", mode);
```

**Check**:
- Listings array length
- Each listing has `creator` field
- `creator` is not null

### Requests:
```javascript
console.log("Incoming requests:", incoming);
console.log("Sent requests:", sent);
```

**Check**:
- Request has `sender`, `receiver`, `listing`
- All fields populated

### Matches:
```javascript
console.log("Matches:", matches);
```

**Check**:
- Only `status: "accepted"` requests
- Both users' info present

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read properties of null"

**Cause**: Old listings without `creator` field

**Solution**:
```bash
cd backennd
node migrate-listings.js
```

---

### Issue 2: Feed shows my own listings

**Cause**: Backend filter not working

**Check Backend Code**:
```javascript
// Should have this in /api/listings/feed
creator: { $ne: req.user.id }
```

---

### Issue 3: Request not sending

**Cause**: Wrong field name (`owner` vs `creator`)

**Check Backend Code**:
```javascript
// Should be:
receiver: listing.creator  // NOT listing.owner
```

---

### Issue 4: Matches not showing

**Cause**: No mutual accepted requests

**Steps**:
1. User A sends request to User B → Accept
2. Check Matches tab
3. Should show the match

---

## 📊 API Endpoints Reference

### Listings:
```
GET  /api/listings/feed?mode=buyer    → Owner listings
GET  /api/listings/feed?mode=owner    → Buyer listings
POST /api/listings                     → Create listing
GET  /api/listings/my                  → My listings
GET  /api/listings/:id                 → Single listing
```

### Requests:
```
POST /api/requests                     → Send interest
GET  /api/requests/incoming            → Incoming requests
GET  /api/requests/sent                → Sent requests
POST /api/requests/:id/status          → Accept/Reject
GET  /api/requests/matches             → All matches
```

### Auth:
```
POST /api/auth/signup                  → Register
POST /api/auth/login                   → Login
GET  /api/auth/me                      → Current user
PUT  /api/auth/me                      → Update profile
```

---

## 🎯 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Dual Mode (Buyer/Owner) | ✅ | Working perfectly |
| Smart Feed | ✅ | Shows opposite listings |
| Create Listings | ✅ | Both types supported |
| Send Interest | ✅ | Requests system |
| Accept/Reject | ✅ | Status management |
| Matches | ✅ | Shows accepted requests |
| Light Theme | ✅ | Pink/Purple design |
| Profile Tabs | ✅ | All/Owner/Buyer |
| Null Safety | ✅ | Proper error handling |

---

## 🚀 Next Steps (Optional Enhancements)

1. **Chat System** - Real-time messaging
2. **Notifications** - Push notifications for requests
3. **Search & Filters** - Location, budget, amenities
4. **Photo Upload** - Property images
5. **Reviews** - User ratings
6. **Verification** - ID verification badges
7. **Map View** - Location-based search

---

## 📞 Quick Reference

**Frontend**: http://localhost:3000  
**Backend**: http://localhost:5000  
**Health**: http://localhost:5000/api/health

**Colors**:
- Pink: `#ec4899` (Buyer mode)
- Purple: `#a855f7` (Owner mode)
- Black: `#000000` (Logout)

**Key Files**:
- Backend Routes: `/backennd/routes/`
- Frontend Pages: `/frontend/app/(app)/`
- Models: `/backennd/models/`
- Components: `/frontend/components/`

---

**Happy Testing! 🎉**

If still facing issues, check:
1. ✅ Backend running?
2. ✅ Frontend running?
3. ✅ Migration completed?
4. ✅ Browser console for errors?
5. ✅ Backend terminal for errors?
