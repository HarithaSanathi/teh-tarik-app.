# STM Salam - Premium Food & Beverage App (2026 Edition)

Welcome to the **STM Salam** digital storefront. This is a high-performance, mobile-first web application designed for a premium Teh Tarik and Kebab shop, featuring real-time kitchen tracking, administrative inventory management, and a seamless WhatsApp-integrated checkout flow.

## 🚀 Key Features

### 🛒 Customer Experience
- **Dynamic Menu**: Real-time menu filtered by categories with premium visuals.
- **Scan & Pay Checkout**: Frictionless payment flow support via SGQR and PayNow.
- **Live Order Tracking**: Interactive map-style progress bar showing real-time kitchen stages.
- **Profile Dashboard**: Personalized order history, wallet balance, and dietary preferences.
- **WhatsApp Integration**: Automated order summaries sent directly to the shop.

### 👨‍🍳 Admin Command Center
- **Order Management**: Live dashboard to update cooking stages (Preparing, Ready, Delivering).
- **Inventory Control**: Real-time management of products, prices, and availability.
- **Category Manager**: Organize your menu with custom icons and sorting.
- **Gallery Management**: Portfolio of high-resolution food photography.
- **Payment Verification**: Manual check-off for PayNow transactions.

## 🛠️ Tech Stack
- **Frontend**: React.js 18 + Vite
- **Styling**: Premium Vanilla CSS + Lucide Icons + Framer Motion
- **Database**: Google Firebase (Firestore)
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Auth

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)

### Local Development
1. Clone the repository.
2. Navigate to `/frontend`.
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

### Deployment
To build and deploy the project to the live site:
```bash
npm run build
firebase deploy --only hosting,firestore
```

## 🔒 Security & Rules
The project uses strictly enforced Firestore security rules located in `firestore.rules`. 
- **Administrative** collections require authentication.
- **Public** collections (Products/Menu) allow read-access for customers.

---
© 2026 STM Salam. Built with ❤️ for premium dining.
