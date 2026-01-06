import os
import faiss
import numpy as np
import fitz  # PyMuPDF
from sentence_transformers import SentenceTransformer

class RAGEngine:
    def __init__(self, index_path="faiss_index.bin", model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        self.index_path = index_path
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            
        # Persistence for metadata
        self.doc_path = "documents.json"
        if os.path.exists(self.doc_path):
            import json
            with open(self.doc_path, "r") as f:
                self.documents = json.load(f)
        else:
            self.documents = []
        
        # Extractive QA Model
        print("Loading QA Model...")
        from transformers import pipeline
        self.qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
            
    def ingest_file(self, file_path: str):
        """Extracts text from PDF, chunks it, embeds, and adds to FAISS."""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
            return False

        # Simple chunking (overlapping windows could be better)
        chunks = [text[i:i+500] for i in range(0, len(text), 400)]
        if not chunks:
            return False
            
        embeddings = self.model.encode(chunks)
        self.index.add(np.array(embeddings, dtype='float32'))
        
        # Store metadata (mapping index ID to text content)
        # In a real app, use SQLite or a proper DocStore. 
        # Here we just append to in-memory list (assuming persistence handling later)
        start_id = len(self.documents)
        for i, chunk in enumerate(chunks):
            self.documents.append({
                "id": start_id + i,
                "source": os.path.basename(file_path),
                "content": chunk
            })
            
        # Save index
        faiss.write_index(self.index, self.index_path)
        
        # Save metadata
        import json
        with open(self.doc_path, "w") as f:
            json.dump(self.documents, f)
            
        return True

    def search(self, query: str, k: int = 3):
        """Searches the index for the query."""
        if self.index.ntotal == 0:
            return []
            
        embedding = self.model.encode([query])
        D, I = self.index.search(np.array(embedding, dtype='float32'), k)
        
        results = []
        for idx in I[0]:
            if idx != -1 and idx < len(self.documents):
                results.append(self.documents[idx])
        return results

    def get_answer(self, query: str, context: str):
        """Extracts the exact answer from the context."""
        if not context or not query:
            return None
        
        try:
            # QA models work best with moderate context. 
            # If context is huge, might be truncated.
            result = self.qa_pipeline(question=query, context=context)
            # result looks like: {'score': 0.9, 'start': 10, 'end': 20, 'answer': 'answer content'}
            if result['score'] < 0.1: # Threshold for "I don't know"
                return None
            return result['answer']
        except Exception as e:
            print(f"QA Error: {e}")
            return None
