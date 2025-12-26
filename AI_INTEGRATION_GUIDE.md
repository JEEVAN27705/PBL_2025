# AI Service Integration Guide

## 🎯 Overview

The user panel now has a fully functional AI chat interface that connects to the AI/NLP service. Students can ask questions and get answers **exclusively from verified documents**.

---

## 🚀 Setup Steps

### 1. Start the AI Service

First, ensure the AI service is running:

```bash
# Open a new terminal
cd c:\Users\jeeva\Desktop\PBL_2025\ai-service

# Make sure you have created .env file with your Google API key
# (Copy from .env.example and add your key)

# Start the AI service
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Google Generative AI initialized successfully
✅ Server running on port 3001
```

### 2. Index Verified Documents

Before students can query, you need to index the verified documents:

```bash
# In a new terminal or use Postman/Insomnia
curl -X POST http://localhost:3001/api/index-documents
```

This will:
- Extract text from all verified PDFs
- Create searchable index
- Enable instant retrieval for queries

### 3. Test the Integration

1. Make sure both services are running:
   - **Frontend**: `http://localhost:5173` (already running)
   - **AI Service**: `http://localhost:3001` (needs to be started)

2. Login as a user (or register)

3. Navigate to "Chat with AI" (default page)

4. Ask a question!

---

## 📱 Features Available to Students

### 1. **Multilanguage Support**
Students can select their preferred language:
- Auto-detect (default)
- English
- हिंदी (Hindi)
- मराठी (Marathi)
- Español (Spanish)
- Français (French)
- Deutsch (German)

### 2. **Source Citations**
Every answer shows:
- Which documents were used
- Document titles
- Department (Accounts, HR, Legal, etc.)
- Confidence score
- Processing time

### 3. **Document-Only Answers**
The AI is instructed to answer **ONLY from verified documents**. If the answer isn't in the documents, it says so clearly.

### 4. **Real-time Chat**
- Modern WhatsApp-style interface
- Message bubbles (user on right, AI on left)
- Loading indicators
- Error handling

---

## 🔧 Configuration

### AI Service URL

The frontend connects to the AI service at `http://localhost:3001`. This is configured in:

**File**: `frontend/src/panels/user/ChatPage.jsx`
```javascript
const AI_SERVICE_URL = 'http://localhost:3001';
```

### For Production

If you deploy the AI service to a different URL, update this constant.

---

## 🧪 Testing Examples

### Test in English
```
Question: "What is the 7 states model of process?"
Expected: Answer based on the verified PDF document
```

### Test in Hindi
```
Question: "प्रक्रिया का 7 राज्य मॉडल क्या है?"
Expected: Answer in Hindi, sourced from same document
```

### Test with No Answer
```
Question: "What is quantum physics?"
Expected: "I couldn't find any relevant information in the verified documents..."
```

---

## 🎨 UI Features

### Welcome Screen
When no messages, shows:
- Welcome message
- Information that answers come from verified docs
- Example questions students can ask

### Message Display
- **User messages**: Blue bubbles on the right
- **AI responses**: White/themed bubbles on the left
- **Error messages**: Red-tinted bubbles

### Source Display
Each AI answer shows a "Sources" section with:
- Document titles used
- Department categorization
- Confidence percentage
- Processing time

---

## 🐛 Troubleshooting

### "Failed to fetch" Error

**Problem**: Cannot connect to AI service

**Solutions**:
1. Check if AI service is running on port 3001
2. Verify MongoDB is running
3. Check console for errors
4. Ensure Google API key is set in `.env`

### "No relevant documents found"

**Problem**: Documents not indexed or query doesn't match

**Solutions**:
1. Run the index-documents endpoint first
2. Verify you have verified documents in the database
3. Try rephrasing the question
4. Check if documents contain the information

### AI Service Returns Error

**Problem**: Google API or processing error

**Check**:
1. Google API key is valid
2. API key has not exceeded quota
3. Check AI service logs: `ai-service/logs/app.log`

---

## 📊 How It Works

### Query Flow

```
Student asks question
        ↓
Detect language (if auto)
        ↓
Translate to English (if needed)
        ↓
Search indexed documents
        ↓
Retrieve top 5 relevant chunks
        ↓
Send to Google Gemini with context
        ↓
Generate answer using ONLY provided context
        ↓
Translate back to student's language
        ↓
Display answer + sources
```

### What Gets Indexed

When you run `/api/index-documents`:
1. Fetches all documents with `status: 'verified'`
2. Extracts text from PDFs
3. Splits into 1000-character chunks (with 200-char overlap)
4. Stores in `document_indexes` collection
5. Creates MongoDB text indexes for fast search

### Answer Generation

The AI prompt is carefully designed:
```
"You are an intelligent assistant helping students by 
answering questions based ONLY on the provided verified documents.

If the answer is not in the documents, clearly state 
'I don't have enough information in the verified documents 
to answer this question'"
```

This ensures students only get verified information.

---

## 🔐 Security & Privacy

- Student queries are not stored (currently)
- Only verified documents are indexed
- Admins control which documents get verified
- Rate limiting prevents abuse (20 requests/minute)
- Input validation prevents injection attacks

---

## 📈 Future Enhancements

Potential improvements:
1. **Conversation History**: Save past queries
2. **Saved Prompts**: Bookmark useful questions
3. **Query Analytics**: Track popular questions
4. **Document Upload Feedback**: Suggest missing information
5. **Voice Input**: Speech-to-text queries
6. **Export Conversations**: Download chat as PDF

---

## 📞 Support

For issues:
1. Check AI service health: `http://localhost:3001/api/health`
2. Check logs: `ai-service/logs/app.log`
3. Verify frontend console for errors
4. Ensure all services are running

---

## ✅ Checklist

Before students can use the system:

- [ ] MongoDB running
- [ ] Main server running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] AI service running (port 3001)
- [ ] Google API key configured in `.env`
- [ ] Documents indexed via `/api/index-documents`
- [ ] Test query successful

---

**Last Updated**: December 2025  
**Integration Status**: ✅ Complete and Ready
