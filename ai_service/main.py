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

# Initialize Local LLM (OPTIONAL - Disabled due to install issues)
llm = None
# try:
#     from llama_cpp import Llama
#     print("Loading Local LLM (Phi-3)...")
#     model_path = "Phi-3-mini-4k-instruct-q4.gguf"
#     if os.path.exists(model_path):
#         llm = Llama(model_path=model_path, n_ctx=4096, verbose=False)
#         print("LLM Loaded successfully.")
#     else:
#         print("LLM model not found. Using Standard RAG.")
# except Exception as e:
#     print(f"Skipping LLM: {e}")

class QueryRequest(BaseModel):
    text: str
    language: str = "auto" # 'en', 'hi', 'auto'
    user_id: str = "guest"

class DialogueManager:
    def __init__(self):
        self.sessions = {} # {user_id: {"intent": None, "slots": {}}}

    def process(self, user_id: str, text: str):
        text_upper = text.upper()
        state = self.sessions.get(user_id, {"intent": None, "slots": {}})
        
        # 1. Intent Detection
        if "TIMETABLE" in text_upper or "SCHEDULE" in text_upper:
            state["intent"] = "TIMETABLE"
        elif "MERIT" in text_upper or "LIST" in text_upper:
            state["intent"] = "MERIT_LIST"
        elif any(k in text_upper for k in ["FEE", "SCHOLARSHIP", "ADMISSION"]):
            state["intent"] = "ADMIN"
        elif "RESET" in text_upper or "STOP" in text_upper:
            self.sessions[user_id] = {"intent": None, "slots": {}}
            return {"type": "message", "text": "Context cleared."}

        # 2. Slot Filling
        # Year
        if "FIRST YEAR" in text_upper or " FE " in f" {text_upper} ": state["slots"]["year"] = "FE"
        elif "SECOND YEAR" in text_upper or " SE " in f" {text_upper} ": state["slots"]["year"] = "SE"
        elif "THIRD YEAR" in text_upper or " TE " in f" {text_upper} ": state["slots"]["year"] = "TE"
        elif "FINAL YEAR" in text_upper or " BE " in f" {text_upper} ": state["slots"]["year"] = "BE"
        
        # Division
        import re
        div_match = re.search(r"DIV ([A-D])", text_upper)
        if div_match: state["slots"]["div"] = f"DIV {div_match.group(1)}"
        
        # Caste
        for caste in ["OPEN", "OBC", "SC", "ST", "SBC", "VJNT", "EWS"]:
            if caste in text_upper: state["slots"]["caste"] = caste

        # Name Extraction (Simple heuristic)
        if "MY NAME IS " in text_upper:
            state["slots"]["name"] = text.split("NAME IS ")[-1].strip()

        self.sessions[user_id] = state

        # 3. Decision Logic
        query_parts = [text]
        for k, v in state["slots"].items():
            if v and v not in text_upper:
                query_parts.append(v)
        
        return {"type": "search", "query": " ".join(query_parts), "slots": state["slots"]}

dm = DialogueManager()

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
        raise HTTPException(status_code=500, detail="Failed to process document")

@app.post("/chat")
def chat(request: QueryRequest):
    query = request.text
    
    # 1. Language Handling
    detected_lang = request.language
    if detected_lang == "auto":
        detected_lang = lang_engine.detect_language(query)
    
    en_query = query
    if detected_lang != "en":
        en_query = lang_engine.translate(query, target_lang="en")
    
    # 2. Context & Slot Management
    action = dm.process(request.user_id, en_query)
    
    if action["type"] == "message":
        return {"response": action["text"], "sources": [], "original_language": detected_lang}
        
    search_query = action.get("query", en_query)
    slots = action.get("slots", {})

    # 3. Document Retrieval
    docs = rag_engine.search(search_query)
    
    # Filter by slots if available (Post-retrieval reranking/filtering)
    # If a document has metadata and it doesn't match our slots, we might still show it but it's less relevant
    # For now, we rely on the augmented search query.

    if not docs:
        return {
            "response": "I could not find any relevant information in the documents.",
            "sources": [],
            "original_language": detected_lang
        }
    
    # 4. Answer Generation
    context = "\n\n".join([d['content'] for d in docs])
    
    response_en = ""
    
    if llm:
        # Generative Approach (Phi-3)
        try:
            system_prompt = (
                "You are an intelligent campus assistant. "
                "Answer the question strictly based on the provided context below. "
                "If the context does not contain the answer, say 'I don't know' but do not make up information. "
                "Frame the answer nicely."
            )
            user_msg = f"Context:\n{context}\n\nQuestion: {en_query}"
            
            completion = llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg}
                ],
                max_tokens=512,
                temperature=0.1 # Low temp for factual answers
            )
            response_en = completion['choices'][0]['message']['content']
        except Exception as e:
            print(f"LLM Generation Failed: {e}")
            response_en = ""

    # Fallback to Extractive QA if LLM failed or not available
    if not response_en or "I don't know" in response_en:
        # Use QA model to find precise answer
        answer = rag_engine.get_answer(en_query, context)
        if answer:
            response_en = answer
        elif not response_en: # If LLM failed entirely
             response_en = "I found relevant documents but could not generate a specific answer. Please check the sources."

    
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
