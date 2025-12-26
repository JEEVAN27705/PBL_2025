# AI/NLP Query Service - PBL 2025

> 🤖 Intelligent student query system powered by Google Generative AI (Gemini) that answers questions using **ONLY verified documents** with multilanguage support.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Flow Diagrams](#flow-diagrams)
- [How It Works](#how-it-works)
- [Error Handling](#error-handling)
- [Multilanguage Support](#multilanguage-support)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## 🎯 Overview

This AI/NLP service provides an intelligent question-answering system that:
- Uses **RAG (Retrieval-Augmented Generation)** to answer queries accurately
- Searches **only verified documents** from the database
- Supports **multilanguage queries** (English, Hindi, Marathi, Spanish, French, German)
- Provides **source citations** for transparency
- Handles **exceptions gracefully** with comprehensive error handling

### Key Principle
**The system NEVER makes up information** - all answers are based strictly on verified documents uploaded through the admin panel.

---

## ✨ Features

### Core Capabilities
- ✅ **Document-Based Q&A**: Answers derived only from verified PDFs
- ✅ **RAG Architecture**: Retrieval-Augmented Generation for accurate responses
- ✅ **Multilanguage Support**: Query in your preferred language
- ✅ **Automatic Translation**: Translates queries and responses as needed
- ✅ **Source Citations**: Shows which documents were used for each answer
- ✅ **Confidence Scoring**: Indicates answer reliability
- ✅ **PDF Processing**: Automatic text extraction and intelligent chunking

### Technical Features
- ✅ **Comprehensive Error Handling**: Custom error classes and middleware
- ✅ **Request Logging**: Winston-based logging system
- ✅ **Rate Limiting**: Prevents API abuse
- ✅ **Input Validation**: Joi-based schema validation
- ✅ **Retry Logic**: Automatic retry for AI API failures
- ✅ **Health Checks**: Monitor service status

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   User Query    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│          API Layer (Express)                     │
│  • Rate Limiting  • Validation  • Logging       │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│         RAG Service (Orchestrator)              │
│                                                  │
│  1. Language Detection                          │
│  2. Query Translation (if needed)               │
│  3. Document Retrieval                          │
│  4. AI Answer Generation                        │
│  5. Response Translation (if needed)            │
└────────┬────────────────────────────────────────┘
         │
    ┌────┴─────┬──────────┬────────────┐
    ▼          ▼          ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│Document│ │   AI   │ │Translate│ │ Database │
│Service │ │Service │ │ Service │ │ (MongoDB)│
└────────┘ └────────┘ └────────┘ └──────────┘
```

### Data Flow

```
Query → Detect Language → Translate to EN → Search Documents
                                    ↓
                            Retrieve Chunks
                                    ↓
                            Build Context
                                    ↓
                        Generate AI Response
                                    ↓
                        Translate to User Lang
                                    ↓
                            Return Answer
```

---

## 🛠️ Technology Stack

### Backend Framework
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v4.19+) - Web framework

### AI/ML
- **Google Generative AI** (Gemini Pro) - Language model
- **@google-cloud/translate** - Translation service
- **pdf-parse** - PDF text extraction

### Database
- **MongoDB** (v6+) - Document storage
- **Mongoose** (v8+) - ODM

### Utilities
- **Winston** - Logging
- **Joi** - Validation
- **Helmet** - Security
- **express-rate-limit** - Rate limiting

---

## 📦 Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (v6 or higher) - running locally or remote
3. **Google API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 1: Navigate to AI Service Directory

```bash
cd c:\Users\jeeva\Desktop\PBL_2025\ai-service
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Express and middleware
- Google Generative AI SDK
- MongoDB and Mongoose
- PDF parsing libraries
- Logging and validation utilities

### Step 3: Configure Environment

```bash
# Copy example environment file
copy .env.example .env

# Edit .env file with your configuration
notepad .env
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `ai-service` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pbl_2025

# Google Generative AI (REQUIRED)
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Google Cloud Translation
# GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Service Configuration
MAX_QUERY_LENGTH=500
MAX_RESULTS=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Getting Google API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

**Note**: The free tier provides generous limits suitable for development and moderate production use.

---

## 🚀 Usage

### Starting the Service

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        AI/NLP Query Service - Successfully Started        ║
║                                                            ║
║  Server:    http://localhost:3001                         ║
║  Health:    http://localhost:3001/api/health              ║
║  API Docs:  See README.md                                  ║
║                                                            ║
║  Status:    ✅ Database Connected                          ║
║             ✅ AI Service Initialized                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🧭 AI Modes, Models & Testing (Quick Guide)

### Models and Behavior
- The service can use a hosted LLM via the Google Generative AI SDK. The model id may be set with the `GOOGLE_MODEL` environment variable. If unset, the service attempts a conservative default but may fail if the model is not available on your account.
- To guarantee answers strictly come from the verified documents in the database (no external LLM calls), enable the extractive mode by setting `FORCE_EXTRACTIVE=true` in `.env`. In this mode the service extracts and returns matching sentences from indexed PDF chunks and attaches source citations.

### Recommended Defaults for Hackathon / Local Use
- Use extractive-only mode for predictable, free behavior: set `FORCE_EXTRACTIVE=true` in `.env`.
- If you want to use Google models, set `GOOGLE_API_KEY` and optionally `GOOGLE_MODEL` to a model ID available in your Google account (check Google AI Studio -> Models).

### Testing Checklist (run these steps to verify everything)
1. Start backend (from `ai-service`):
```powershell
npm install
npm run dev
```
2. Health check (should show database and AI status):
```powershell
curl http://localhost:3001/api/health
```
3. Index verified documents (if you added new PDFs or to ensure index populated):
```powershell
npm run index-docs
```
4. Quick query (extractive mode will return excerpts + sources):
```powershell
curl -X POST http://localhost:3001/api/query -H "Content-Type: application/json" -d '{"query":"When is the semester fee deadline?","language":"auto"}'
```
Expected response JSON contains `data.answer`, `data.sources`, `data.language`, and `processingTime`.
5. Export conversation logs for today:
```powershell
curl "http://localhost:3001/api/logs?date=$(Get-Date -Format yyyy-MM-dd)"
```
6. Start frontend (from `FRONTEND`):
```powershell
cd FRONTEND
npm install
npm run dev
```
Open the Vite URL (usually `http://localhost:5173`) and navigate to `/user`. The chat UI will call the backend `/api/query` and display document-only answers when extractive mode is enabled.

### Troubleshooting Common Issues
- If LLM calls fail with 404 `model not found`, either set `FORCE_EXTRACTIVE=true` or set `GOOGLE_MODEL` to a model present in your Google project.
- If indexing fails with duplicate key errors, run the index script with `REINDEX=true` to clear and reindex:
```powershell
$env:REINDEX="true"; npm run index-docs
```
- Check logs in `ai-service/logs/` (`app.log`, `error.log`) for details.

---

### Initial Setup: Index Documents

Before you can query, you need to index the verified documents:

```bash
# Index all verified documents
curl -X POST http://localhost:3001/api/index-documents \
  -H "Content-Type: application/json"
```

This will:
1. Fetch all verified documents from MongoDB
2. Extract text from PDFs
3. Split text into chunks
4. Store chunks in searchable index

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

---

### 1. Query Endpoint

**Ask questions about verified documents**

```http
POST /api/query
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "What is the 7 states model of process?",
  "language": "auto",
  "maxResults": 5
}
```

**Parameters:**
- `query` (required, string): Your question (3-500 characters)
- `language` (optional, string): Language code or "auto" (default: "auto")
  - Supported: `en`, `hi`, `mr`, `es`, `fr`, `de`, `auto`
- `maxResults` (optional, number): Max document chunks to retrieve (1-10, default: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "The 7 states model of process includes...",
    "sources": [
      {
        "documentTitle": "7 states model of process",
        "department": "Accounts",
        "chunkIndex": 0
      }
    ],
    "language": "en",
    "confidence": 0.9,
    "metadata": {
      "chunksRetrieved": 3,
      "queryTranslated": false,
      "answerTranslated": false
    }
  },
  "processingTime": 1234
}
```

**Example (Hindi Query):**
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "प्रक्रिया का 7 राज्य मॉडल क्या है?",
    "language": "auto"
  }'
```

---

### 2. Index Documents

**Index verified documents for searching**

```http
POST /api/index-documents
Content-Type: application/json
```

**Request Body (Optional):**
```json
{
  "documentIds": ["64a1b2c3d4e5f6a7b8c9d0e1"],
  "reindex": false
}
```

**Parameters:**
- `documentIds` (optional, array): Specific document IDs to index (omit for all)
- `reindex` (optional, boolean): Re-index already indexed documents (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Documents indexed successfully",
  "data": {
    "totalDocuments": 5,
    "successfullyIndexed": 5,
    "totalChunks": 42,
    "results": [...]
  }
}
```

---

### 3. Get Statistics

**View indexing statistics**

```http
GET /api/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalChunks": 42,
    "uniqueDocuments": 5,
    "departments": ["Accounts", "HR", "Legal"],
    "lastIndexed": {
      "indexedAt": "2025-12-24T16:30:00.000Z"
    }
  }
}
```

---

### 4. Get Suggestions

**Get example queries**

```http
GET /api/suggestions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "What is the 7 states model of process?",
      "Explain the account verification process",
      "What are the HR policies?",
      "Tell me about legal compliance requirements",
      "How do I submit an exam application?"
    ]
  }
}
```

---

### 5. Get Supported Languages

**List supported languages**

```http
GET /api/languages
```

**Response:**
```json
{
  "success": true,
  "data": {
    "languages": {
      "en": "English",
      "hi": "Hindi",
      "mr": "Marathi",
      "es": "Spanish",
      "fr": "French",
      "de": "German"
    }
  }
}
```

---

### 6. Health Check

**Check service health**

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "database": "connected",
    "ai": "ready"
  },
  "timestamp": "2025-12-24T16:30:00.000Z"
}
```

