# UNIO-KODE: Multilingual AI Campus Assistant

## TABLE OF CONTENTS
1. [Introduction](#1-introduction)
2. [Problem Statement / Objectives](#2-problem-statement--objectives)
3. [Software / Hardware Requirements](#3-software--hardware-requirements)
4. [Algorithm Used](#4-algorithm-used)
5. [Dataset](#5-dataset)
6. [Data Set Characteristics](#6-data-set-characteristics)
7. [Results / Findings](#7-results--findings)
8. [Conclusion](#8-conclusion)
9. [References](#9-references)

---

## 1. Introduction
**UNIO-KODE** is an advanced, AI-powered assistant designed specifically for educational institutions to automate and streamline the resolution of student queries. By integrating **Retrieval-Augmented Generation (RAG)** and **Multilingual NLP**, the system allows students to interact with complex university documents (such as timetables, fee structures, and merit lists) in their preferred language (English, Hindi, etc.). The platform features a dual-interface for Admins to manage document archives and for Users to perform context-aware AI chats.

---

## 2. Problem Statement / Objectives
### Problem Statement
University administrative offices often face a massive volume of repetitive queries concerning admissions, exams, and scholarship deadlines. Traditional dissemination methods—like physical notice boards or static PDF circulars—are difficult for students to search through, especially for those who prefer regional languages. This leads to administrative bottlenecks and communication gaps.

### Objectives
*   **Automate Query Resolution:** Use AI to provide instant, document-backed answers to student questions.
*   **Multilingual Support:** Break language barriers by detecting and responding in regional languages.
*   **Departmental Routing:** Implement a dashboard with private `@mentions` to route specific queries to HODs, Exam Cells, or Accounts.
*   **Digitization:** Convert image-based circulars into searchable knowledge bases using OCR.

---

## 3. Software / Hardware Requirements
### Software Requirements
*   **Frontend:** React.js 19 (Vite, React Router, React Icons, Axios)
*   **Backend:** Node.js, Express.js (JWT Authentication, Bcrypt, Helmet security)
*   **AI Service:** FastAPI (Python 3.10+)
*   **Database:** MongoDB (Mongoose ODM)
*   **Machine Learning Libraries:** 
    *   `sentence-transformers` (Embeddings)
    *   `faiss-cpu` (Vector Search Indexing)
    *   `transformers` (RoBERTa for QA, XLM-RoBERTa for Language Detection)
    *   `easyocr` & `pdfplumber` (OCR and Document Parsing)

### Hardware Requirements
*   **Processor:** Quad-core Intel i5 or equivalent (AMD Ryzen 5).
*   **RAM:** 8 GB minimum (16 GB recommended for seamless local LLM/QA inference).
*   **Storage:** 5 GB available disk space for model weights and vectorized indices.

---

## 4. Algorithm Used
The core of the system is built on a modular AI pipeline:

*   **Retrieval-Augmented Generation (RAG):** Instead of relying solely on general knowledge, the system "retrieves" context from uploaded campus documents to "generate" or "extract" highly specific answers.
*   **Vectorization:** Text chunks are transformed into high-dimensional vectors using the `all-MiniLM-L6-v2` Sentence Transformer model.
*   **Semantic Matching:** **FAISS** (Facebook AI Similarity Search) is used to perform high-speed L2-distance searches to find the most relevant document segments.
*   **Extractive Question Answering:** Uses the `deepset/roberta-base-squad2` model to pinpoint the exact answer within the retrieved context.
*   **Language Engine:** Employs `facebook/nllb-200-distilled-600M` for neural translation and `xlm-roberta-base-language-detection` for identifying user input languages.
*   **Dialogue Management:** A rule-based state manager performs "Slot Filling" to extract metadata like Year (FE/SE/TE/BE), Caste, and Division.

---

## 5. Dataset
The dataset is dynamically generated and proprietary to the institution:
*   **Official Circulars:** PDF documents regarding scholarship schemes, holiday lists, and exam protocols.
*   **Structured Tables:** Excel/JSON-converted data for timetables and fees.
*   **Merit Lists:** Scanned or text-based documents containing admission outcomes and rankings.
*   **OCR Corpus:** Text extracted from image-based posters or handwritten notices via `EasyOCR`.

---

## 6. Data Set Characteristics
*   **Format:** Multi-modal (Unstructured Text, Semi-structured Tables, Images).
*   **Chunking Strategy:** Documents are processed into overlapping chunks of 800-1000 characters to preserve context.
*   **Metadata Tagging:** Each entry is tagged with its source file and relevant academic categories (e.g., Department, Year).
*   **Vector Dimensions:** 384 dimensions per embedding, optimized for speed and memory efficiency.

---

## 7. Results / Findings
*   **High Extraction Accuracy:** The system successfully handles complex markdown table extraction from PDFs, allowing the AI to answer specific "column-and-row" queries.
*   **Multilingual Competency:** Successfully detects user intent in Hindi/English and provides accurately translated responses derived from English source documents.
*   **Reduced Latency:** By using `FAISS-CPU`, search retrieval times are kept under 100ms even with large document sets.
*   **Seamless Communication:** The admin dashboard effectively segregates public and private departmental messages based on role-based access control.

---

## 8. Conclusion
**UNIO-KODE** represents a significant step towards a "Smart Campus" ecosystem. By combining the precision of Extractive QA with the flexibility of RAG and OCR, the project successfully reduces the manual workload on administrative staff while providing students with a fast, accurate, and multi-lingual self-service helpdesk.

---

## 9. References
*   *FastAPI Framework*: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
*   *Sentence-Transformers Library*: [https://www.sbert.net/](https://www.sbert.net/)
*   *Hugging Face Model Hub (RoBERTa & NLLB)*: [https://huggingface.co/](https://huggingface.co/)
*   *FAISS Vector Search Index*: [https://github.com/facebookresearch/faiss](https://github.com/facebookresearch/faiss)
*   *React.js Documentation*: [https://react.dev/](https://react.dev/)
