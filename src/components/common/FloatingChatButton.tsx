import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FloatingChatButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/chat")}
      title="Open Chat"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
