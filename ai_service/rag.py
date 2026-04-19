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
        """Extracts text, tables, and OCRs images from PDF with metadata tagging."""
        text_content = ""
        metadata_tags = set()
        
        # Keywords for metadata extraction
        YEAR_KEYWORDS = {"FE": "First Year", "SE": "Second Year", "TE": "Third Year", "BE": "Final Year"}
        CASTE_KEYWORDS = {"OPEN", "OBC", "SC", "ST", "SBC", "VJNT", "EWS"}
        DIV_KEYWORDS = {"DIV A", "DIV B", "DIV C", "DIV D"}

        try:
            import pdfplumber
            
            reader = None
            try:
                import easyocr
                reader = easyocr.Reader(['en'], gpu=False)
            except Exception as e:
                print(f"OCR not available: {e}")

            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    print(f"Processing Page {page_num + 1}...")
                    
                    raw_text = page.extract_text() or ""
                    tables = page.extract_tables()
                    
                    # Metadata Extraction from raw text
                    upper_text = raw_text.upper()
                    for code, full in YEAR_KEYWORDS.items():
                        if code in upper_text or full.upper() in upper_text:
                            metadata_tags.add(code)
                    for caste in CASTE_KEYWORDS:
                        if caste in upper_text:
                            metadata_tags.add(caste)
                    for div in DIV_KEYWORDS:
                        if div in upper_text:
                            metadata_tags.add(div)

                    page_content = ""
                    
                    # 1. Complex Table Strategy (Markdown format)
                    if tables and any(len(table) > 0 for table in tables):
                        for table in tables:
                            if not table or not any(table): continue
                            # Convert to Markdown Table for better LLM understanding
                            headers = [str(c).replace('\n', ' ') if c else "" for c in table[0]]
                            page_content += "| " + " | ".join(headers) + " |\n"
                            page_content += "| " + " | ".join(["---"] * len(headers)) + " |\n"
                            for row in table[1:]:
                                cleaned_row = [str(c).replace('\n', ' ').strip() if c else "-" for c in row]
                                if any(c != "-" for c in cleaned_row):
                                    page_content += "| " + " | ".join(cleaned_row) + " |\n"
                            page_content += "\n"
                        
                    # 2. OCR Strategy
                    elif len(raw_text.strip()) < 50 and reader:
                        try:
                            img_obj = page.to_image(resolution=300)
                            img_np = np.array(img_obj.original)
                            ocr_results = reader.readtext(img_np, detail=0)
                            page_content += "\n".join(ocr_results)
                        except Exception as e:
                            print(f"OCR Failed: {e}")
                    
                    # 3. Standard Text Strategy
                    else:
                        page_content += raw_text

                    text_content += f"\n[Page {page_num + 1}]\n{page_content}\n"

        except Exception as e:
            print(f"Advanced Ingestion Failed: {e}")
            try:
                doc = fitz.open(file_path)
                for page in doc:
                    text_content += page.get_text()
            except:
                return False

        if not text_content:
            return False

        # Chunking & Storage
        chunks = [text_content[i:i+1000] for i in range(0, len(text_content), 800)]
        embeddings = self.model.encode(chunks)
        self.index.add(np.array(embeddings, dtype='float32'))
        
        start_id = len(self.documents)
        for i, chunk in enumerate(chunks):
            self.documents.append({
                "id": start_id + i,
                "source": os.path.basename(file_path),
                "content": chunk,
                "metadata": list(metadata_tags)
            })
            
        faiss.write_index(self.index, self.index_path)
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
