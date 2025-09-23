import streamlit as st
import pdfplumber
import re
import os
import openai
import json
import time
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Function to extract structured data using OpenAI
def extract_structured_data(text):
    prompt = f"""
You are an expert at extracting structured data from insurance documents. 
Given the following document text, extract the key fields as a JSON object with these keys:
- Name
- Email
- Date of Birth
- Policy Number
- Policy Issuer
- Insured Address
- Insured Phone
- Claim Amount
- Date of Admission
- Date of Discharge
- Diagnosis
- Doctor Name
- Hospital Name
- Hospital Address
- Relationship to Policyholder

The document may use abbreviations or different formats, e.g. 'DOB' for 'Date of Birth', extra spaces, or different order. Be case-insensitive and robust to formatting.

Example:
Document Text:
Name: John Doe
DOB : 1990-01-01
Email: john@example.com
Policy Number : ABC123
Policy Issuer: Acme Insurance
Insured Address: 123 Main St, Springfield
Insured Phone: 555-1234
Claim Amount: 5000
Date of Admission: 2023-01-10
Date of Discharge: 2023-01-15
Diagnosis: Fracture
Doctor Name: Dr. Smith
Hospital Name: City Hospital
Hospital Address: 456 Health Ave, Springfield
Relationship to Policyholder: Self

Output:
{{
  "Name": "John Doe",
  "Email": "john@example.com",
  "Date of Birth": "1990-01-01",
  "Policy Number": "ABC123",
  "Policy Issuer": "Acme Insurance",
  "Insured Address": "123 Main St, Springfield",
  "Insured Phone": "555-1234",
  "Claim Amount": "5000",
  "Date of Admission": "2023-01-10",
  "Date of Discharge": "2023-01-15",
  "Diagnosis": "Fracture",
  "Doctor Name": "Dr. Smith",
  "Hospital Name": "City Hospital",
  "Hospital Address": "456 Health Ave, Springfield",
  "Relationship to Policyholder": "Self"
}}

Document Text:
{text}

Output:
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.2
        )
        response_text = response.choices[0].message.content.strip()

        # Log raw response for debug
        print("Raw LLM response:\n", response_text)

        # Extract JSON portion from response
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            return {}
    except Exception as e:
        print("LLM Extraction Error:", e)
        return {}

# Streamlit UI
st.title("Form Filler AI Agent")
st.write("Upload an insurance PDF document. The app will extract details and automatically fill a local insurance form.")

uploaded_file = st.file_uploader("Choose a PDF file", type=["pdf"])

if uploaded_file is not None:
    extracted_text = ""
    with pdfplumber.open(uploaded_file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text + "\n"

    st.subheader("Extracted Text (from PDF)")
    st.text_area("PDF Content", extracted_text, height=300)

    if extracted_text.strip() == "":
        st.warning("No readable text found in PDF. It may be image-based or poorly formatted.")
    else:
        with st.spinner("Extracting structured data and filling the form..."):
            llm_doc_fields = extract_structured_data(extracted_text)
            st.subheader("LLM Extracted Fields")
            st.json(llm_doc_fields)

            # Mapping fields
            mapping = {
                "name": llm_doc_fields.get("Name", ""),
                "email": llm_doc_fields.get("Email", ""),
                "dob": llm_doc_fields.get("Date of Birth", ""),
                "policy": llm_doc_fields.get("Policy Number", ""),
                "policy_issuer": llm_doc_fields.get("Policy Issuer", ""),
                "insured_address": llm_doc_fields.get("Insured Address", ""),
                "insured_phone": llm_doc_fields.get("Insured Phone", ""),
                "claim_amount": llm_doc_fields.get("Claim Amount", ""),
                "admission_date": llm_doc_fields.get("Date of Admission", ""),
                "discharge_date": llm_doc_fields.get("Date of Discharge", ""),
                "diagnosis": llm_doc_fields.get("Diagnosis", ""),
                "doctor_name": llm_doc_fields.get("Doctor Name", ""),
                "hospital": llm_doc_fields.get("Hospital Name", ""),
                "hospital_address": llm_doc_fields.get("Hospital Address", ""),
                "relationship": llm_doc_fields.get("Relationship to Policyholder", ""),
            }
            st.subheader("Final Mapping to Form Fields")
            st.json(mapping)

            def fill_form_ai(url, mapping):
                try:
                    with sync_playwright() as p:
                        browser = p.chromium.launch(headless=False)
                        page = browser.new_page()
                        page.goto(url)
                        page.wait_for_selector('input[type="text"], input[type="email"]')
                        for key, value in mapping.items():
                            field = None
                            selectors = [
                                f'input[id="{key}"]',
                                f'input[name="{key}"]'
                            ]
                            for selector in selectors:
                                try:
                                    field = page.query_selector(selector)
                                    if field:
                                        break
                                except:
                                    continue
                            if not field:
                                try:
                                    field = page.get_by_placeholder(key)
                                except:
                                    pass
                            if field:
                                # Highlight the field with a rounded blue border
                                page.evaluate(
                                    """(element) => {
                                        element.style.boxShadow = '0 0 0 3px #00bfff, 0 0 8px #00bfff';
                                        element.style.borderRadius = '8px';
                                        element.style.transition = 'box-shadow 0.2s';
                                    }""",
                                    field
                                )
                                time.sleep(0.7)  # Pause to show highlight before filling
                                field.fill(value)
                                time.sleep(1.2)  # Slow down filling for human-like effect
                                # Remove highlight after filling
                                page.evaluate(
                                    """(element) => {
                                        element.style.boxShadow = '';
                                    }""",
                                    field
                                )
                        st.success("Form filled successfully. Please review and submit.")
                        page.wait_for_timeout(10000)
                        browser.close()
                except Exception as e:
                    st.error(f"Error filling form: {e}")

            # Your local form URL
            form_url = "http://localhost:9001/form.html"
            fill_form_ai(form_url, mapping)
else:
    st.info("Please upload a PDF to begin.")
    
    
