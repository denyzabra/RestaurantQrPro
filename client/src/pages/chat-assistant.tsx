import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Coffee,
  Utensils,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "Do you have gluten-free options?",
  "What are your most popular dishes?", 
  "Can you recommend something spicy?",
  "What vegetarian options do you have?",
  "Are there any nut-free dishes?",
  "What's your signature cocktail?"
];

export default function ChatAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/menu-items"],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/ai/chat", { message });
      return res.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Chat error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "assistant", 
      content: "Hello! I'm your AI assistant for SnapServe. I can help you with menu questions, dietary restrictions, recommendations, and more. What would you like to know?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    chatMutation.mutate(content.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        sendMessage(transcript);
      };
      
      recognition.onerror = () => {
        toast({
          title: "Voice recognition error",
          description: "Please try again or type your message",
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-600">Ask me anything about our menu!</p>
              </div>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Quick Questions */}
        {messages.length <= 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="h-5 w-5 mr-2" />
                Quick Questions
              </CardTitle>
              <CardDescription>
                Click on any question to get started, or type your own message below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4 text-left"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-1 rounded mr-3">
                        {index % 3 === 0 ? <Utensils className="h-4 w-4 text-primary" /> :
                         index % 3 === 1 ? <Coffee className="h-4 w-4 text-primary" /> :
                         <AlertCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <span className="text-sm">{question}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 p-0">
            <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === "assistant" && (
                        <Bot className="h-4 w-4 mt-0.5 text-primary" />
                      )}
                      {message.type === "user" && (
                        <User className="h-4 w-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === "user" 
                            ? "text-primary-foreground/70" 
                            : "text-gray-500"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg max-w-xs">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about the menu..."
                  disabled={chatMutation.isPending}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={handleVoiceInput}
                  disabled={chatMutation.isPending}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || chatMutation.isPending}
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI assistant can help with menu questions, allergies, and recommendations
            </p>
          </div>
        </Card>

        {/* Features Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Utensils className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-sm">Menu Information</h3>
              <p className="text-xs text-gray-600 mt-1">
                Get details about ingredients, preparation, and recommendations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-sm">Dietary Restrictions</h3>
              <p className="text-xs text-gray-600 mt-1">
                Find options for allergies, vegetarian, vegan, and other dietary needs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-sm">Smart Recommendations</h3>
              <p className="text-xs text-gray-600 mt-1">
                Get personalized dish suggestions based on your preferences
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
