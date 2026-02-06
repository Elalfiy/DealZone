# DealZone - B2B Trading Platform

A modern, premium B2B industrial marketplace connecting Suppliers and Manufacturers with secure escrow-protected payments.

## Features

- **Secure Escrow Payments** - Funds held safely until delivery confirmation
- **Verified Suppliers** - KYC verification for all suppliers
- **AI Recommendations** - Smart supplier and product suggestions
- **Auctions System** - Competitive bidding for bulk orders
- **Integrated Shipping** - Real-time tracking and logistics
- **ReDeal Zone** - Surplus materials marketplace
- **In-App Chat** - Direct communication between parties
- **Deal Tracking** - Complete transaction monitoring

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
DealZone/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Card.jsx
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Sidebar.jsx
│   │   └── SkeletonLoader.jsx
│   ├── pages/          # Page components
│   │   ├── LandingPage.jsx
│   │   ├── SignUp.jsx
│   │   ├── Login.jsx
│   │   ├── Verification.jsx
│   │   ├── ManufacturerDashboard.jsx
│   │   ├── SupplierDashboard.jsx
│   │   ├── Marketplace.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── RequestDetails.jsx
│   │   ├── Chat.jsx
│   │   ├── EscrowPayment.jsx
│   │   ├── DealTracking.jsx
│   │   ├── ShippingTracking.jsx
│   │   ├── RatingReview.jsx
│   │   └── ReDealZone.jsx
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Design System

### Colors
- **Primary Blue**: `#1A73E8`
- **Secondary Gray**: `#F4F6F8`
- **Accent Green**: `#00C853` (ReDeal Zone)
- **Text Dark**: `#111827`

### Typography
- **Cairo** - Headings (Arabic/English support)
- **Inter** - Body text and UI elements

### Key Features
- Fully responsive design
- Smooth animations and transitions
- Glassmorphism effects
- Modern card-based layouts
- Professional enterprise UI

## Pages

1. **Landing Page** - Hero section, features, testimonials
2. **Sign Up** - Multi-step registration with KYC
3. **Login** - Authentication
4. **Verification** - Pending verification screen
5. **Manufacturer Dashboard** - Purchase management
6. **Supplier Dashboard** - Product and offer management
7. **Marketplace** - Browse products and requests
8. **Product Details** - Full product information
9. **Request Details** - Purchase request details
10. **Chat** - In-app messaging
11. **Escrow Payment** - Secure payment flow
12. **Deal Tracking** - Transaction monitoring
13. **Shipping Tracking** - Real-time shipment tracking
14. **Rating & Review** - Post-deal feedback
15. **ReDeal Zone** - Surplus materials marketplace

## Development Notes

- All pages are fully functional UI mockups
- Backend integration points are clearly marked
- Components are reusable and modular
- Animations use Framer Motion for smooth transitions
- Responsive breakpoints: mobile, tablet, desktop

## License

This project is created for DealZone platform.

