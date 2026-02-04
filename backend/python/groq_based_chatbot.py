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
# Retriever
# =========================
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# =========================
# Format documents
# =========================
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# =========================
# Chat prompt template
# =========================
chat_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        "You are a helpful assistant. Answer questions using ONLY the context provided. "
        "If you don't know the answer, say 'I don't know'."
    ),
    HumanMessagePromptTemplate.from_template(
        "Context:\n{context}\n\nChat History:\n{chat_history}\n\nQuestion:\n{question}"
    )
])

# =========================
# Initialize chat history
# =========================
chat_history = []  # Stores all previous user/assistant messages

# =========================
# Groq-based RAG chat function
# =========================
def rag_groq_chat(question: str, stream: bool = True, **kwargs):
    # Retrieve relevant docs from FAISS
    relevant_docs = retriever._get_relevant_documents(question, run_manager=None)
    context = format_docs(relevant_docs)

    # Format chat history for prompt
    history_text = "\n".join(
        f"{entry['role'].capitalize()}: {entry['content']}" for entry in chat_history
    ) or "No previous messages."

    # Build final prompt
    prompt_text = chat_prompt.format(
        context=context,
        chat_history=history_text,
        question=question
    )

    # Store user message
    chat_history.append({"role": "user", "content": question})

    # Call Groq API
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt_text}],
        stream=stream,
        **kwargs
    )

    if stream:
        # Stream assistant response
        assistant_response = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                text_chunk = chunk.choices[0].delta.content
                assistant_response += text_chunk
                print(text_chunk, end="", flush=True)
        print()  # Newline after stream ends
        # Store assistant message
        chat_history.append({"role": "assistant", "content": assistant_response})
    else:
        assistant_response = completion.choices[0].message.content
        chat_history.append({"role": "assistant", "content": assistant_response})
        return assistant_response

# =========================
# Interactive chatbot loop
# =========================
print("Chat Assistant is online! Type 'exit' to quit.\n")
while True:
    user_input = input("You: ").strip()
    if user_input.lower() in ["exit", "quit"]:
        print("Assistant: Goodbye! 👋")
        break
    rag_groq_chat(user_input, stream=True, max_completion_tokens=300, temperature=0.5)
