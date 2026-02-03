import sys
import json
import re
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

EMBEDDINGS_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

def build_docs(description, faqs):
    # Split description into sentences
    sentences = re.split(r'(?<=[.!?])\s+', description.strip())
    description_docs = [
        Document(page_content=s, metadata={"source": "description"})
        for s in sentences if s.strip()
    ]

    faq_docs = [
        Document(
            page_content=f["question"],
            metadata={"source": "faq", "answer": f["answer"]}
        )
        for f in faqs
    ]

    return description_docs, faq_docs

def ask(description_docs, faq_docs, query):
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)

    desc_store = FAISS.from_documents(description_docs, embeddings)
    desc_doc, desc_score = desc_store.similarity_search_with_score(query, k=1)[0]

    # If no FAQs exist, fall back to description
    if not faq_docs:
        return desc_doc.page_content

    faq_store = FAISS.from_documents(faq_docs, embeddings)
    faq_doc, faq_score = faq_store.similarity_search_with_score(query, k=1)[0]

    if desc_score <= faq_score:
        return desc_doc.page_content
    else:
        return faq_doc.metadata.get("answer", "")

def main():
    payload = json.loads(sys.stdin.read())

    description = payload["description"]
    faqs = payload["faqs"]
    query = payload["query"]

    description_docs, faq_docs = build_docs(description, faqs)
    answer = ask(description_docs, faq_docs, query)

    print(json.dumps({ "answer": answer }))

if __name__ == "__main__":
    main()
