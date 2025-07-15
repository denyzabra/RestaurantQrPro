import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface RecommendationResponse {
  recommendations: {
    id: number;
    name: string;
    reason: string;
    confidence: number;
  }[];
}

export interface InventoryPrediction {
  itemName: string;
  predictedDays: number;
  confidence: number;
  urgency: "low" | "medium" | "high";
}

export interface SentimentAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  issues?: string[];
}

export async function generateMealRecommendations(
  userId?: number,
  orderHistory?: any[],
  menuItems?: any[]
): Promise<RecommendationResponse> {
  try {
    const prompt = `Based on customer order history and available menu items, provide personalized meal recommendations.

Customer ID: ${userId || "anonymous"}
Order History: ${JSON.stringify(orderHistory || [])}
Available Menu Items: ${JSON.stringify(menuItems || [])}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "id": number,
      "name": "dish name",
      "reason": "why this is recommended",
      "confidence": 0.0-1.0
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a restaurant recommendation AI that provides personalized meal suggestions based on customer preferences and order history. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as RecommendationResponse;
  } catch (error) {
    console.error("Error generating meal recommendations:", error);
    return {
      recommendations: []
    };
  }
}

export async function generateUpsellPrompts(
  cartItems: any[],
  menuItems: any[]
): Promise<{ suggestions: any[] }> {
  try {
    const prompt = `Based on the current cart items, suggest complementary items from the menu for upselling.

Current Cart: ${JSON.stringify(cartItems)}
Available Menu Items: ${JSON.stringify(menuItems)}

Provide upsell suggestions in JSON format:
{
  "suggestions": [
    {
      "id": number,
      "name": "item name",
      "reason": "why this complements the cart",
      "price": "price",
      "priority": 1-3
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a restaurant upselling AI that suggests complementary menu items to enhance customer orders. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    return JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
  } catch (error) {
    console.error("Error generating upsell prompts:", error);
    return { suggestions: [] };
  }
}

export async function predictInventoryNeeds(
  inventoryItems: any[],
  orderHistory: any[]
): Promise<InventoryPrediction[]> {
  try {
    const prompt = `Analyze inventory levels and order history to predict when items will run out.

Current Inventory: ${JSON.stringify(inventoryItems)}
Recent Orders: ${JSON.stringify(orderHistory.slice(-20))}

Provide predictions in JSON format:
{
  "predictions": [
    {
      "itemName": "ingredient name",
      "predictedDays": number,
      "confidence": 0.0-1.0,
      "urgency": "low|medium|high"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an inventory management AI that predicts stock depletion based on usage patterns. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"predictions": []}');
    return result.predictions || [];
  } catch (error) {
    console.error("Error predicting inventory needs:", error);
    return [];
  }
}

export async function analyzeSentiment(feedbackText: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert for restaurant feedback. Analyze the sentiment and identify specific issues. Respond with JSON in this format: { 'sentiment': 'positive|negative|neutral', 'score': number between -1 and 1, 'confidence': number between 0 and 1, 'issues': ['issue1', 'issue2'] }"
        },
        {
          role: "user",
          content: `Analyze the sentiment of this restaurant feedback: "${feedbackText}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      sentiment: result.sentiment || "neutral",
      score: Math.max(-1, Math.min(1, result.score || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      issues: result.issues || []
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: "neutral",
      score: 0,
      confidence: 0
    };
  }
}

export async function chatAssistant(message: string, context?: any): Promise<string> {
  try {
    const systemPrompt = `You are a helpful restaurant AI assistant for SnapServe. You can help customers with:
- Menu questions and recommendations
- Dietary restrictions and allergen information
- Order assistance
- General restaurant information

Available menu context: ${JSON.stringify(context?.menuItems || [])}
Restaurant info: ${JSON.stringify(context?.restaurant || {})}

Be friendly, helpful, and concise. Always prioritize food safety for allergen questions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't understand that. Could you please rephrase your question?";
  } catch (error) {
    console.error("Error in chat assistant:", error);
    return "I'm experiencing some technical difficulties. Please try again later or speak with our staff for assistance.";
  }
}
