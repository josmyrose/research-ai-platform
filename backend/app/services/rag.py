from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings

DB_PATH = "faiss_index"

def process_pdf(file_path):
    loader = PyPDFLoader(file_path)
    docs = loader.load()

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db = FAISS.from_documents(docs, embeddings)

    db.save_local(DB_PATH)
    return "PDF processed successfully"

def query_rag(query):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    db = FAISS.load_local(
        DB_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )

    docs = db.similarity_search(query, k=2)

    return "\n".join([doc.page_content for doc in docs])