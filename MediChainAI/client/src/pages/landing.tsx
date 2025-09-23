import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue-50 to-health-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-medical-blue-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-slate-800">MedChain</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-medical-blue-600 transition-colors">Features</a>
              <a href="#security" className="text-slate-600 hover:text-medical-blue-600 transition-colors">Security</a>
              <a href="#demo" className="text-slate-600 hover:text-medical-blue-600 transition-colors">Demo</a>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white px-6 py-2 rounded-xl transition-colors font-medium"
              >
                Start Demo
              </Button>
            </div>
            <button className="md:hidden">
              <i className="fas fa-bars text-slate-600"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-health-green-50 text-health-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <i className="fas fa-leaf mr-2"></i>
              Secure • Private • Rewarding
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Own Your Health Data,<br />
              <span className="text-medical-blue-500">Earn Rewards</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Revolutionary platform that secures your medical records on blockchain, provides AI-powered insights, 
              and rewards you with HealthTokens for contributing to medical research.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-medical-blue-500 hover:bg-medical-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                <i className="fas fa-rocket mr-2"></i>
                Start Demo
              </Button>
              <Button 
                variant="outline"
                className="border border-slate-300 hover:border-medical-blue-300 text-slate-700 px-8 py-4 rounded-xl font-medium transition-colors"
              >
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">100%</div>
                <div className="text-sm text-slate-600">Data Security</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">AI-Powered</div>
                <div className="text-sm text-slate-600">Health Insights</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">Earn HTK</div>
                <div className="text-sm text-slate-600">HealthTokens</div>
              </div>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1576671081837-49000212a370?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Healthcare technology concept" 
              className="rounded-2xl shadow-2xl w-full" 
            />
            
            {/* Floating Cards */}
            <div className="absolute -left-4 top-8 bg-white rounded-xl p-4 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-health-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-check text-health-green-600"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Blockchain Secured</div>
                  <div className="text-xs text-slate-500">Immutable Records</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-8 bg-white rounded-xl p-4 shadow-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-crypto-gold-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-coins text-crypto-gold-600"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">+125 HTK</div>
                  <div className="text-xs text-slate-500">Earned Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
