import sys
import re
import json
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from groq import Groq
import os
from dotenv import load_dotenv

# Load Groq API key
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

EMBEDDINGS_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)

# Chat history
chat_history = []

# Prompt template
chat_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
         "You are a polite helpful assistant. Answer the question using ONLY the "
        "information provided in the context below. You are talking to real users. "
        "If you don't know the answer, just say 'I don't know'.\n\n"
    ),
    HumanMessagePromptTemplate.from_template(
        "Context:\n{context}\n\nChat History:\n{chat_history}\n\nQuestion:\n{question}"
    )
])

# Helper functions
def split_into_paragraphs(text):
    sentences = re.split(r'(?<=[.])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def rag_groq_chat(description, faqs, question):
    global chat_history

    # Build documents
    paragraphs = split_into_paragraphs(description)
    documents = [Document(page_content=p, metadata={"source": "description"}) for p in paragraphs]

    faq_docs = []
    if faqs:
        for f in faqs:
           faq_docs.append(Document(page_content=f"Q: {f['question']}\nA: {f['answer']}",metadata={"source": "faq"})
)


    all_docs = documents + faq_docs if faq_docs else documents
    vectorstore = FAISS.from_documents(all_docs, embeddings)
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})

    relevant_docs = retriever._get_relevant_documents(question, run_manager=None)
    context = format_docs(relevant_docs)
    history_text = "\n".join(f"{entry['role'].capitalize()}: {entry['content']}" for entry in chat_history) or "No previous messages."
    prompt_text = chat_prompt.format(context=context, chat_history=history_text, question=question)

    # Store user message
    chat_history.append({"role": "user", "content": question})

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt_text}],
        stream=False,
        max_completion_tokens=300,
        temperature=0.5
    )

    assistant_response = completion.choices[0].message.content
    chat_history.append({"role": "assistant", "content": assistant_response})

    return assistant_response

# Main
if __name__ == "__main__":
    payload = json.loads(sys.stdin.read())
    description = payload["description"]
    faqs = payload.get("faqs", [])
    query = payload["query"]

    answer = rag_groq_chat(description, faqs, query)
    print(json.dumps({"answer": answer}))
