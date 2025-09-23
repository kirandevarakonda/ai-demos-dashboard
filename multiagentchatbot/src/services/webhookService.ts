
/**
 * Service for communicating with the webhook
 */

const WEBHOOK_URL = "https://primary-production-809a.up.railway.app/webhook/4fb1e449-799e-42d4-8cf3-fdc7fd371004";

export interface WebhookResponse {
  content: string;
  error?: string;
}

/**
 * Sends a text message to the webhook and processes the streaming response
 */
export async function sendTextMessage(
  message: string,
  onChunk: (chunk: string) => void
): Promise<WebhookResponse> {
  try {
    // Encode the message for GET request
    const encodedMessage = encodeURIComponent(message);
    const url = `${WEBHOOK_URL}?message=${encodedMessage}`;
    
    console.log("Sending request to:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response as JSON
    const responseData = await response.json();
    console.log("Received response:", responseData);
    
    let output = "";
    
    // Check if the response is an array with an output field
    if (Array.isArray(responseData) && responseData[0]?.output) {
      output = responseData[0].output;
    } 
    // Check if the response has a direct output field
    else if (responseData?.output) {
      output = responseData.output;
    }
    // If neither, throw an error
    else {
      throw new Error("Invalid response format from webhook");
    }
    
    // Process the output with streaming effect
    let accumulatedText = "";
    for (let i = 0; i < output.length; i++) {
      accumulatedText += output.charAt(i);
      // Use a closure to capture the current state of accumulated text
      const currentText = accumulatedText;
      setTimeout(() => {
        onChunk(currentText);
      }, i * 30); // Adjust delay for smoother appearance
    }
    
    return { content: output };
  } catch (error) {
    console.error("Error sending message:", error);
    return { 
      content: "",
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Uploads a file to the webhook
 */
export async function uploadFile(
  file: File,
  onProgress: (progress: number) => void,
  onChunk: (chunk: string) => void
): Promise<WebhookResponse> {
  try {
    // Create a form data object for file metadata
    const params = new URLSearchParams({
      filename: file.name,
      type: file.type,
      size: file.size.toString()
    });
    
    // Read the file and convert to base64
    const reader = new FileReader();
    
    const filePromise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      onProgress(10); // Initial progress
    });
    
    reader.readAsDataURL(file);
    const base64Data = await filePromise;
    
    // Add file data to URL params
    params.append('filedata', base64Data);
    onProgress(50); // Upload progress simulation
    
    const url = `${WEBHOOK_URL}?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      }
    });
    
    onProgress(75); // Processing progress
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Process the response as JSON
    const responseData = await response.json();
    let output = "";
    
    // Check if the response is an array with an output field
    if (Array.isArray(responseData) && responseData[0]?.output) {
      output = responseData[0].output;
    } 
    // Check if the response has a direct output field
    else if (responseData?.output) {
      output = responseData.output;
    }
    // If neither, throw an error
    else {
      throw new Error("Invalid response format from webhook");
    }
    
    // Process the output with streaming effect
    let accumulatedText = "";
    for (let i = 0; i < output.length; i++) {
      accumulatedText += output.charAt(i);
      const currentText = accumulatedText;
      setTimeout(() => {
        onChunk(currentText);
      }, i * 30);
    }
    
    onProgress(100); // Complete
    return { content: output };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { 
      content: "",
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
