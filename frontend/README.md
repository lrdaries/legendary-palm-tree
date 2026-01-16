# Divas Kloset Frontend

A modern React + TypeScript + Vite frontend for the Divas Kloset e-commerce platform.

## Features

- 🛍️ Modern e-commerce interface
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Fully responsive design
- 🛒 Shopping cart functionality
- ❤️ Wishlist management
- 🔍 Product filtering and sorting
- ⭐ Product reviews and ratings
- 📱 Mobile-first design

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Environment Variables

Create a `.env.local` file in the root:

```env
VITE_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── CartDrawer.tsx
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx
│   └── About.tsx
├── context/           # React context
│   └── StoreContext.tsx
├── services/          # API services
│   └── api.ts
├── types.ts           # TypeScript type definitions
├── constants.ts       # App constants and mock data
└── App.tsx           # Main app component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Integration with Backend

The frontend is designed to work with the existing Express.js backend. API calls are made to:

- `/api/products` - Product management
- `/api/cart` - Shopping cart operations
- `/api/wishlist` - Wishlist operations
- `/api/orders` - Order management
- `/api/reviews` - Product reviews

## Building for Production

To build the frontend for production:

1. From the project root:
```bash
npm run build-frontend
```

2. This will:
   - Install all frontend dependencies
   - Build the production bundle
   - Output to `/dist` directory

3. Start the server:
```bash
npm start
```

The Express server will serve the built frontend from the `/dist` directory.

## Development

While developing, you can run both frontend and backend:

1. Start the backend server:
```bash
npm start
```

2. In another terminal, start the frontend dev server:
```bash
npm run dev:frontend
```

The Vite dev server includes proxy configuration to forward API requests to the backend.

## Features Implementation

### Shopping Cart
- Add/remove products
- Update quantities
- Persistent storage (localStorage)
- Real-time cart count

### Wishlist
- Add/remove products
- Persistent storage (localStorage)
- Quick access from product cards

### Product Display
- Grid/list views
- Image galleries
- Size/color selection
- Customer reviews

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Optimized for all screen sizes
