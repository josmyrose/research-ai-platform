```
# 🚀 Research AI Platform

> An AI-powered research workspace that combines Retrieval-Augmented Generation (RAG), document intelligence, semantic search, and multi-mode research assistance into a unified platform.

---

## 📖 Overview

Research AI Platform is designed to support real-world research workflows rather than functioning as a simple chatbot. The platform enables users to upload research documents, build personalized knowledge bases, search across indexed content, and interact with their documents through intelligent conversational interfaces.

The system provides multiple research modes tailored to different user needs:

* **Lite Mode** – Fast answers for quick research questions.
* **Deep Review Mode** – Structured and comprehensive research synthesis.
* **Source Mode** – Evidence-grounded responses with source attribution.

Built with a modern architecture using **React**, **FastAPI**, **SQLite**, **Ollama**, and **Retrieval-Augmented Generation (RAG)**, the platform emphasizes scalability, maintainability, and production-ready design principles.

---

## ✨ Key Features

### 🔐 Secure User Management

* User authentication and authorization
* Protected research workspaces
* User-specific document ownership
* Secure access control

### 📚 Intelligent Research Library

* Upload and manage research documents
* Automatic document indexing
* Semantic document search
* Persistent research library

### 🤖 AI-Powered Research Assistant

* Conversational document interaction
* Context-aware question answering
* Retrieval-Augmented Generation (RAG)
* Local LLM integration using Ollama

### 🔍 Multiple Research Modes

* **Lite Mode:** Fast responses for everyday questions
* **Deep Review Mode:** Comprehensive research synthesis
* **Source Mode:** Citation-focused and evidence-grounded responses

### 📊 Research Data Management

* Chat history persistence
* Scholar record management
* User-specific indexing and retrieval
* Efficient caching for improved performance

### 🎨 Modern User Experience

* Responsive interface
* Loading and progress indicators
* Error handling and recovery states
* Empty-state user guidance
* Real-time document processing feedback

---

## 🏗️ System Architecture

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS

### Backend

* FastAPI
* SQLAlchemy
* Alembic
* Ollama Integration
* REST APIs

### AI & Search Layer

* Retrieval-Augmented Generation (RAG)
* Semantic Search
* Context Retrieval
* Local LLM Inference

### Database

* SQLite (development)
* Extensible for PostgreSQL deployment

---

## 🛠️ Technology Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React, Vite, Tailwind CSS |
| Backend        | FastAPI                   |
| Database       | SQLite, SQLAlchemy        |
| Authentication | JWT                       |
| Migrations     | Alembic                   |
| AI Model       | Ollama (Llama 3.2)        |
| Search         | Semantic Retrieval        |
| Deployment     | Local / Future Cloud      |

---

# 🚀 Getting Started

## Prerequisites

Before running the application, ensure the following tools are installed:

* Python 3.10+
* Node.js 18+
* Git
* Ollama

---


## Step 1: Download the Local LLM

Pull the model used by the backend:

```bash
ollama pull llama3.2
```

---

## Step 2: Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./research_ai.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

## Step 3: Frontend Setup

Navigate to the frontend:

```bash
cd frontend-react
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Dashboard:

```text
http://localhost:5173/dashboard
```

---

# 📋 Business Requirements

The platform is designed around production-level research workflows.

### Core Requirements

✅ Secure Authentication

✅ User-Specific Research Workspaces

✅ Document Upload & Indexing

✅ Semantic Search

✅ Chat History Persistence

✅ Lite Research Mode

✅ Deep Review Mode

✅ Source-Based Responses

✅ Backend Ownership Enforcement

✅ Responsive Error and Loading States

✅ Extensible Research Infrastructure

---

# ⚠️ Current Scope & Limitations

The platform currently provides a strong foundation for a production research assistant. Certain capabilities are intentionally reserved for future releases.

### Current Limitations

* Academic web providers are represented in the UI but not yet fully integrated.
* Lite Mode prioritizes speed over exhaustive research synthesis.
* Citation quality depends on uploaded document quality.
* Ollama must be running locally for answer generation.
* Team collaboration features are not yet implemented.

---

# 🔮 Future Roadmap

### Research Integrations

* Semantic Scholar Integration
* PubMed Integration
* CrossRef Integration
* arXiv Integration

### Collaboration Features

* Project Workspaces
* Team Collaboration
* Shared Research Libraries

