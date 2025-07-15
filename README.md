# SnapServe - QR Restaurant Ordering Platform

A comprehensive, mobile-first QR code restaurant ordering platform with AI-powered features built with React, Express, and OpenAI integration.

## 🚀 Features

### Customer Experience
- **QR Code Ordering**: Scan table-specific QR codes to access menus instantly
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Voice Ordering**: Web Speech API integration for hands-free ordering
- **AI Recommendations**: Personalized meal suggestions based on preferences
- **Smart Upsells**: Dynamic checkout prompts powered by GPT
- **Real-time Order Tracking**: Live updates on order status

### Staff Dashboard
- **Order Management**: Real-time order queue with status updates
- **Table Monitoring**: Live table status and occupancy tracking
- **Manual Orders**: Create orders for walk-in customers
- **Sentiment Alerts**: AI-powered feedback analysis for immediate issue resolution
- **WebSocket Integration**: Instant notifications for new orders

### Admin Panel
- **Menu Management**: Full CRUD operations for menu items and categories
- **Table Management**: QR code generation and table configuration
- **Staff Management**: User account creation and role management
- **Analytics Dashboard**: Revenue tracking and performance metrics
- **Inventory Predictions**: AI-powered stock level forecasting
- **Low Stock Alerts**: Automated inventory management

### AI-Powered Features
- **Meal Recommendations**: Personalized suggestions using OpenAI GPT-4o
- **Smart Upselling**: Dynamic cross-sell suggestions at checkout
- **Inventory Predictions**: Predictive analytics for stock management
- **Sentiment Analysis**: Automatic feedback processing and issue flagging
- **Chat Assistant**: Natural language support for customer queries

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Lucide React** for icons

### Backend
- **Express.js** with TypeScript
- **WebSocket** (ws) for real-time communication
- **Passport.js** for authentication
- **Express Session** for session management
- **Drizzle ORM** for database operations
- **Zod** for data validation

### AI Integration
- **OpenAI GPT-4o** for AI features
- **Web Speech API** for voice ordering
- **Natural language processing** for chat assistant

### Database
- **In-memory storage** (production ready for PostgreSQL)
- **Session storage** with automatic cleanup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - will use fallback)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd snapserve
