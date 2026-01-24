# Rommie - Dual-Mode Rental Platform

## 🎯 Concept

Rommie ek unique rental platform hai jahan:
- **Buyer**: जिसे flat/room चाहिए (requirement post करता है)
- **Owner**: जिसके पास flat/room है (property list करता है)
- **Ek user dono ho sakta hai** - आज buyer, कल owner!

---

## 🏗️ Architecture Overview

### Frontend Structure
```
frontend/app/
├── (app)/
│   ├── home/              # Main feed with buyer/owner mode toggle
│   ├── profile/           # User profile with all listings
│   └── listing/[id]/      # Detailed listing view
├── create-listing/        # Unified listing creation flow
└── ...
```

### Backend Structure
```
backennd/
├── models/
│   ├── User.js           # User accounts
│   ├── Listing.js        # Owner & Buyer listings
│   └── Request.js        # Connection requests
└── routes/
    ├── auth.js
    ├── listings.js       # Listing CRUD + Feed logic
    └── requests.js
```

---

## 📱 User Flows

### Flow 1: Buyer Looking for Place
```
1. Home page → "I Need a Place" button click
2. Feed shows OWNER listings (available properties)
3. User can click any listing to view details
4. User can also create their own BUYER listing
   - Stating requirements (budget, location, preferences)
   - Other owners will see this
```

### Flow 2: Owner Having Place
```
1. Home page → "I Have a Place" button click
2. Feed shows BUYER listings (people looking)
3. User can click any listing to connect
4. User can create their own OWNER listing
   - Property details, rent, furnishing
   - Other buyers will see this
```

### Flow 3: User in Both Roles
```
Profile page shows:
- All Listings tab
- Owner Listings tab (properties user has)
- Buyer Listings tab (requirements user posted)

User can switch modes on home page anytime!
```

---

## 🎨 UI Components

### Home Page - Mode Selector
```
┌─────────────────────────────────────┐
│  [🏠 I Need a Place] [📋 I Have]    │  ← Toggle buttons
├─────────────────────────────────────┤
│  Available Properties (23)          │  ← Dynamic heading
├─────────────────────────────────────┤
│  ┌────────────────────────────┐    │
│  │ ₹8000  [Room • Available]  │    │
│  │ 📍 Koramangala             │    │
│  │ Furnished 2BHK...          │    │
│  │ By Rahul • 25y • Male      │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Create Listing - Step 1
```
┌─────────────────────────────────────┐
│    What do you want to do?          │
├─────────────────────────────────────┤
│  ┌───────────────────────────┐     │
│  │ 🏠 I Have a Place         │     │
│  │ I have room/flat to rent  │     │
│  └───────────────────────────┘     │
│                                      │
│  ┌───────────────────────────┐     │
│  │ 🔍 I Need a Place         │     │
│  │ Looking for room/flat     │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

### Profile - Listings Tabs
```
┌─────────────────────────────────────┐
│  Profile Header                      │
├─────────────────────────────────────┤
│  [All (5)] [Owner (3)] [Buyer (2)]  │  ← Tabs
├─────────────────────────────────────┤
│  🏠 Owner • ₹8000 • Room            │
│  🔍 Buyer • ₹10000 • Flat           │
│  🏠 Owner • ₹12000 • Flat           │
└─────────────────────────────────────┘
```

---

## 🔧 API Endpoints Usage

### Get Feed (Smart Filtering)
```javascript
// Buyer mode - show owner listings
GET /api/listings/feed?mode=buyer

Response: [
  {
    listingType: "owner",
    propertyType: "room",
    rent: 8000,
    location: "Koramangala",
    furnishing: "furnished",
    creator: { name: "Rahul", city: "Bangalore" }
  }
]
```

```javascript
// Owner mode - show buyer listings
GET /api/listings/feed?mode=owner

Response: [
  {
    listingType: "buyer",
    propertyType: "flat",
    rent: 10000,
    location: "HSR Layout",
    moveInDate: "2024-02-01",
    creator: { name: "Priya", city: "Bangalore" }
  }
]
```

### Create Listing
```javascript
POST /api/listings

// Owner listing
{
  "listingType": "owner",
  "propertyType": "room",
  "rent": 8000,
  "location": "Koramangala",
  "description": "Spacious room with attached bathroom",
  "genderPref": "any",
  "furnishing": "furnished",
  "availableFrom": "2024-02-01"
}

// Buyer listing
{
  "listingType": "buyer",
  "propertyType": "flat",
  "rent": 10000,
  "location": "HSR Layout",
  "description": "Looking for 2BHK flat",
  "genderPref": "any",
  "moveInDate": "2024-02-15",
  "occupationType": "single"
}
```

### Get My Listings
```javascript
// Get all my listings
GET /api/listings/my

// Get only owner listings
GET /api/listings/my?type=owner

// Get only buyer listings
GET /api/listings/my?type=buyer
```

