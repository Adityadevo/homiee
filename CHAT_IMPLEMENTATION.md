# Chat Implementation Guide

## Overview
Real-time chat functionality has been implemented using WebSockets (Socket.io) for matched users in the Rommie roommate finder application.

## How It Works

### Unique Chat ID
Each successful match (accepted request) gets a unique chat room identified by the **Request ID** (`_id` from the Request model). This ensures:
- Each buyer-owner listing pair has its own dedicated chat
- Chat history is preserved and associated with the specific match
- Users can only access chats for their matches

### Architecture

#### Backend Components

1. **Message Model** (`backennd/models/Message.js`)
   - Stores chat messages with matchId, sender, content, and timestamps
   - Tracks read status for unread message counts
   - Indexed for efficient querying

2. **Socket.io Server** (`backennd/socket.js`)
   - Handles real-time WebSocket connections
   - Authenticates users via JWT token
   - Manages chat rooms (one per match)
   - Events handled:
     - `join_chat` - User joins a chat room
     - `send_message` - User sends a message
     - `typing` - Typing indicator
     - `leave_chat` - User leaves chat room

3. **Chat Routes** (`backennd/routes/chat.js`)
   - `GET /api/chat/:matchId` - Fetch chat history
   - `POST /api/chat/:matchId` - Send message (REST fallback)
   - `GET /api/chat/:matchId/unread` - Get unread count
   - All routes verify user authorization

#### Frontend Components

1. **Socket Connection** (`frontend/lib/socket.ts`)
   - Manages Socket.io client connection
   - Handles authentication with JWT token
   - Provides singleton socket instance

2. **Chat Page** (`frontend/app/(app)/chat/[matchId]/page.tsx`)
   - Full-featured chat interface
   - Real-time message updates
   - Typing indicators
   - Auto-scroll to latest message
   - Beautiful gradient UI matching app theme

3. **Updated Matches Page** (`frontend/app/(app)/matches/page.tsx`)
   - "Chat Now" button links to chat for each match
   - Each match card shows the matched user and listing details

## Features Implemented

✅ **Real-time messaging** - Messages appear instantly for both users
✅ **Message persistence** - Chat history stored in MongoDB
✅ **Authentication** - Only matched users can access their chats
✅ **Typing indicators** - See when the other user is typing
✅ **Read receipts** - Track which messages have been read
✅ **Auto-scroll** - Automatically scroll to new messages
✅ **Responsive design** - Mobile-first chat interface
✅ **Error handling** - Graceful handling of connection issues

## How to Test

### Step 1: Create a Match
1. Create two user accounts (User A and User B)
2. User A creates a listing (e.g., owner listing)
3. User B creates a listing (e.g., buyer listing)
4. User B sends interest request to User A's listing
5. User A accepts the request
6. Both users now have a match!

### Step 2: Access Chat
1. Go to the "Matches" page (bottom navigation)
2. You'll see your matched users
3. Click "Chat Now" button on any match
4. Start chatting in real-time!

### Step 3: Test Features
- Send messages back and forth between two browser windows
- Watch typing indicators when someone is typing
- Check message timestamps
- Test on different devices for responsive design

## Technical Details

### WebSocket Connection Flow
```
1. User logs in → Gets JWT token
2. Opens chat page → Socket connects with token
3. Joins chat room → socket.emit("join_chat", matchId)
4. Sends message → socket.emit("send_message", { matchId, content })
5. Receives message → socket.on("new_message", callback)
6. Leaves page → socket.emit("leave_chat", matchId)
```

### Message Data Structure
```typescript
{
  _id: string;
  matchId: string;
  sender: { _id: string; name: string };
  content: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Authorization Logic
- Every chat action verifies the user is part of the match
- Users can only join, send, and view messages in their own matches
- Match verification happens on both socket events and REST endpoints

## Environment Variables

Make sure these are set in your `.env` files:

**Backend (`backennd/.env`):**
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running the Application

**Backend:**
```bash
cd backennd
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Both servers should be running:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Future Enhancements (Optional)

- 📎 File/image sharing in chat
- 🔔 Push notifications for new messages
- 📱 Unread message badges on matches page
- 🔍 Search within chat history
- 🗑️ Delete messages
- ✏️ Edit sent messages
- 😊 Emoji picker
- 📍 Location sharing
- 🎤 Voice messages
- 📹 Video call integration

## Troubleshooting

### Messages not appearing in real-time
- Check browser console for socket connection errors
- Verify JWT token is valid
- Ensure backend Socket.io is running

### Cannot join chat room
- Verify the match exists and status is "accepted"
- Check user is either sender or receiver of the request

### Connection keeps dropping
- Check CORS settings in backend
- Verify WebSocket isn't blocked by firewall/proxy
- Ensure stable internet connection

## Files Modified/Created

### Backend
- ✅ `backennd/models/Message.js` (new)
- ✅ `backennd/routes/chat.js` (new)
- ✅ `backennd/socket.js` (new)
- ✅ `backennd/index.js` (modified)
- ✅ `backennd/package.json` (modified)

### Frontend
- ✅ `frontend/lib/socket.ts` (new)
- ✅ `frontend/app/(app)/chat/[matchId]/page.tsx` (new)
- ✅ `frontend/app/(app)/matches/page.tsx` (modified)

## Support

If you encounter any issues, check:
1. Both servers are running
2. MongoDB connection is active
3. JWT tokens are valid
4. Network requests aren't blocked
5. Browser console for errors

Happy chatting! 💬✨
