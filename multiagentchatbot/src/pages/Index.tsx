import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] p-4 md:p-8 overflow-hidden relative">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute w-full h-full bg-gradient-to-tr from-primary/20 via-secondary/10 to-accent/20 animate-gradient-move opacity-80 blur-2xl" />
      </div>
      <div className="container mx-auto animate-fade-in relative z-10">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
        
        <header className="text-center mb-8 animate-float relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3 tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Chat with your intelligent assistant or upload files for processing
          </p>
        </header>
        
        <ChatInterface />
        
        <footer className="text-center text-sm text-muted-foreground mt-8 animate-pulse-slow">
          <p>© 2025 AI Assistant Interface. All messages are processed through a secure webhook.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
