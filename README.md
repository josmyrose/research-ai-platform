# 🚀 AI Research Copilot  
### Automated Paper Discovery, Summarization & Semantic Search Platform

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## 🚀 Overview

AI Research Copilot is an intelligent platform designed to **automate research workflows** by enabling users to upload, search, and interact with research papers using **AI-powered semantic search and conversational analysis**.

It transforms traditional manual research into a **smart, automated, and scalable knowledge system**.

---

## 🧠 Business Problem

Modern researchers face **extreme information overload**, with thousands of papers published daily.  
Existing tools rely on keyword-based search and manual workflows, making it difficult to:

- Discover relevant research  
- Extract key insights  
- Stay updated with new publications  

This leads to:

- ⬇️ Reduced productivity  
- ⬆️ Time-consuming manual analysis  
- ❌ Missed important research  

---

## 💡 Solution

This platform introduces an **AI-powered research assistant** that:

- 📄 Processes research documents  
- 🔍 Enables semantic search (not keyword-based)  
- 🤖 Provides contextual answers using RAG (Retrieval-Augmented Generation)  
- 🧠 Summarizes research papers automatically  
- 📊 Organizes knowledge into structured workflows  

---

## ✨ Key Features

- 🔍 **Semantic Search** using FAISS  
- 🤖 **AI Chat over Documents (RAG Pipeline)**  
- 📄 **PDF Upload & Processing**  
- 🧠 **Automatic Summarization**  
- 📊 **Topic-Based Research Organization (Planned)**  
- 🔐 **User Authentication (JWT + PostgreSQL)**  
- ⚡ **FastAPI Backend with Scalable Architecture**  
- 🎨 **Modern React Dashboard UI**

---

## 🏗️ Architecture
```bash
Frontend (React)
↓
FastAPI Backend
↓
RAG Pipeline (LLM + FAISS)
↓
PostgreSQL (Users, Metadata)
↓
Document Storage + Embeddings
```

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- React.js
- Tailwind CSS

### ⚙️ Backend
- FastAPI
- Python

### 🧠 AI / ML
- FAISS (Vector Search)
- LLM (Gemini / OpenAI)
- RAG (Retrieval-Augmented Generation)

### 🗄️ Database
- PostgreSQL (Production)
- SQLite (Development)

### 🔐 Authentication
- JWT (JSON Web Tokens)
- Bcrypt Password Hashing

---

## 📸 Screenshots

### 🔹 Dashboard
![Dashboard](./assets/dashboard.png)

### 🔹 Research Chat
![Chat](./assets/chat.png)

### 🔹 Document Upload
![Upload](./assets/upload.png)

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/research-ai-platform.git
cd research-ai-platform
```
2️⃣ Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```
3️⃣ Setup Environment Variables
```bash
Create .env file:

DATABASE_URL=postgresql://postgres:password@localhost:5432/research_ai
OPENAI_API_KEY=your_api_key

```
4️⃣ Run Database Migration
```bash
alembic upgrade head
```
5️⃣ Start Backend
```bash
uvicorn app.main:app --reload
```
6️⃣ Frontend Setup
```bash
cd frontend-react
npm install
npm run dev
```
🔄 Future Enhancements
```bash
🔁 Automatic paper ingestion (arXiv, PubMed)
🧠 Method extraction from papers
🔔 Smart notifications for new research
📊 Research trend analysis
🧑‍🤝‍🧑 Multi-user collaboration
☁️ Cloud deployment (AWS/GCP)
```
🎯 Use Cases
```bash
👨‍🔬 Academic Research
⚖️ Legal Document Analysis
🏥 Healthcare Research Insights
🧪 R&D Teams
📊 Data-driven decision making
```
🎤 Project Highlights
```bash
Designed a production-ready AI system
Implemented RAG-based architecture
Built scalable FastAPI backend
Integrated PostgreSQL + Alembic migrations
Enabled semantic document intelligence
```
📜 License
```bash
This project is licensed under the MIT License.
```
🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

⭐ If You Like This Project

Give it a ⭐ on GitHub!

📬 Contact

Josmy Mathew
📧 Email: josmyrose@gmail.com

🔗 LinkedIn: https://www.linkedin.com/in/josmymathew/