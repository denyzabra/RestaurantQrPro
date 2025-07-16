import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, Check, ArrowRight, Store } from "lucide-react";
import { insertRestaurantSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Logo from "@/components/logo";

type RestaurantFormData = z.infer<typeof insertRestaurantSchema>;

const cuisineTypes = [
  "African", "Italian", "Chinese", "Indian", "Mexican", "American", 
  "French", "Japanese", "Thai", "Mediterranean", "Lebanese", "Fast Food",
  "Coffee & Tea", "Bakery", "Pizza", "Barbecue", "Seafood", "Vegetarian", "Other"
];

const steps = [
  { id: 1, name: "Restaurant Info", description: "Basic information about your restaurant" },
  { id: 2, name: "Plan Selection", description: "Choose your subscription plan" },
  { id: 3, name: "Setup Complete", description: "Your restaurant is ready!" }
];

export default function RestaurantSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const restaurantForm = useForm<RestaurantFormData>({
    resolver: zodResolver(insertRestaurantSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      cuisine: "",
      subscriptionTier: "trial",
      subscriptionStatus: "active",
      isActive: true,
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      const res = await apiRequest("POST", "/api/restaurants", {
        ...data,
        subscriptionTier: selectedPlan,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Restaurant created successfully!" });
      setCurrentStep(3);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating restaurant", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmitRestaurant = (data: RestaurantFormData) => {
    createRestaurantMutation.mutate(data);
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "UGX 80,000/month",
      features: ["QR ordering", "Basic analytics", "1 branch", "Email support"]
    },
    {
      id: "pro", 
      name: "Pro",
      price: "UGX 500,000/month",
      features: ["AI features", "Advanced analytics", "3 branches", "Priority support"],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise", 
      price: "Custom pricing",
      features: ["Unlimited branches", "Custom branding", "24/7 support", "API access"]
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={restaurantForm.handleSubmit(() => setCurrentStep(2))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input 
                  {...restaurantForm.register("name", { required: "Restaurant name is required" })}
                  placeholder="Bella Vista Restaurant" 
                />
                {restaurantForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{restaurantForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select onValueChange={(value) => restaurantForm.setValue("cuisine", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                {...restaurantForm.register("description")}
                placeholder="Tell us about your restaurant..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  {...restaurantForm.register("phone")}
                  placeholder="+256 700 123 456" 
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  {...restaurantForm.register("email")}
                  type="email"
                  placeholder="info@bellavista.com" 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                {...restaurantForm.register("address")}
                placeholder="123 Main Street, Kampala, Uganda"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input 
                {...restaurantForm.register("website")}
                placeholder="https://bellavista.com" 
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload Restaurant Logo</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB (Optional)</p>
              <Button variant="outline" size="sm" className="mt-2">
                Choose File
              </Button>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Continue to Plan Selection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Start with a 7-day free trial, then continue with your selected plan</p>
              <Badge className="mt-2">7-Day Free Trial Included</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  } ${plan.popular ? 'border-primary' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="font-semibold text-primary">
                      {plan.price}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={restaurantForm.handleSubmit(onSubmitRestaurant)}>
                {createRestaurantMutation.isPending ? "Setting up..." : "Complete Setup"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to SnapServe!
              </h3>
              <p className="text-gray-600 mb-4">
                Your restaurant has been successfully set up. Your 7-day free trial has started.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">What's next?</h4>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Set up your menu items and categories</li>
                  <li>• Configure tables and generate QR codes</li>
                  <li>• Add staff members</li>
                  <li>• Start taking orders!</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setLocation("/admin")}>
                <Store className="h-4 w-4 mr-2" />
                Go to Admin Dashboard
              </Button>
              <Button variant="outline" size="lg" onClick={() => setLocation("/pricing")}>
                View Pricing Details
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <div className="flex items-center">
              <Logo size="md" showText={false} />
              <span className="ml-3 text-lg font-semibold text-gray-900">Restaurant Setup</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                
                <div className="ml-3 text-sm">
                  <p className={`font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                  <p className="text-gray-500 hidden sm:block">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4
                    ${currentStep > step.id ? 'bg-primary' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              {currentStep === 1 && "Restaurant Information"}
              {currentStep === 2 && "Choose Your Plan"}
              {currentStep === 3 && "Setup Complete"}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 && "Tell us about your restaurant to get started"}
              {currentStep === 2 && "Select the plan that best fits your needs"}
              {currentStep === 3 && "Your restaurant is ready to start serving customers"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}