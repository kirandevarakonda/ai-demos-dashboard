import openai
import streamlit as st
import PyPDF2
import os
import base64
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=OPENAI_API_KEY) # Initialize the OpenAI client

def extract_text_from_pdf(pdf_file):
    """Extract text from an uploaded PDF."""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        pdf_text = ""
        for page in pdf_reader.pages:
            pdf_text += page.extract_text()
        return pdf_text
    except Exception as e:
        return f"Error: {str(e)}"

def is_question_relevant(question, pdf_text):
    """Check if the question is relevant to the PDF content."""
    # question_keywords = set(question.lower().split())
    # pdf_keywords = set(pdf_text.lower().split())
    # common_words = question_keywords & pdf_keywords
    # return len(common_words) >= 3
    return True # Temporarily bypass relevance check

def answer_question_from_pdf(question, pdf_text):
    """Generate an answer to a user's question based on PDF content."""
    try:
        response = client.chat.completions.create( # Updated API call
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Only answer questions that are directly related to the given document. If the question is not related to the document, respond with 'The question is not related to the document.'"},
                {"role": "user", "content": f"Document content:\n{pdf_text}\n\nQuestion: {question}"}
            ],
            max_tokens=500
        )
        return response.choices[0].message.content.strip() # Updated response access
    except Exception as e:
        return f"Error: {str(e)}"

def displayPDF(uploaded_file):
    """Display the uploaded PDF in a Streamlit app."""
    try:
        bytes_data = uploaded_file.getvalue()
        base64_pdf = base64.b64encode(bytes_data).decode('utf-8')
        pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="700" height="400" type="application/pdf"></iframe>'
        st.markdown(pdf_display, unsafe_allow_html=True)
    except Exception as e:
        st.error(f"Error displaying PDF: {str(e)}")

# Streamlit App
st.title('Chat with PDF Using LLMs')

st.sidebar.info("""
### Instructions:
1. Upload a PDF document.
2. Ask questions related to the content of the PDF.
""")

uploaded_pdf = st.file_uploader("Upload PDF", type="pdf", help="Only PDF files are supported")

if uploaded_pdf:
    pdf_text = extract_text_from_pdf(uploaded_pdf)
    if pdf_text.startswith("Error"):
        st.error(pdf_text)
    else:
        displayPDF(uploaded_pdf)
        st.success("PDF text extracted successfully!")

        question = st.text_input("Ask a question related to the document:")

        if st.button("Get Answer"):
            if question.strip():
                if is_question_relevant(question, pdf_text):
                    st.info("Processing your question...")
                    answer = answer_question_from_pdf(question, pdf_text)
                else:
                    answer = "The question is not related to the document."
                st.markdown(
                    f'<div style="background-color: #2e2e2e; color: #f4f4f9; padding: 20px; font-size: 16px; border-radius: 5px;">{answer}</div>',
                    unsafe_allow_html=True
                )
            else:
                st.warning("Please enter a question.")