---

## 🔄 How It Works

### RAG (Retrieval-Augmented Generation) Pipeline

#### Step 1: Language Detection
```javascript
Input: "प्रक्रिया का 7 राज्य मॉडल क्या है?"
Detected: Hindi (hi)
```

#### Step 2: Query Translation
```javascript
Original: "प्रक्रिया का 7 राज्य मॉडल क्या है?"
Translated: "What is the 7 state model of process?"
```

#### Step 3: Document Retrieval
```javascript
// Search indexed chunks using MongoDB text search
Search Query: "7 state model process"
Results: 5 most relevant chunks ranked by relevance
```

#### Step 4: Context Building
```javascript
const context = `
[Document 1: 7 states model of process]
The 7 states model consists of...

[Document 2: Process Management]
Additional information about process states...
`;
```

#### Step 5: AI Generation
```javascript
Prompt: "You are an assistant. Answer using ONLY these documents..."
Context: [Retrieved chunks]
Question: "What is the 7 state model of process?"

AI Response: "Based on the documents, the 7 states model..."
```

#### Step 6: Response Translation
```javascript
English Answer: "Based on the documents..."
Translated to Hindi: "दस्तावेज़ों के आधार पर..."
```

---

## 🔧 Error Handling

### Error Types

#### 1. Validation Errors (400)
```json
{
  "success": false,
  "error": {
    "message": "Query must be at least 3 characters long",
    "type": "ValidationError"
  }
}
```

