```

## Getting Started

### Prerequisites

- Python 3.10+
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
