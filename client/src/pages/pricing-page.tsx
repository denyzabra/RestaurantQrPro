import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Zap, Star, Crown } from "lucide-react";
import Logo from "@/components/logo";
import { useLocation } from "wouter";

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 80000,
    currency: "UGX",
    period: "/month",
    description: "Perfect for small cafés and food stalls",
    features: [
      "QR code ordering system",
      "Basic menu management",
      "Staff order view",
      "Up to 1 branch",
      "Basic analytics",
      "Email support"
    ],
    icon: Zap,
    popular: false,
    maxBranches: 1,
    hasAI: false,
    hasAnalytics: true,
    hasCustomBranding: false
  },
  {
    id: "pro",
    name: "Pro",
    price: 500000,
    currency: "UGX",
    period: "/month",
    description: "Ideal for mid-size restaurants with 1-3 branches",
    features: [
      "Everything in Starter",
      "AI meal recommendations",
      "Smart upselling",
      "Sentiment analysis",
      "Advanced analytics dashboard",
      "Up to 3 branches",
      "Inventory predictions",
      "Priority support",
      "Custom reporting"
    ],
    icon: Star,
    popular: true,
    maxBranches: 3,
    hasAI: true,
    hasAnalytics: true,
    hasCustomBranding: false
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1000000,
    currency: "UGX",
    period: "/month (starting price)",
    description: "For restaurant chains and hotels",
    features: [
      "Everything in Pro",
      "Unlimited branches",
      "Custom branding",
      "API integrations",
      "White-label solution",
      "Dedicated account manager",
      "Custom features",
      "24/7 phone support",
      "Advanced security",
      "Custom analytics"
    ],
    icon: Crown,
    popular: false,
    maxBranches: 999,
    hasAI: true,
    hasAnalytics: true,
    hasCustomBranding: true
  }
];

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: currency === 'UGX' ? 'UGX' : 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Redirect to signup with selected plan
    setLocation(`/auth?plan=${planId}`);
  };

  const handleStartTrial = () => {
    setLocation("/auth?trial=true");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" showText={false} />
              <span className="ml-3 text-lg font-semibold text-gray-900">SnapServe</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setLocation("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your restaurant with QR code ordering, AI-powered insights, and seamless management. 
            Start with a 7-day free trial.
          </p>
          
          <div className="mb-12">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
              onClick={handleStartTrial}
            >
              Start 7-Day Free Trial
            </Button>
            <p className="text-sm text-gray-500 mt-2">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : 'shadow-lg'}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <plan.icon className={`h-6 w-6 ${plan.popular ? 'text-primary' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price, plan.currency)}
                    </div>
                    <div className="text-sm text-gray-500">{plan.period}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare Features
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that best fits your restaurant's needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  {pricingPlans.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    QR Code Ordering
                  </td>
                  {pricingPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    AI Features
                  </td>
                  {pricingPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                      {plan.hasAI ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Maximum Branches
                  </td>
                  {pricingPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {plan.maxBranches === 999 ? 'Unlimited' : plan.maxBranches}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Custom Branding
                  </td>
                  {pricingPlans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                      {plan.hasCustomBranding ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of restaurants already using SnapServe to enhance their customer experience.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={handleStartTrial}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo size="sm" showText={false} />
            <span className="ml-2 text-lg font-semibold">SnapServe</span>
          </div>
          <p className="text-gray-400">
            © 2025 SnapServe. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}