# Rommie Database Schema

## Overview
Rommie is a dual-mode rental platform where users can both search for properties (as buyers) and list properties (as owners). A single user can act in both capacities.

---

## Collections/Models

### 1. User Model
Stores user account information.

```javascript
{
  _id: ObjectId,
  name: String,
  age: Number,
  gender: String,
  jobType: String,
  city: String,
  email: String (unique),
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Points:**
- One user can create both owner and buyer listings
- No fixed role - dynamic based on listing type

---

### 2. Listing Model
Stores both owner listings (properties available) and buyer listings (requirements).

```javascript
{
  _id: ObjectId,
  creator: ObjectId (ref: User),
  
  // Core Fields
  listingType: String, // "owner" or "buyer"
  propertyType: String, // "room" or "flat"
  rent: Number,
  location: String,
  description: String,
  genderPref: String, // "any", "male", "female"
  active: Boolean,
  
  // Owner-specific Fields
  availableFrom: Date,
  furnishing: String, // "furnished", "semi-furnished", "unfurnished"
  
  // Buyer-specific Fields
  moveInDate: Date,
  occupationType: String, // "single", "shared"
  
  createdAt: Date,
  updatedAt: Date
}
```

**Listing Types:**

#### Owner Listing (listingType: "owner")
- Created by someone who HAS a property to rent out
- Fields used: `availableFrom`, `furnishing`
- Shows in buyer's feed (people looking for places)

#### Buyer Listing (listingType: "buyer")
- Created by someone who NEEDS a property
- Fields used: `moveInDate`, `occupationType`
- Shows in owner's feed (people who have places)

---

### 3. Request Model
Stores connection requests between users for listings.

```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  listing: ObjectId (ref: Listing),
  status: String, // "pending", "accepted", "rejected"
  createdAt: Date,
  updatedAt: Date
}
```

---

## Feed Logic

### When User is in "Buyer Mode" (Looking for a place):
```
Show listings where:
  - listingType = "owner" (people offering places)
  - creator != currentUser (don't show own listings)
  - active = true
```

### When User is in "Owner Mode" (Have a place):
```
Show listings where:
  - listingType = "buyer" (people looking for places)
  - creator != currentUser (don't show own listings)
  - active = true
```

---

## API Endpoints

### Listings

#### GET /api/listings/feed?mode=buyer|owner
Returns listings based on user's current mode:
- `mode=buyer` → Returns owner listings (properties available)
- `mode=owner` → Returns buyer listings (people looking)

#### POST /api/listings
Creates a new listing (owner or buyer type)

**Request Body:**
```json
{
  "listingType": "owner" | "buyer",
  "propertyType": "room" | "flat",
  "rent": 8000,
  "location": "Koramangala, Bangalore",
  "description": "...",
  "genderPref": "any",
  
  // If listingType is "owner":
  "furnishing": "furnished",
  "availableFrom": "2024-02-01",
  
  // If listingType is "buyer":
  "moveInDate": "2024-02-01",
  "occupationType": "single"
}
```

#### GET /api/listings/my?type=owner|buyer
Returns current user's listings, optionally filtered by type

#### GET /api/listings/:id
Returns specific listing details with populated creator info

---

## User Flow Examples

### Scenario 1: User Looking for a Flat (Buyer Mode)
1. User opens app, selects "I Need a Place" mode
2. Feed shows owner listings (people offering flats/rooms)
3. User can also create a buyer listing stating their requirements
4. Other owners will see this in their feed

### Scenario 2: User Has a Room to Rent (Owner Mode)
1. User opens app, selects "I Have a Place" mode
2. Feed shows buyer listings (people looking for flats/rooms)
3. User can create an owner listing with property details
4. Other buyers will see this in their feed

### Scenario 3: User in Both Roles
1. User creates an owner listing for their spare room
2. User also creates a buyer listing because they're looking for a bigger flat
3. In buyer mode: sees available properties
4. In owner mode: sees people looking for rooms
5. Profile shows both types of listings separately

---

## Key Features

### ✅ Dual Role Support
- Single user account can act as both buyer and owner
- No permanent role assignment
- Dynamic feed based on current mode

### ✅ Smart Feed Algorithm
- Buyers see owner listings (properties)
- Owners see buyer listings (requirements)
- Own listings never appear in feed
- Real-time mode switching

### ✅ Flexible Listing Types
- Owner listings: Advertise available properties
- Buyer listings: Post rental requirements
- Both types support rooms and flats

### ✅ Detailed Filtering
- Property type (room/flat)
- Budget/rent range
- Gender preferences
- Location
- Furnishing status (owners)
- Move-in dates

---

## Database Indexes (Recommended)

```javascript
// Listings
db.listings.createIndex({ creator: 1, listingType: 1 })
db.listings.createIndex({ listingType: 1, active: 1, createdAt: -1 })
db.listings.createIndex({ location: "text", description: "text" })

// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Requests
db.requests.createIndex({ sender: 1, receiver: 1, listing: 1 })
db.requests.createIndex({ receiver: 1, status: 1 })
```

---

## Migration Notes

### From Old Schema to New Schema

**Changes:**
1. `Listing.owner` → `Listing.creator`
2. `Listing.type` → `Listing.propertyType`
3. Added `Listing.listingType` ("owner"/"buyer")
4. Added owner-specific fields: `furnishing`, `availableFrom`
5. Added buyer-specific fields: `moveInDate`, `occupationType`

**Migration Required:**
```javascript
// Update existing listings
db.listings.updateMany(
  { owner: { $exists: true } },
  { 
    $rename: { 
      "owner": "creator",
      "type": "propertyType"
    },
    $set: {
      "listingType": "owner" // Assuming old listings were all owner type
    }
  }
)
```

---

## Future Enhancements

1. **Matching Algorithm**: Auto-match buyers with suitable owner listings
2. **Filters**: Advanced filters by price range, location radius, amenities
3. **Favorites**: Save favorite listings
4. **Verified Listings**: Verification badge for authentic properties
5. **Reviews**: Rating system for completed rentals
6. **Chat**: In-app messaging between users
