# 🎓 Multilingual Campus Chatbot – Bridging Communication Gaps in College

## 📘 Overview
Campus offices receive hundreds of repetitive queries daily — fee deadlines, scholarship forms, timetable changes — often from students who prefer Hindi or other regional languages.  
Traditional methods like circulars or PDFs make it difficult for students to quickly find answers, resulting in long queues, delayed communication, and frustration for both staff and students.

This project proposes a **Multilingual Conversational AI Chatbot** that understands **Hindi, English, and regional Indian languages**, providing instant and accurate responses to routine queries.  
By automating FAQs, the chatbot frees campus staff to focus on complex student needs while ensuring **24×7 accessibility** and **equitable information access**.

---

## 🛠️ How to Run Locally

### Prerequisites
- Node.js (v16 or higher recommended)
- MongoDB (installed locally or use a cloud URI)

### 1. Backend Setup
The backend is an Express.js server running on port 5000.

```bash
cd server
npm install

# Create a .env file in the server directory with the following (adjust as needed):
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/pbl_2025
# JWT_SECRET=your_secure_random_string
# CORS_ORIGIN=http://localhost:5173

# Start the server
npm run dev
```

### 2. Frontend Setup
The frontend is a Vite + React application running on port 5173.

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

### 3. Accessing the App
Open your browser and navigate to:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧩 Problem Statement
- Students struggle to access important information quickly.  
- Campus offices handle repetitive questions that could be automated.  
- Language diversity creates communication barriers.  
- Existing information is scattered across PDFs and circulars, not conversational formats.

---

## 💡 Proposed Solution
A **multilingual chatbot** capable of handling student inquiries conversationally in **five regional languages** (including Hindi and English), integrated directly into:
- The **college website**  
- Popular **messaging platforms** (e.g., WhatsApp, Telegram, etc.)

The chatbot will:
- Accurately **understand user intent** and **maintain context** across multiple conversation turns.  
- Retrieve answers from institutional FAQs and documents.  
- Log all interactions for continuous improvement.  
- Provide a **human handover option** when queries cannot be resolved automatically.  
- Ensure **privacy**, **accuracy**, and **easy maintenance** by student developers.

---

## ⚙️ Key Features
| Feature | Description |
|----------|-------------|
| 🌐 **Multilingual Support** | Understands and responds in Hindi, English, and other regional languages. |
| 🧠 **Intent Recognition** | Accurately interprets student questions about fees, exams, scholarships, etc. |
| 💬 **Context Management** | Maintains continuity across multi-turn conversations. |
| 👩‍💻 **Human Fallback** | Redirects unresolved queries to college staff. |
| 🧾 **Conversation Logging** | Saves daily interactions for review and improvement. |
| 🧱 **Integrations** | Embeddable on websites and connectable to messaging platforms. |
| 🔒 **Privacy and Security** | Protects user data and adheres to college IT policies. |
| 🛠 **Student-Maintainable** | Designed to be easily managed by student volunteers after deployment. |

---

## 🧰 Technologies Used
- **Frontend:** HTML, CSS, JavaScript, React (Vite)
- **Backend:** Node.js, Express.js
- **NLP Frameworks:** Integration ready (e.g., Gemini, OpenAI, or Rasa)
- **Databases:** MongoDB (for logs, users, and documents)
- **Languages Supported:** English, Hindi, Marathi (extendable)

---

## 🔍 Architecture
1. **User Query:** Student asks a question in any supported language.  
2. **Language Detection & Translation:** System identifies language and translates to English (if required).  
3. **Intent Recognition:** NLP engine determines user intent (e.g., “exam schedule,” “fee deadline”).  
4. **Response Retrieval:** Fetches the most relevant answer from the FAQ database or documents.  
5. **Context Management:** Retains history for follow-up questions.  
6. **Response Delivery:** Sends a clear, localized message to the user.  
7. **Logging & Analytics:** Records conversation for continuous improvement.

---

## 🚀 Expected Outcomes
- Reduce repetitive workload for campus staff.  
- Provide **instant, multilingual** responses to students 24×7.  
- Improve accessibility and inclusivity for non-English speakers.  
- Serve as a **student-driven innovation**, maintainable post-hackathon.

---

## 🧩 Future Enhancements
- Voice-based interaction for improved accessibility.  
- Integration with ERP or college management systems.  
- Smart notifications for upcoming deadlines or events.  
- Sentiment analysis to detect student frustration and escalate accordingly.

---

## 👩‍💻 Team & Maintenance
Developed by **student innovators** under the **PBL 2025 Project**, this chatbot emphasizes:
- Sustainable student-led maintenance  
- Continuous improvement via feedback loops  
- Open documentation for future contributors  

---

## 🏁 Conclusion
By combining multilingual NLP, conversational design, and student innovation, this project enables **equitable, 24×7 access** to campus information — a meaningful step toward a **smarter, more connected campus experience.**

---

### 📄 License
This project is developed as part of **PBL 2025** and is intended for educational and institutional use.

---

### 🧑‍💻 Author
**Jeevan Patil**  
GitHub: [@JEEVAN27705](https://github.com/JEEVAN27705)
