# Volunteer Quickstart — AI/NLP Service

This quick guide helps volunteer maintainers run the `ai-service`, add verified documents, and verify the assistant answers only from institutional PDFs.

Prerequisites
- Node.js (v18+)
- MongoDB running and accessible

1) Setup
```powershell
cd ai-service
copy .env.example .env
notepad .env   # add MONGODB_URI, GOOGLE_API_KEY (optional); set FORCE_EXTRACTIVE=true for document-only answers
npm install
```

2) Index verified documents
- If admins upload PDFs via the main server and mark them verified, index them:
```powershell
npm run index-docs
```
- To force reindexing (clear previous chunks):
```powershell
$env:REINDEX="true"; npm run index-docs
```

3) Run the service (dev)
```powershell
npm run dev
```

4) Test a query (extractive mode returns sentences from indexed PDFs)
```powershell
curl -X POST http://localhost:3001/api/query -H "Content-Type: application/json" -d '{"query":"When is the semester fee deadline?","language":"auto"}'
```

5) Export conversation logs (for review)
```powershell
curl "http://localhost:3001/api/logs?date=2025-12-26"
```

6) Frontend (local testing)
```powershell
cd ../FRONTEND
npm install
npm run dev
```
Open the Vite URL and go to `/user` to use the chat UI.

Maintenance notes
- To add new verified documents: upload via admin UI on main server, mark as `verified`, then run `npm run index-docs`.
- Logs: `ai-service/logs/` contains `app.log`, `error.log`, and daily conversation logs `conversations-YYYY-MM-DD.log`.
- To switch between document-only and LLM mode: set `FORCE_EXTRACTIVE=false` and configure `GOOGLE_API_KEY` + `GOOGLE_MODEL` (requires valid Google model access).

If you want, I can add a small admin page in the frontend for volunteers to trigger indexing and export logs.

---

Happy hacking! 🚀
