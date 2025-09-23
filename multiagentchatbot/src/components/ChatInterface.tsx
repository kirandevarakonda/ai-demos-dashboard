import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { sendTextMessage, uploadFile } from "@/services/webhookService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add a welcome message on component mount
  useEffect(() => {
    const welcomeMessage = {
      id: "welcome",
      content: "Hello! I'm your AI assistant. You can ask me questions or upload files for processing.",
      isUser: false
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;
    
    // Generate a unique ID for this message
    const messageId = Date.now().toString();
    
    // Add user message to chat
    const userMessage = { id: messageId, content: message, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set processing state
    setIsProcessing(true);
    
    try {
      // Add an initial empty message from assistant
      const assistantMessageId = `response-${messageId}`;
      setCurrentAssistantMessageId(assistantMessageId);
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: assistantMessageId, content: "", isUser: false }
      ]);
      
      // Handle streaming response
      let finalContent = "";
      await sendTextMessage(message, (chunk) => {
        finalContent = chunk; // This now contains accumulated text up to current point
        
        // Update the assistant message with current stream content
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: finalContent } 
              : msg
          )
        );
      });
      
      // Clear the current assistant message ID
      setCurrentAssistantMessageId(null);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (isUploading) return;
    
    // Reset states
    setIsUploading(true);
    setUploadProgress(0);
    
    // Add a message indicating file upload
    const fileMessageId = `file-${Date.now()}`;
    setMessages(prevMessages => [
      ...prevMessages, 
      { id: fileMessageId, content: `Uploading file: ${file.name}`, isUser: true }
    ]);
    
    try {
      // Add an initial empty message from assistant
      const assistantMessageId = `response-${fileMessageId}`;
      setCurrentAssistantMessageId(assistantMessageId);
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { id: assistantMessageId, content: "", isUser: false }
      ]);
      
      // Handle file upload with progress tracking
      let finalContent = "";
      await uploadFile(
        file,
        (progress) => setUploadProgress(progress),
        (chunk) => {
          finalContent = chunk;
          
          // Update the assistant message with current stream content
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: finalContent } 
                : msg
            )
          );
        }
      );
      
      // Clear the current assistant message ID
      setCurrentAssistantMessageId(null);
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto animate-scale-in">
      <Card className="flex flex-col h-[80vh] shadow-2xl border border-white/10 glass-morphism bg-white/10 backdrop-blur-lg transition-all duration-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-gradient">AI Assistant</CardTitle>
          <CardDescription>Ask questions or upload files for analysis</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`animate-slide-in ${message.isUser ? 'slide-in-right' : 'slide-in-left'}`}
            >
              <ChatMessage
                content={message.content}
                isUser={message.isUser}
                isStreaming={currentAssistantMessageId === message.id}
              />
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          isProcessing={isProcessing}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </Card>
    </div>
  );
};

export default ChatInterface;
