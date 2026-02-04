import sys
import json
import re
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from groq import Groq

# =========================
# Load environment variables
# =========================
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# =========================
# Helper functions
# =========================
def split_into_paragraphs(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def build_docs(description, faqs):
    paragraphs = split_into_paragraphs(description)
    documents = [
        Document(page_content=p, metadata={"source": "description", "paragraph_id": idx+1})
        for idx, p in enumerate(paragraphs)
    ]
    faq_docs = [
        Document(page_content=f["question"], metadata={"source": "faq", "answer": f["answer"]})
        for f in faqs
    ]
    return documents, faq_docs

# =========================
# Chat prompt template
# =========================
chat_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a helpful assistant. Answer questions using ONLY the context provided. If you don't know, say 'I don't know'."
    ),
    HumanMessagePromptTemplate.from_template(
        "Context:\n{context}\n\nChat History:\n{chat_history}\n\nQuestion:\n{question}"
    )
])

# =========================
# Main RAG function
# =========================
def rag_groq_chat(payload):
    description = payload["description"]
    faqs = payload.get("faqs", [])
    query = payload["query"]
    chat_history = payload.get("chat_history", [])

    # Build documents & FAISS index
    documents, faq_docs = build_docs(description, faqs)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(documents + faq_docs, embeddings)
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k":3})

    # Retrieve relevant docs
    relevant_docs = retriever._get_relevant_documents(query, run_manager=None)
    context = format_docs(relevant_docs)

    # Format chat history
    history_text = "\n".join(f"{m['sender'].capitalize()}: {m['text']}" for m in chat_history) or "No previous messages."

    # Build final prompt
    prompt_text = chat_prompt.format(
        context=context,
        chat_history=history_text,
        question=query
    )

    # Call Groq API
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt_text}],
        stream=False,
        max_completion_tokens=300,
        temperature=0.5
    )

    assistant_response = completion.choices[0].message.content.strip()

    return assistant_response

# =========================
# Entry point for Node integration
# =========================
def main():
    payload = json.loads(sys.stdin.read())
    answer = rag_groq_chat(payload)
    print(json.dumps({"answer": answer}))

if __name__ == "__main__":
    main()