#### 2. Document Not Found (404)
```json
{
  "success": false,
  "error": {
    "message": "No relevant documents found",
    "type": "DocumentNotFoundError"
  }
}
```

#### 3. AI Service Errors (503)
```json
{
  "success": false,
  "error": {
    "message": "AI service temporarily unavailable",
    "type": "AIServiceError"
  }
}
```

#### 4. Rate Limit (429)
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "type": "RateLimitError"
  }
}
```

### Retry Mechanism

The service automatically retries failed AI API calls:
- **Max Retries**: 3
- **Backoff**: Exponential (1s, 2s, 4s)
- **Fallback**: Returns helpful error message if all retries fail

---

## 🌍 Multilanguage Support

### Supported Languages

| Code | Language | Script       |
|------|----------|--------------|
| en   | English  | Latin        |
| hi   | Hindi    | Devanagari   |
| mr   | Marathi  | Devanagari   |
| es   | Spanish  | Latin        |
| fr   | French   | Latin        |
| de   | German   | Latin        |

### How Translation Works

1. **Detection**: Analyzes character sets to identify language
2. **Translation**: 
   - Basic: Character-based detection (built-in)
   - Advanced: Google Cloud Translate (if configured)
3. **Fallback**: If translation fails, returns original text

### Example Queries

**Hindi:**
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "खाता सत्यापन प्रक्रिया क्या है?"}'
```

