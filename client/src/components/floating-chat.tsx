import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="floating-chat">
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Preview Card */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                AI Assistant
              </CardTitle>
              <CardDescription>
                Get instant help with menu questions, dietary restrictions, and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-2">
                    👋 Hi! I can help you with:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Menu recommendations</li>
                    <li>• Allergy and dietary information</li>
                    <li>• Ingredient details</li>
                    <li>• Restaurant information</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                    <div>
                      <p className="font-medium text-sm">Gluten-free options?</p>
                      <p className="text-xs text-gray-500">Find safe menu items</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="justify-start text-left h-auto p-3">
                    <div>
                      <p className="font-medium text-sm">Popular dishes</p>
                      <p className="text-xs text-gray-500">See what others love</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* CTA */}
              <Link href="/chat" onClick={() => setIsOpen(false)}>
                <Button className="w-full">
                  Open Full Chat
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
