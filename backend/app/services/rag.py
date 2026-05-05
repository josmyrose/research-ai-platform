import re
from collections import Counter
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "faiss_index"

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
}


def _get_embeddings():
    return HuggingFaceEmbeddings()


def _load_documents(file_path):
    loader = PyPDFLoader(str(file_path))
    return loader.load()


def _split_documents(documents):
    splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=700,
        chunk_overlap=120,
    )
    return splitter.split_documents(documents)


def _extract_text(documents):
    return "\n".join(doc.page_content.strip() for doc in documents if doc.page_content).strip()


def summarize_text(text, max_sentences=4):
    cleaned_text = re.sub(r"\s+", " ", text).strip()
    if not cleaned_text:
        return "No readable text could be extracted from the uploaded document."

    sentences = re.split(r"(?<=[.!?])\s+", cleaned_text)
    usable_sentences = [sentence.strip() for sentence in sentences if len(sentence.split()) >= 8]
    if not usable_sentences:
        return cleaned_text[:600]

    words = re.findall(r"\b[a-zA-Z]{3,}\b", cleaned_text.lower())
    frequencies = Counter(word for word in words if word not in STOPWORDS)

    if not frequencies:
        return " ".join(usable_sentences[:max_sentences])

    ranked = []
    for index, sentence in enumerate(usable_sentences):
        sentence_words = re.findall(r"\b[a-zA-Z]{3,}\b", sentence.lower())
        score = sum(frequencies[word] for word in sentence_words if word not in STOPWORDS)
        if score:
            ranked.append((index, score, sentence))

    if not ranked:
        return " ".join(usable_sentences[:max_sentences])

    top_sentences = sorted(ranked, key=lambda item: item[1], reverse=True)[:max_sentences]
    ordered_summary = [sentence for index, _, sentence in sorted(top_sentences, key=lambda item: item[0])]
    return " ".join(ordered_summary)


def process_pdf(file_path, user_id=None):
    file_path = Path(file_path)
    documents = _load_documents(file_path)
    summary = summarize_text(_extract_text(documents))

    for document in documents:
        document.metadata["user_id"] = user_id
        document.metadata["filename"] = file_path.name

    split_docs = _split_documents(documents)
    embeddings = _get_embeddings()

    if DB_PATH.exists():
        db = FAISS.load_local(
            str(DB_PATH),
            embeddings,
            allow_dangerous_deserialization=True,
        )
        db.add_documents(split_docs)
    else:
        db = FAISS.from_documents(split_docs, embeddings)

    db.save_local(str(DB_PATH))

    return {
        "filename": file_path.name,
        "summary": summary,
        "page_count": len(documents),
        "chunk_count": len(split_docs),
    }


def _has_indexed_docs_for_user(db, user_id):
    if user_id is None:
        return True

    return any(
        doc.metadata.get("user_id") == user_id
        for doc in db.docstore._dict.values()
    )


def _search_limit_for_user(db, user_id):
    if user_id is None:
        return 5

    return max(5, len(db.docstore._dict))


def query_rag(query, user_id=None):
    if not DB_PATH.exists():
        return "No documents have been indexed yet. Upload a PDF to start querying your research library."

    embeddings = _get_embeddings()

    db = FAISS.load_local(
        str(DB_PATH),
        embeddings,
        allow_dangerous_deserialization=True,
    )

    if not _has_indexed_docs_for_user(db, user_id):
        return "No documents have been indexed yet. Upload a PDF to start querying your research library."

    docs = db.similarity_search(query, k=_search_limit_for_user(db, user_id))

    # 🔥 FILTER BY USER
    if user_id is not None:
        docs = [
            doc for doc in docs
            if doc.metadata.get("user_id") == user_id
        ]

    if not docs:
        return "No relevant information found."

    context = "\n\n".join(
        doc.page_content for doc in docs if doc.page_content
    ).strip()

    return context or "No relevant information found."


def search_documents(query, user_id=None, limit=8):
    if not DB_PATH.exists():
        return []

    cleaned_query = query.strip()
    if not cleaned_query:
        return []

    embeddings = _get_embeddings()

    db = FAISS.load_local(
        str(DB_PATH),
        embeddings,
        allow_dangerous_deserialization=True,
    )

    if not _has_indexed_docs_for_user(db, user_id):
        return []

    candidate_limit = _search_limit_for_user(db, user_id)
    docs_with_scores = db.similarity_search_with_score(
        cleaned_query,
        k=max(limit, candidate_limit),
    )

    results = []
    seen = set()

    for doc, score in docs_with_scores:
        if user_id is not None and doc.metadata.get("user_id") != user_id:
            continue

        filename = doc.metadata.get("filename") or "Indexed document"
        page = doc.metadata.get("page")
        content = re.sub(r"\s+", " ", doc.page_content or "").strip()
        if not content:
            continue

        result_key = (filename, page, content[:120])
        if result_key in seen:
            continue

        seen.add(result_key)
        results.append(
            {
                "filename": filename,
                "page": page,
                "snippet": content[:700],
                "score": float(score),
            }
        )

        if len(results) >= limit:
            break

    return results