---

## 🎯 Key Features Implemented

### ✅ 1. Dual Mode System
- **Home page pe toggle** - Buyer ya Owner mode
- Real-time feed update jab mode change ho
- Different UI for each mode

### ✅ 2. Smart Feed Logic
- **Buyer mode**: Owner listings dikhaata hai
- **Owner mode**: Buyer listings dikhaata hai
- Apni khud ki listing kabhi feed mein nahi aati
- Exclude creator's own listings automatically

### ✅ 3. Unified Listing Creation
- Single flow for both types
- Step 1: Choose role (Owner/Buyer)
- Step 2: Choose property type (Room/Flat)
- Step 3: Fill details (dynamic fields based on role)

### ✅ 4. Profile Management
- View all listings in one place
- Filter by listing type (tabs)
- Color-coded badges
  - Orange = Owner listing
  - Green = Buyer listing

### ✅ 5. Detailed Listing View
- Different layout for owner vs buyer listings
- Show relevant fields only
- Contact button with clear CTA

---

## 🎨 Color Scheme

```css
Owner (Has Property):
  - Primary: Orange (#f97316) to Red (#ef4444)
  - Badge: bg-orange-500/20 text-orange-400
  - Border: border-orange-500

Buyer (Needs Property):
  - Primary: Green (#22c55e) to Emerald (#10b981)
  - Badge: bg-green-500/20 text-green-400
  - Border: border-green-500

Common:
  - Actions: Indigo (#6366f1) to Purple (#a855f7)
  - Background: Slate-900, Slate-800
```

---

## 🚀 Testing Guide

### Test Case 1: Create Owner Listing
```
1. Go to /profile
2. Click "Create New Listing"
3. Select "I Have a Place"
4. Choose "Room" or "Flat"
5. Fill details:
   - Rent: 8000
   - Location: Koramangala
   - Description: Nice room
   - Furnishing: Furnished
   - Available From: Select date
6. Create listing
7. Verify: Shows in profile under "Owner" tab
```

### Test Case 2: View Feed as Buyer
```
1. Go to /home
2. Click "I Need a Place" (Buyer mode)
3. Verify: Shows all owner listings
4. Verify: Your own listings NOT shown
5. Click any listing
6. Verify: Shows owner details correctly
```

### Test Case 3: Dual Role User
```
1. Create 1 owner listing (you have a room)
2. Create 1 buyer listing (you need a flat)
3. Go to profile
4. Verify: "All" tab shows both
5. Verify: "Owner" tab shows only owner listing
6. Verify: "Buyer" tab shows only buyer listing
7. Go to home
8. Switch between modes
9. Verify: Never see your own listings in feed
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Feed showing own listings
**Solution**: Check feed API filter
```javascript
// Must exclude creator
creator: { $ne: req.user.id }
```

### Issue 2: Wrong listings in feed
**Solution**: Check mode parameter
```javascript
// Buyer mode should show owner listings
const showListingType = mode === "buyer" ? "owner" : "buyer";
```

### Issue 3: Missing creator details
**Solution**: Populate in backend
```javascript
.populate("creator", "name city age gender")
```

---

## 📊 Database Migration

If you have existing data, run this migration:

```javascript
// MongoDB shell
use rommie_db

// Update field names
db.listings.updateMany(
  { owner: { $exists: true } },
  [
    {
      $set: {
        creator: "$owner",
        propertyType: "$type",
        listingType: "owner"  // Assume old data was owner type
      }
    },
    {
      $unset: ["owner", "type"]
    }
  ]
)

// Verify
db.listings.find().pretty()
```

---

## 🎯 Next Steps

### Recommended Enhancements:
1. **Search & Filters**
   - Location-based search
   - Budget range filter
   - Property type filter

2. **Matching Algorithm**
   - Auto-suggest matches
   - Based on preferences
   - Compatibility score

3. **Chat Feature**
   - Direct messaging
   - Request management
   - Notification system

4. **Profile Enhancements**
   - Photo upload
   - Verification badges
   - Reviews & ratings

5. **Advanced Features**
   - Save favorites
   - Share listings
   - Map view
   - Virtual tours

---

## 🔐 Security Considerations

1. **Authentication**: Ensure authRequired middleware on all protected routes
2. **Authorization**: Users can only edit/delete their own listings
3. **Input Validation**: Validate all form inputs
4. **XSS Protection**: Sanitize user-generated content
5. **Rate Limiting**: Prevent spam listing creation

---

## 📞 Support

For issues or questions:
1. Check DATABASE_SCHEMA.md for data structure
2. Review this guide for implementation details
3. Check API responses in browser console
4. Verify backend logs for errors

---

**Happy Coding! 🚀**
