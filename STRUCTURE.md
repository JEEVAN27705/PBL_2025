# Project Structure: UNIO-KODE

This document provides a comprehensive overview of the **UNIO-KODE** project structure, detailing the role of each directory and its core files.

---

## 📂 Project Overview
**UNIO-KODE** is a Multilingual AI Campus Assistant that uses Retrieval-Augmented Generation (RAG) to answer student queries based on university documents. It consists of three main components:
1.  **FRONTEND**: A React-based web application for students and admins.
2.  **SERVER**: A Node.js/Express backend handling authentication, database management, and file uploads.
3.  **AI_SERVICE**: A Python/FastAPI service managing document vectorization, RAG, and NLP tasks.

---

## 📁 1. FRONTEND (`/FRONTEND`)
The frontend is built using **React** and **Vite**.

### 🛠 Core Configuration
-   `package.json`: Contains project dependencies (React, Vite, Axios, Lucide React, etc.) and scripts.
-   `vite.config.js`: Configuration for the Vite build tool.
-   `index.html`: The main entry point for the browser.
-   `.env`: Environment variables for the frontend (e.g., Backend URL).

### 📂 Source Code (`/FRONTEND/src`)
-   `main.jsx`: Initializes the React application.
-   `App.jsx`: Main application component with routing.
-   `ProtectedRoute.jsx`: Logic to protect routes that require authentication.
-   `components/`: Reusable UI components (Login, Register, Chat, Admin panels).
-   `context/`: React Context for state management (e.g., AuthContext).
-   `styles/`: CSS files for styling the components.
-   `api/`: Axios configurations for communicating with the backend.

---

## 📁 2. SERVER (`/server`)
The backend is built with **Node.js**, **Express**, and **MongoDB**.

### 🛠 Core Configuration
-   `package.json`: Backend dependencies (Express, Mongoose, JWT, Multer, Bcrypt).
-   `.env`: Sensitive configuration (MongoDB URI, JWT Secret).

### 📂 Source Code (`/server/src`)
-   `server.js`: Starts the Express server on a designated port.
-   `app.js`: Configures Express middleware and routes.
-   `config/db.js`: MongoDB connection logic.
-   `models/`: Mongoose schemas for the database (Admin, User, Upload, etc.).
-   `routes/`: API endpoints (auth, upload, dashboard).
-   `middleware/`: Custom middleware (Auth verification, File upload handling).
-   `utils/`: Utility functions.
-   `uploads/`: Temporary storage for files uploaded by users/admins.

---

## 📁 3. AI SERVICE (`/ai_service`)
The AI engine is built with **Python**, **FastAPI**, and **FAISS**.

### 🛠 Core Files
-   `main.py`: The FastAPI application entry point. Defines API endpoints for chatting and document processing.
-   `rag.py`: The core **Retrieval-Augmented Generation** logic. Handles document chunking, embedding, and context retrieval.
-   `language.py`: Logic for language detection and translation (Multilingual support).
-   `seed_data.py`: Script to populate the initial knowledge base.
-   `requirements.txt`: Python dependencies (fastapi, sentence-transformers, faiss-cpu, easyocr).
-   `documents.json`: Cached text extracted from documents.
-   `faiss_index.bin`: The vectorized index for fast semantic search.

---

## 📄 XML Documents & Data Files
While the project primarily uses **JSON** for data storage and **JavaScript/Python** for logic, there are specific XML-based and data files:

### 🧩 XML Documents
-   **OpenCV Haar Cascades** (`ai_service/venv/.../cv2/data/`):
    -   `haarcascade_frontalface_default.xml`: Used for face detection if OCR or image processing requires identifying human features.
    -   `haarcascade_eye.xml`: Used for eye detection.
    -   *Note: These are standard XML files provided by the OpenCV library for machine learning tasks.*
-   **SVG Files** (`FRONTEND/public/vite.svg`):
    -   Scalable Vector Graphics are XML-based image formats used for logos and icons.

### 📊 Data Files
-   `documents.json`: Stores the structured text extracted from PDFs and images.
-   `test_merit_list.pdf`: Sample document used for testing the AI's extraction capabilities.

---

## 🔄 Interaction Flow
1.  **User** asks a question in the **Frontend**.
2.  **Server** authenticates the user and forwards the request to the **AI Service**.
3.  **AI Service** detects the language, retrieves relevant context from the **FAISS Index**, and generates a response.
4.  The response is sent back through the **Server** to the **Frontend** for display.
