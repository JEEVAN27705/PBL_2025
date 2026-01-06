from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
import uvicorn
import shutil
import os
from rag import RAGEngine
from language import LanguageEngine

app = FastAPI()

# Initialize engines
# In a real production app, we'd use lifespan events to load these
rag_engine = RAGEngine(index_path="faiss_index.bin")
lang_engine = LanguageEngine()

class QueryRequest(BaseModel):
    text: str
    language: str = "auto" # 'en', 'hi', 'auto'

@app.get("/status")
def status():
    return {"status": "ok", "models_loaded": True}

@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    success = rag_engine.ingest_file(temp_file)
    os.remove(temp_file)
    
    if success:
        return {"message": f"Successfully ingested {file.filename}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to display PDF")

@app.post("/chat")
def chat(request: QueryRequest):
    query = request.text
    
    # 1. Detect Language
    detected_lang = request.language
    if detected_lang == "auto":
        detected_lang = lang_engine.detect_language(query)
    
    print(f"Query: {query}, Detected Lang: {detected_lang}")

    # 2. Translate to English if needed
    en_query = query
    if detected_lang != "en":
        en_query = lang_engine.translate(query, target_lang="en")
        print(f"Translated Query: {en_query}")
    
    # 3. Retrieve Documents
    docs = rag_engine.search(en_query)
    if not docs:
        return {
            "response": "I could not find any relevant information in the verified documents.",
            "sources": [],
            "original_language": detected_lang
        }
    
    # 4. Generate Answer (Extractive QA)
    context = "\n\n".join([d['content'] for d in docs])
    
    # Use QA model to find precise answer
    answer = rag_engine.get_answer(en_query, context)
    
    if answer:
        response_en = answer
    else:
        # Fallback if QA model is unsure, or just say I don't know
        # User requested precise answers only.
        response_en = "I found some documents, but I couldn't extract a precise answer. Please check the sources."
        # Optional: return context if you want to be helpful, strictly user said "precise answer only"
        # but let's be safe and maybe give a bit of context if QA fails? 
        # User example: "The secret WiFi password..." -> precise.
        # If I can't find it, I shouldn't hallucinate.

    
    # 5. Translate back if needed
    final_response = response_en
    if detected_lang != "en":
        final_response = lang_engine.translate(response_en, target_lang=detected_lang)
        
    return {
        "response": final_response,
        "sources": [d['source'] for d in docs],
        "original_language": detected_lang
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
