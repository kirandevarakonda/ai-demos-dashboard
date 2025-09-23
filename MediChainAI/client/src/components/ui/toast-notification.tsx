import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ToastNotificationProps {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function ToastNotification({
  title,
  message,
  type = "success",
  onClose,
  autoHide = true,
  duration = 5000,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  const getIconAndColors = () => {
    switch (type) {
      case "success":
        return {
          icon: "fas fa-check",
          bgColor: "bg-white",
          borderColor: "border-health-green-200",
          iconBg: "bg-health-green-100",
          iconColor: "text-health-green-600",
        };
      case "error":
        return {
          icon: "fas fa-times",
          bgColor: "bg-white",
          borderColor: "border-red-200",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
        };
      case "warning":
        return {
          icon: "fas fa-exclamation",
          bgColor: "bg-white",
          borderColor: "border-yellow-200",
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
        };
      case "info":
        return {
          icon: "fas fa-info",
          bgColor: "bg-white",
          borderColor: "border-medical-blue-200",
          iconBg: "bg-medical-blue-100",
          iconColor: "text-medical-blue-600",
        };
      default:
        return {
          icon: "fas fa-check",
          bgColor: "bg-white",
          borderColor: "border-health-green-200",
          iconBg: "bg-health-green-100",
          iconColor: "text-health-green-600",
        };
    }
  };

  const { icon, bgColor, borderColor, iconBg, iconColor } = getIconAndColors();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className={`${bgColor} border ${borderColor} rounded-xl shadow-lg max-w-sm`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={`${icon} ${iconColor}`}></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{title}</p>
              <p className="text-sm text-slate-600">{message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <i className="fas fa-times text-xs"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing toast notifications
export function useToastNotification() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>>([]);

  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "success"
  ) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer,
  };
}
