import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
interface ToastProps {
  message: string;
  type: "success" | "error";
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={`flex items-center p-4 mb-4 text-white ${bgColor} rounded-lg shadow-md`}
    >
      <Icon className="mr-2" size={20} />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
