# Phase 7: Chat History Integration - Quick Start Guide

## Features Overview

### 1. Conversation Threading
View full chat conversations with all messages in chronological order.

**Access:** `/portal/chat-history` → Click on any conversation

**What You Get:**
- Full message thread with timestamps
- User and AI messages clearly distinguished
- Back navigation to history list
- Export buttons for the conversation

### 2. Export Conversations
Download your chat conversations for backup or external use.

**Access:** Open any conversation → Click "JSON" or "CSV" button

**Formats:**
- **JSON:** Structured data with metadata
- **CSV:** Spreadsheet-compatible format

**Example JSON Structure:**
```json
{
  "session": {
    "id": "...",
    "title": "Project Discussion",
    "created_at": "2025-11-14T10:00:00Z"
  },
  "messages": [
    {
      "role": "user",
      "content": "What's the project timeline?",
      "timestamp": "2025-11-14T10:00:00Z"
    }
  ]
}
```

### 3. Chat Analytics
View statistics about your chat conversations.

**Access:** `/portal/chat-analytics` (or click "Chat Analytics" in sidebar)

**Metrics:**
- Total conversations
- Total messages
- Your messages vs AI responses
- Average messages per conversation
- Top conversations by message count

### 4. Related Items Linking
Automatically discover invoices, bookings, and deliverables mentioned in chats.

**How It Works:**
- Open any conversation
- Related items appear at the top
- Click to navigate to that item

**Detected Items:**
- **Invoices:** Invoice numbers, amounts, payment status
- **Bookings:** Meetings, calls, appointments
- **Deliverables:** Files, documents, downloads

## API Endpoints

### Chat History
```
GET /api/portal/chat-history
GET /api/portal/chat-history/[id]
GET /api/portal/chat-history/[id]/export?format=json|csv
GET /api/portal/chat-history/[id]/related-items
```

### Chat Analytics
```
GET /api/portal/chat-analytics
```

## Navigation

**Sidebar Links:**
- Chat History → View all conversations
- Chat Analytics → View statistics

**Within Conversations:**
- Back button → Return to history list
- Export buttons → Download conversation
- Related items → Click to view linked items

## Tips & Tricks

1. **Search Conversations:** Use the search box on the chat history page
2. **Export for Records:** Export important conversations as JSON or CSV
3. **Track Metrics:** Check analytics to see your chat activity
4. **Find Related Items:** Look for automatically linked invoices and bookings
5. **Share Data:** Export conversations to share with team members

## Troubleshooting

**No conversations showing?**
- Make sure you have active chat sessions
- Check that you're logged in

**Export not working?**
- Try a different format (JSON or CSV)
- Check browser download settings

**Related items not appearing?**
- Items are detected based on keywords in messages
- Make sure messages mention invoices, bookings, or deliverables

## Next Steps

1. Start a chat conversation
2. View your chat history
3. Export a conversation
4. Check your chat analytics
5. Explore related items

