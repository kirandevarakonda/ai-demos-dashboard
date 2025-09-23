
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}

const FileUploadButton = ({ 
  onFileSelect, 
  isUploading, 
  uploadProgress 
}: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      {!selectedFile && !isUploading && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleButtonClick}
          className="h-10 w-10 rounded-full"
          title="Upload file"
        >
          <Upload className="h-4 w-4" />
        </Button>
      )}
      
      {selectedFile && !isUploading && (
        <div className="flex items-center gap-2 bg-accent p-2 rounded-md">
          <span className="text-sm truncate max-w-[150px]">
            {selectedFile.name}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={clearSelectedFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {isUploading && (
        <div className="flex flex-col gap-1 min-w-[200px]">
          <Progress value={uploadProgress} className="h-2" />
          <span className="text-xs text-muted-foreground">
            Uploading: {uploadProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default FileUploadButton;
