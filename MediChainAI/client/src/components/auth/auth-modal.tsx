import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Login successful! Redirecting to dashboard...",
        });
        onOpenChange(false);
        // Reload the page to trigger auth check
        window.location.reload();
      } else {
        const data = await response.json();
        toast({
          title: "Login Failed",
          description: data.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="auth-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Login to MedChain</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </Label>
              <Input
                id="username"
                data-testid="input-username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit"
              data-testid="button-login"
              disabled={isLoading}
              className="w-full bg-medical-blue-500 hover:bg-medical-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="text-center text-sm text-slate-600">
            <p className="bg-slate-50 p-3 rounded-xl">
              <strong>Demo Credentials:</strong><br />
              Username: user1<br />
              Password: 123456
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}