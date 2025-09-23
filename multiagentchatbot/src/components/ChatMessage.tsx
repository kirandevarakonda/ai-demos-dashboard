import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { MdSmartToy, MdPerson } from "react-icons/md";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isStreaming?: boolean;
}

const ChatMessage = ({ content, isUser, isStreaming = false }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full mr-2 transition-all duration-300",
          isUser
            ? "ml-2 mr-0 bg-gradient-to-br from-cyan-600 to-blue-500 shadow-lg"
            : "bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-500 shadow-lg"
        )}>
          <Avatar className="h-8 w-8 border-none flex items-center justify-center bg-transparent">
            {isUser ? (
              <MdPerson className="h-6 w-6 text-white" />
            ) : (
              <MdSmartToy className="h-6 w-6 text-white" />
            )}
          </Avatar>
        </div>
        <div className={cn(
          "p-3 rounded-lg text-sm backdrop-blur-sm transition-all duration-200 hover:shadow-lg",
          isUser 
            ? "bg-primary/80 text-primary-foreground rounded-tr-none border border-white/5" 
            : "bg-secondary/80 text-secondary-foreground rounded-tl-none border border-white/5",
          !content && "min-h-[48px] min-w-[100px]"
        )}>
          {/* Render markdown content */}
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            isStreaming ? "" : "No content"
          )}
          {isStreaming && (
            <span className="inline-block h-4 w-2 ml-1 bg-primary/50 animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