### Infrastructure Enhancements

* Cloud Object Storage
* Docker Deployment
* Streaming Responses
* Usage Analytics Dashboard

### Quality Improvements

* Automated Testing
* Citation Verification
* Research Report Generation
* Advanced Evaluation Metrics



---

# 📂 Project Structure

```text
Research-AI-Platform
│
├── backend
│   ├── app
│   ├── alembic
│   ├── requirements.txt
│   └── .env
│
├── frontend-react
│   ├── src
│   ├── public
│   └── package.json
│
├── docs
│   └── BusinessRequirements.md
│
└── README.md
```

---

# 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Josmy Mathew

MSc Data Science, AI & Digital Business

AI Engineer | Data Scientist | Research Systems Developer

Building intelligent systems that transform information into actionable knowledge.
# 🚀 Research AI Platform

> An AI-powered research workspace that combines Retrieval-Augmented Generation (RAG), document intelligence, semantic search, and multi-mode research assistance into a unified platform.

---

## 📖 Overview

Research AI Platform is designed to support real-world research workflows rather than functioning as a simple chatbot. The platform enables users to upload research documents, build personalized knowledge bases, search across indexed content, and interact with their documents through intelligent conversational interfaces.

The system provides multiple research modes tailored to different user needs:

* **Lite Mode** – Fast answers for quick research questions.
* **Deep Review Mode** – Structured and comprehensive research synthesis.
* **Source Mode** – Evidence-grounded responses with source attribution.

Built with a modern architecture using **React**, **FastAPI**, **SQLite**, **Ollama**, and **Retrieval-Augmented Generation (RAG)**, the platform emphasizes scalability, maintainability, and production-ready design principles.

---

## ✨ Key Features

### 🔐 Secure User Management

* User authentication and authorization
* Protected research workspaces
* User-specific document ownership
* Secure access control

### 📚 Intelligent Research Library

* Upload and manage research documents
* Automatic document indexing
* Semantic document search
* Persistent research library

### 🤖 AI-Powered Research Assistant

* Conversational document interaction
* Context-aware question answering
* Retrieval-Augmented Generation (RAG)
* Local LLM integration using Ollama

### 🔍 Multiple Research Modes

* **Lite Mode:** Fast responses for everyday questions
* **Deep Review Mode:** Comprehensive research synthesis
* **Source Mode:** Citation-focused and evidence-grounded responses

### 📊 Research Data Management

* Chat history persistence
* Scholar record management
* User-specific indexing and retrieval
* Efficient caching for improved performance

### 🎨 Modern User Experience

* Responsive interface
* Loading and progress indicators
* Error handling and recovery states
* Empty-state user guidance
* Real-time document processing feedback

---

## 🏗️ System Architecture

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS

### Backend

* FastAPI
* SQLAlchemy
* Alembic
* Ollama Integration
* REST APIs

### AI & Search Layer

* Retrieval-Augmented Generation (RAG)
* Semantic Search
* Context Retrieval
* Local LLM Inference

### Database

* SQLite (development)
* Extensible for PostgreSQL deployment

---

## 🛠️ Technology Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React, Vite, Tailwind CSS |
| Backend        | FastAPI                   |
| Database       | SQLite, SQLAlchemy        |
| Authentication | JWT                       |
| Migrations     | Alembic                   |
| AI Model       | Ollama (Llama 3.2)        |
| Search         | Semantic Retrieval        |
| Deployment     | Local / Future Cloud      |

---

# 🚀 Getting Started

## Prerequisites

Before running the application, ensure the following tools are installed:

* Python 3.10+
* Node.js 18+
* Git
* Ollama

---

## Step 1: Download the Local LLM

Pull the model used by the backend:

```bash
ollama pull llama3.2
```

---

## Step 2: Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./research_ai.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

## Step 3: Frontend Setup

Navigate to the frontend:

