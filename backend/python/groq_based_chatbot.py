import re
import os
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough

from groq import Groq

# =========================
# Load environment variables
# =========================
load_dotenv()  # Load GROQ_API_KEY from .env
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# =========================
# Load product description
# =========================
loader = TextLoader("description.txt", encoding="utf-8")
docs = loader.load()
description = docs[0].page_content

# =========================
# Split description into paragraphs
# =========================
def split_into_paragraphs(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]

paragraphs = split_into_paragraphs(description)

# =========================
# Create LangChain documents
# =========================
documents = [
    Document(
        page_content=paragraph,
        metadata={
            "product_id": "field_alpha_tool",
            "paragraph_id": idx + 1,
            "source": "llm_generated"
        }
    )
    for idx, paragraph in enumerate(paragraphs)
]

# =========================
# Create embeddings + FAISS index
# =========================
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = FAISS.from_documents(
    documents=documents,
    embedding=embeddings
)

vectorstore.save_local("faiss_product_paragraphs")

# =========================
# RAG prompt template
# =========================
rag_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=(
        "You are a helpful assistant. Answer the question using ONLY the "
        "information provided in the context below. You are talking to real users. "
        "If you don't know the answer, just say 'I don't know'.\n\n"
        "Context:\n{context}\n\n"
        "Question:\n{question}\n\n"
        "Answer:"
    )
)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# =========================
# Retriever
# =========================
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# =========================
# Groq-based RAG chain
# =========================
def rag_groq_chain(question: str, stream: bool = False, **kwargs):
    # Get top-k relevant paragraphs (internal method requires run_manager)
    relevant_docs = retriever._get_relevant_documents(question, run_manager=None)
    context = format_docs(relevant_docs)

    # Prepare prompt
    prompt_text = rag_prompt.format(context=context, question=question)

    # Call Groq API
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt_text}],
        stream=stream,
        **kwargs
    )

    if stream:
        # Stream output
        for chunk in completion:
            if chunk.choices[0].delta.content:
                print(chunk.choices[0].delta.content, end="", flush=True)
        print()  # Newline after streaming finishes
    else:
        # Return full response
        return completion.choices[0].message.content

# =========================
# Ask a question
# =========================
user_question = "Which dry fruit is best for energy"
# For streaming response
rag_groq_chain(user_question, stream=True, max_completion_tokens=200, temperature=0.5)
