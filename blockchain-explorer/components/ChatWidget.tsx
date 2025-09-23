import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import type { ChatMessage } from '../types';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChatWidgetProps {
  isReady: boolean;
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isReady, history, onSendMessage, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(scrollToBottom, [history]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const parseMarkdown = (text: string) => {
    return { __html: marked.parse(text) };
  };

  if (!isReady) return null;

  return (
    <>
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 h-16 w-16 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-blue-500 transition-transform transform hover:scale-110 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        aria-label="Open AI Chat"
      >
        <ChatIcon className="h-8 w-8" />
      </button>

      <div className={`fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-lg h-[70vh] max-h-[700px] bg-brand-surface border border-brand-border rounded-xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <header className="flex items-center justify-between p-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-brand-primary" />
            <h3 className="font-semibold text-brand-text">Ask AI About This Wallet</h3>
          </div>
          <button onClick={handleToggle} className="text-brand-secondary hover:text-brand-text">
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-brand-border text-brand-text'}`}>
                 <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={parseMarkdown(msg.content + (isLoading && index === history.length - 1 ? '...' : ''))} />
              </div>
            </div>
          ))}
           {isLoading && history[history.length - 1]?.role === 'user' && (
             <div className="flex justify-start">
               <div className="max-w-[80%] rounded-lg px-4 py-2 bg-brand-border text-brand-text">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-brand-secondary rounded-full animate-bounce"></div>
                 </div>
               </div>
             </div>
           )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-brand-border">
          <div className="flex items-center bg-brand-bg border border-brand-border rounded-lg focus-within:ring-2 focus-within:ring-brand-primary">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What was the largest transaction?"
              className="w-full bg-transparent p-3 text-brand-text focus:outline-none"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="p-3 text-brand-primary disabled:text-brand-secondary hover:text-blue-400 disabled:cursor-not-allowed">
              <SendIcon className="h-6 w-6"/>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};