```bash
cd frontend-react
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Dashboard:

```text
http://localhost:5173/dashboard
```

---

# 📋 Business Requirements

The platform is designed around production-level research workflows.

### Core Requirements

✅ Secure Authentication

✅ User-Specific Research Workspaces

✅ Document Upload & Indexing

✅ Semantic Search

✅ Chat History Persistence

✅ Lite Research Mode

✅ Deep Review Mode

✅ Source-Based Responses

✅ Backend Ownership Enforcement

✅ Responsive Error and Loading States

✅ Extensible Research Infrastructure

---

# ⚠️ Current Scope & Limitations

The platform currently provides a strong foundation for a production research assistant. Certain capabilities are intentionally reserved for future releases.

### Current Limitations

* Academic web providers are represented in the UI but not yet fully integrated.
* Lite Mode prioritizes speed over exhaustive research synthesis.
* Citation quality depends on uploaded document quality.
* Ollama must be running locally for answer generation.
* Team collaboration features are not yet implemented.

---

# 🔮 Future Roadmap

### Research Integrations

* Semantic Scholar Integration
* PubMed Integration
* CrossRef Integration
* arXiv Integration

### Collaboration Features

* Project Workspaces
* Team Collaboration
* Shared Research Libraries

### Infrastructure Enhancements

* Cloud Object Storage
* Docker Deployment
* Streaming Responses
* Usage Analytics Dashboard

### Quality Improvements

* Automated Testing
* Citation Verification
* Research Report Generation
* Advanced Evaluation Metrics

---

# 💼 Interview Highlights

This project demonstrates both engineering and product ownership skills.

### What Makes It Stand Out

✔ Designed around real research workflows rather than generic chat interactions

✔ Separation of frontend services, backend APIs, database models, and RAG services

✔ User-specific access control and document ownership

✔ Multiple AI research modes with distinct retrieval behaviors

✔ Production-oriented architecture with migrations, caching, and extensibility

✔ Business requirements documentation reflecting product-thinking and stakeholder awareness

✔ Clear roadmap for scaling from prototype to enterprise-ready platform

---

# 📂 Project Structure

```text
Research-AI-Platform
│
├── backend
│   ├── app
│   ├── alembic
│   ├── requirements.txt
│   └── .env
│
├── frontend-react
│   ├── src
│   ├── public
│   └── package.json
│
├── docs
│   └── BusinessRequirements.md
│
└── README.md
```

---

# 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Josmy Mathew

MSc Data Science, AI & Digital Business

AI Engineer | Data Scientist | Research Systems Developer

Building intelligent systems that transform information into actionable knowledge.

- Node.js 18+
- Ollama installed locally
- Git

Pull the local model used by the backend:

```bash
ollama pull llama3.2
```

Start Ollama before asking chat questions:

```bash
ollama serve
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` if needed:

```env
DATABASE_URL=sqlite:///./research_ai.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend-react
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Dashboard route:

```text
http://localhost:5173/dashboard
```

## Production-Level Business Requirements

The full business requirement document is included in `doc/`. At a high level, the platform must support:

- Secure authentication and protected research workspaces.
- User-specific document upload, indexing, search, and chat history.
- Fast Lite Mode for quick research questions.
- Deep Review Mode for structured research synthesis.
- Source Mode for evidence-grounded answers.
- Persistent library and scholar records.
- Clear handling of unsupported or not-yet-configured web retrieval.
- Responsive UI states for loading, errors, empty data, and uploads.
- Backend enforcement of mode behavior and user ownership.

## Current Scope and Honest Limitations

The application already includes the foundation for a production research assistant. Some areas are intentionally scoped or prepared for future extension:

- External academic web retrieval is represented in the UI but requires provider integrations before it becomes fully active.
- Lite Mode is optimized for concise answers, not exhaustive literature reviews.
- Source precision depends on uploaded document quality and extracted metadata.
- Local answer generation requires Ollama to be running with the configured model.
- Collaboration, project teams, notifications, and cloud deployment are future enhancements.

## Future Improvements

- Integrate academic providers such as Semantic Scholar, PubMed, CrossRef, and arXiv.
- Add project-level workspaces and team collaboration.
- Add cloud object storage for uploaded documents.
- Add admin dashboard and usage analytics.
- Add automated test coverage for chat modes and RAG behavior.
- Add Dockerized production deployment.
- Add streaming responses for chat.
- Add advanced citation validation and report generation.

## What I Would Highlight In Interviews

- I designed the platform around a real research workflow instead of building only a chatbot.
- I separated frontend service calls, route protection, backend routes, database models, and RAG services.
- I implemented user-specific filtering so users only access their own indexed research data.
- I added multiple chat modes with different retrieval and generation behavior.
- I included practical production concerns such as caching, migrations, error states, empty states, and extensible API boundaries.
- I documented business requirements to show product ownership, not only implementation ability.

## License

This project is available under the MIT License.
