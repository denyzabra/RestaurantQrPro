import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Smartphone, Users, BarChart3, MessageCircle, Sparkles } from "lucide-react";
import Logo from "@/components/logo";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="sm" showText={false} />
              <span className="ml-3 text-sm text-gray-600">QR Restaurant Ordering</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {user.username}</span>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm">Admin Panel</Button>
                    </Link>
                  )}
                  {(user.role === "staff" || user.role === "admin") && (
                    <Link href="/staff">
                      <Button variant="outline" size="sm">Staff Dashboard</Button>
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/auth">
                  <Button variant="outline">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern QR Code
            <span className="text-primary block">Restaurant Ordering</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of dining with AI-powered recommendations, real-time order tracking, and seamless mobile-first ordering.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/menu/demo">
              <Button size="lg" className="w-full sm:w-auto">
                <QrCode className="mr-2 h-5 w-5" />
                Try Demo Menu
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5" />
                AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">Everything you need for modern restaurant operations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Mobile-First Design</CardTitle>
                <CardDescription>
                  Optimized for touch devices with intuitive navigation and fast ordering
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Personalized meal suggestions and smart upselling powered by OpenAI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <QrCode className="h-10 w-10 text-primary mb-4" />
                <CardTitle>QR Code Ordering</CardTitle>
                <CardDescription>
                  Contactless ordering with table-specific QR codes for seamless service
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Staff Management</CardTitle>
                <CardDescription>
                  Real-time order tracking and role-based dashboards for efficient operations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Comprehensive analytics with AI-powered inventory predictions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI Chat Assistant</CardTitle>
                <CardDescription>
                  Natural language support for menu questions and dietary restrictions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join the future of dining with SnapServe's comprehensive restaurant management platform.
          </p>
          
          {!user ? (
            <Link href="/auth">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
          ) : (
            <div className="space-x-4">
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button size="lg" variant="secondary">
                    Go to Admin Panel
                  </Button>
                </Link>
              )}
              {(user.role === "staff" || user.role === "admin") && (
                <Link href="/staff">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                    Staff Dashboard
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">SnapServe</span>
            </div>
            <p className="text-gray-400 mb-8">
              Modern QR code restaurant ordering platform with AI-powered features
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 SnapServe. Built with React, Express, and OpenAI.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
