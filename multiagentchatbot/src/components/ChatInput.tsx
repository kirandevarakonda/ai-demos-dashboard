
import { useState, FormEvent, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import FileUploadButton from "./FileUploadButton";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  uploadProgress: number;
  isUploading: boolean;
}

const ChatInput = ({ 
  onSendMessage, 
  onFileUpload, 
  isProcessing,
  uploadProgress,
  isUploading
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage("");
    }
  };

  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus();
    }
  }, [isProcessing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 border-t border-white/5 p-4 bg-background/50 backdrop-blur-sm animate-slide-in"
      style={{ animationDelay: "0.3s" }}
    >
      <FileUploadButton 
        onFileSelect={onFileUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      <Input
        ref={inputRef}
        value={message}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="flex-1 bg-secondary/50 border-white/10 focus-visible:ring-primary"
        disabled={isProcessing}
        onKeyDown={handleKeyDown}
      />

      <Button 
        type="submit" 
        size="icon" 
        disabled={!message.trim() || isProcessing}
        className="h-10 w-10 rounded-full bg-primary hover:bg-primary/80 transition-all duration-300 hover:scale-105"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
