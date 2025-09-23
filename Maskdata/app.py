import streamlit as st
import pandas as pd
import base64
import io

# Refined encode and decode functions using a key
def mask_data(key, data):
    """Encrypts data using XOR with a repeating key and then Base64 encodes it."""
    encoded_chars = []
    key_len = len(key)
    for i in range(len(data)):
        key_char = key[i % key_len]
        encoded_char = chr((ord(data[i]) + ord(key_char)) % 256)
        encoded_chars.append(encoded_char)
    encoded_string = "".join(encoded_chars)
    # Base64 encode to handle potential unprintable characters from XOR
    return base64.urlsafe_b64encode(encoded_string.encode('utf-8')).decode('ascii')

def unmask_data(key, encoded_data):
    """Base64 decodes and then decrypts data using XOR with a repeating key."""
    try:
        # Base64 decode first
        decoded_string = base64.urlsafe_b64decode(encoded_data.encode('ascii')).decode('utf-8')

        decoded_chars = []
        key_len = len(key)
        for i in range(len(decoded_string)):
            key_char = key[i % key_len]
            decoded_char = chr((256 + ord(decoded_string[i]) - ord(key_char)) % 256)
            decoded_chars.append(decoded_char)
        return "".join(decoded_chars)
    except Exception as e:
        # Handle errors during Base64 decoding or XOR (e.g., incorrect key or non-masked data)
        st.error(f"Error unmasking data. Ensure the correct key is used and the column contains Base64 encoded data. Error: {e}")
        return encoded_data # Return original data if unmasking fails


# Streamlit UI
st.title("Excel Data Masking Tool")

st.write("""
Upload your Excel file, provide a key, select columns to mask/unmask,
and download the processed file.
""")

uploaded_file = st.file_uploader("Choose an Excel file (.xlsx)", type="xlsx")
key = st.text_input("Enter Masking/Unmasking Key", type="password")

if uploaded_file is not None:
    try:
        # Read the Excel file
        df = pd.read_excel(uploaded_file)
        st.write("Original Data Preview:")
        st.dataframe(df.head())

        # Select columns to mask
        all_columns = df.columns.tolist()
        columns_to_process = st.multiselect("Select columns to mask/unmask", all_columns)

        if st.button("Mask Selected Columns"):
            if not key:
                st.warning("Please enter a key to mask the data.")
            elif not columns_to_process:
                 st.warning("Please select columns to mask.")
            else:
                masked_df = df.copy()
                for col in columns_to_process:
                    if col in masked_df.columns:
                        # Ensure the column contains string data before applying mask
                        masked_df[col] = masked_df[col].astype(str).apply(lambda x: mask_data(key, x))
                    else:
                         st.warning(f"Column '{col}' not found in the dataframe.")
                st.write("Masked Data Preview:")
                st.dataframe(masked_df.head())

                # Provide download link for the masked file
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                    masked_df.to_excel(writer, index=False, sheet_name='MaskedData')
                processed_data = output.getvalue()

                st.download_button(
                    label="Download Masked Excel file",
                    data=processed_data,
                    file_name=f"masked_{uploaded_file.name}",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
                )

        if st.button("Unmask Selected Columns"):
            if not key:
                st.warning("Please enter a key to unmask the data.")
            elif not columns_to_process:
                 st.warning("Please select columns to unmask.")
            else:
                unmasked_df = df.copy()
                for col in columns_to_process:
                     if col in unmasked_df.columns:
                        # Ensure the column contains string data before applying unmask
                        # Handle potential non-string entries or errors during unmasking
                        unmasked_df[col] = unmasked_df[col].astype(str).apply(lambda x: unmask_data(key, x))
                     else:
                         st.warning(f"Column '{col}' not found in the dataframe.")

                st.write("Unmasked Data Preview:")
                st.dataframe(unmasked_df.head())

                # Provide download link for the unmasked file
                output = io.BytesIO()
                with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                    unmasked_df.to_excel(writer, index=False, sheet_name='UnmaskedData')
                processed_data = output.getvalue()

                st.download_button(
                    label="Download Unmasked Excel file",
                    data=processed_data,
                    file_name=f"unmasked_{uploaded_file.name}",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheet.sheet"
                )

    except Exception as e:
        st.error(f"An error occurred: {e}")

# Explanation of the logic
st.sidebar.header("Logic Explanation")
st.sidebar.write("""
**Masking:**
1.  The input string data is XORed character by character with the provided key.
2.  If the key is shorter than the data, the key is repeated.
3.  The result of the XOR operation can contain characters that are not easily printable or handleable.
4.  To address this, the XORed result is encoded using URL-safe Base64, converting it into a string of printable ASCII characters.
5.  This Base64 string is the masked data stored in the Excel file.

**Unmasking:**
1.  The Base64 encoded string (masked data) is first decoded back into its original byte representation.
2.  This byte data is then XORed character by character with the *same* key used for masking.
3.  Due to the properties of XOR (A ^ B ^ B = A), XORing the masked data with the key reverses the masking process, revealing the original data.
4.  Error handling is included to catch issues during Base64 decoding or XORing, which would typically happen if the wrong key is used or if the column was not properly masked initially.

**Security Considerations:**
This method provides a basic level of obfuscation. However, it's important to note that simple repeating XOR and Base64 are not considered cryptographically strong against determined attackers, especially if the key is short or predictable. For highly sensitive data requiring strong security, industry-standard encryption algorithms like AES should be used, typically through libraries like `cryptography`. This implementation prioritizes simplicity and demonstration of the reversible masking concept based on the user's notebook explorations.
""")