**Spanish:**
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Cuál es el proceso de verificación de cuenta?"}'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "AI model not initialized"
**Solution**: Check your `GOOGLE_API_KEY` in `.env`
```bash
# Verify key is set
echo %GOOGLE_API_KEY%

# Restart service
npm run dev
```

#### 2. "Database connection failed"
**Solution**: Ensure MongoDB is running
```bash
# Check MongoDB service
sc query MongoDB

# Or check connection string in .env
MONGODB_URI=mongodb://localhost:27017/pbl_2025
```

#### 3. "No relevant documents found"
**Solution**: Index your documents first
```bash
curl -X POST http://localhost:3001/api/index-documents
```

#### 4. "PDF appears to be empty"
**Solution**: The PDF might be image-based (scanned). Currently, text-based PDFs are supported. For OCR, additional setup would be needed.

---

## 👨‍💻 Development

### Project Structure

```
ai-service/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── queryController.js   # Request handlers
│   ├── services/
│   │   ├── aiService.js         # Google Gemini integration
│   │   ├── documentService.js   # Document management
│   │   ├── ragService.js        # RAG orchestration
│   │   └── translationService.js# Language handling
│   ├── utils/
│   │   ├── errorHandler.js      # Error utilities
│   │   ├── logger.js            # Winston logging
│   │   ├── pdfParser.js         # PDF processing
│   │   └── validator.js         # Input validation
│   ├── routes/
│   │   └── queryRoutes.js       # API routes
│   ├── middleware/
│   │   └── errorMiddleware.js   # Error handling
│   ├── models/
│   │   └── DocumentIndex.js     # MongoDB schema
│   ├── app.js                   # Express app
│   └── server.js                # Entry point
├── logs/                        # Log files
├── .env                         # Configuration
├── .env.example                 # Config template
├── .gitignore
├── package.json
└── README.md                    # This file
```

### Adding New Features

#### Example: Adding a new language

1. Update `translationService.js`:
```javascript
const SUPPORTED_LANGUAGES = {
  // ... existing languages
  ja: 'Japanese'  // Add new language
};
```

2. Add detection logic:
```javascript
// Japanese detection (Hiragana/Katakana)
if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
```

### Running Tests

```bash
# Unit tests (to be implemented)
npm test

# Coverage
npm run coverage
```

### Logging

Logs are stored in `logs/` directory:
- `app.log` - All logs
- `error.log` - Errors only

View logs:
```bash
# Tail application logs
Get-Content logs\app.log -Tail 50 -Wait

# View errors
Get-Content logs\error.log
```

---

## 📊 Performance Considerations

### Optimization Tips

1. **Index Size**: Keep chunk size optimal (1000 chars recommended)
2. **Database**: Ensure text indexes are created on DocumentIndex
3. **Caching**: Consider adding Redis for frequently asked questions
4. **Concurrent Requests**: Uses connection pooling (max 10)

### Scalability

- **Horizontal Scaling**: Run multiple instances behind load balancer
- **Database**: MongoDB replica set for high availability
- **Rate Limiting**: Adjust based on your infrastructure

---

## 🔐 Security

### Implemented Measures

- ✅ **Helmet.js**: Security headers
- ✅ **Rate Limiting**: Prevent abuse
- ✅ **Input Validation**: Joi schemas
- ✅ **Sanitization**: Remove dangerous characters
- ✅ **Error Handling**: No stack traces in production

### Recommendations

- Use HTTPS in production
- Set strong CORS policies
- Rotate API keys regularly
- Monitor rate limit violations

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🤝 Contributing

This is a PBL project. For improvements:
1. Document the issue
2. Propose a solution
3. Test thoroughly
4. Update documentation

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review logs in `logs/` directory
3. Check service health: `GET /api/health`
4. Contact development team

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**Maintainer**: PBL 2025 Team
