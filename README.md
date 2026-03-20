# 🛏️ Torts & Twirls — Premium Bedsheet E-Commerce

A fully functional, production-ready e-commerce platform for a premium bedsheet brand. Built with React.js, Node.js/Express, MongoDB, JWT authentication, and Razorpay payment integration.

---

## 📁 Project Structure

```
torts-and-twirls/
├── backend/                     # Node.js + Express API
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── adminController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   └── auth.js              # JWT protect + admin middleware
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Cart.js
│   ├── routes/                  # Express routers
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── wishlist.js
│   │   ├── payment.js
│   │   ├── admin.js
│   │   └── reviews.js
│   ├── scripts/
│   │   └── seed.js              # Database seeder with dummy data
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express entry point
│
└── frontend/                    # React.js SPA
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.js    # Sticky navbar with search overlay
    │   │   │   ├── Footer.js
    │   │   │   ├── ProtectedRoute.js
    │   │   │   └── AdminRoute.js
    │   │   └── product/
    │   │       ├── ProductCard.js   # Hover zoom, wishlist, quick-add
    │   │       └── ProductSkeleton.js
    │   ├── context/
    │   │   ├── AuthContext.js       # JWT auth state
    │   │   ├── CartContext.js       # Cart state + API sync
    │   │   └── WishlistContext.js   # Wishlist state
    │   ├── pages/
    │   │   ├── HomePage.js          # Hero, categories, featured, testimonials
    │   │   ├── ProductsPage.js      # Grid + filters + pagination
    │   │   ├── ProductDetailPage.js # Zoom, reviews, add to cart
    │   │   ├── CartPage.js          # Cart with quantity update
    │   │   ├── CheckoutPage.js      # 3-step: Address → Payment → Review
    │   │   ├── OrderSuccessPage.js
    │   │   ├── OrdersPage.js
    │   │   ├── OrderDetailPage.js   # Progress tracker
    │   │   ├── WishlistPage.js
    │   │   ├── ProfilePage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── NotFoundPage.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js  # Stats, recent orders, top products
    │   │       ├── AdminProducts.js   # Product table with edit/delete
    │   │       ├── AdminProductForm.js # Create/edit product form
    │   │       └── AdminOrders.js     # Order management with status updates
    │   ├── utils/
    │   │   └── api.js               # Axios instance + all API calls
    │   ├── App.js                   # Routes configuration
    │   ├── index.js
    │   └── index.css                # Tailwind + custom styles
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone / Extract the Project

```bash
cd torts-and-twirls
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/torts-and-twirls
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Razorpay (get from https://razorpay.com/dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe (optional alternative)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Seed the database with sample products and users:
```bash
npm run seed
```

This creates:
- **8 premium bedsheet products** with full details
- **Admin user**: `admin@tortsandtwirls.com` / `admin123456`
- **Test user**: `user@tortsandtwirls.com` / `user123456`

Start the backend server:
```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

The API will be running at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

Start the frontend:
```bash
npm start
```

The app will be running at: `http://localhost:3000`

---

## 🎨 Pages & Features

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero banner, categories, featured products, testimonials |
| Products | `/products` | Grid layout with filters (category, price, size) and sort |
| Product Detail | `/products/:id` | Image zoom on hover, reviews, add to cart |
| Cart | `/cart` | Item management, quantity update, order summary |
| Checkout | `/checkout` | 3-step: Address → Payment Method → Order Review |
| Order Success | `/order-success/:id` | Confirmation with order details |
| Orders | `/orders` | All past orders with status badges |
| Order Detail | `/orders/:id` | Progress tracker, item breakdown |
| Wishlist | `/wishlist` | Saved products grid |
| Profile | `/profile` | Edit name, phone, change password |
| Login | `/login` | JWT authentication |
| Register | `/register` | Account creation |
| Admin Dashboard | `/admin` | Stats, recent orders, top products |
| Admin Products | `/admin/products` | Full CRUD product management |
| Admin Orders | `/admin/orders` | Order status updates in-table |

---

## 💳 Payment Integration

### Razorpay (Primary — works in India)
1. Create account at [razorpay.com](https://razorpay.com)
2. Get Test API keys from Dashboard → Settings → API Keys
3. Add keys to both `.env` files
4. Test card: `4111 1111 1111 1111`, any future expiry, any CVV

### Cash on Delivery
Works out of the box — no configuration needed.

---

## 🔐 API Endpoints

### Auth
```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login (returns JWT)
GET    /api/auth/me            Get current user (protected)
PUT    /api/auth/profile       Update profile (protected)
PUT    /api/auth/password      Change password (protected)
POST   /api/auth/address       Add address (protected)
DELETE /api/auth/address/:id   Remove address (protected)
```

### Products
```
GET    /api/products           List with filters & pagination
GET    /api/products/featured  Featured products
GET    /api/products/:id       Single product
POST   /api/products/:id/reviews  Add review (protected)
```

### Cart (all protected)
```
GET    /api/cart               Get user's cart
POST   /api/cart               Add item
PUT    /api/cart/:itemId       Update quantity
DELETE /api/cart/:itemId       Remove item
DELETE /api/cart               Clear cart
```

### Orders (all protected)
```
POST   /api/orders             Create order from cart
GET    /api/orders/my          Get user's orders
GET    /api/orders/:id         Get single order
PUT    /api/orders/:id/pay     Update payment status
```

### Wishlist (all protected)
```
GET    /api/wishlist           Get wishlist
POST   /api/wishlist/:productId  Toggle item
```

### Payment (all protected)
```
POST   /api/payment/razorpay/create   Create Razorpay order
POST   /api/payment/razorpay/verify   Verify payment signature
POST   /api/payment/stripe/intent     Create Stripe PaymentIntent
```

### Admin (admin role required)
```
GET    /api/admin/stats              Dashboard statistics
GET    /api/admin/users              All users
POST   /api/admin/products           Create product
PUT    /api/admin/products/:id       Update product
DELETE /api/admin/products/:id       Soft-delete product
GET    /api/admin/orders             All orders (paginated)
PUT    /api/admin/orders/:id         Update order status
```

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| `cream` | `#FAF7F2` | Page background |
| `sand` | `#E8DDD0` | Borders, dividers |
| `taupe` | `#C4B5A0` | Muted text, placeholders |
| `blush` | `#F2E4DC` | Soft accent sections |
| `sage` | `#B8C9B5` | Success states, eco badges |
| `deep-brown` | `#4A3728` | Primary text, buttons |
| `warm-gray` | `#8B8078` | Secondary text |

### Typography
- **Display**: Cormorant Garamond (headings, brand name)
- **Serif**: Playfair Display (section headings)
- **Sans**: DM Sans (body, UI elements)

---

## 🔧 Environment Variables Reference

### Backend `.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `RAZORPAY_KEY_ID` | For payments | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay API secret |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key |
| `FRONTEND_URL` | Yes | CORS origin (e.g., http://localhost:3000) |

### Frontend `.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API URL |
| `REACT_APP_RAZORPAY_KEY_ID` | For payments | Razorpay publishable key |

---

## 🚢 Deployment

### Backend (Railway / Render / Heroku)
1. Push code to GitHub
2. Connect to Railway/Render
3. Set all environment variables
4. Set `NODE_ENV=production`
5. Use MongoDB Atlas for database

### Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Set `REACT_APP_API_URL` to your production backend URL
3. Deploy `build/` folder

---

## 🧪 Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tortsandtwirls.com` | `admin123456` |
| User | `user@tortsandtwirls.com` | `user123456` |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS 3 |
| State | React Context API |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 7 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Payments | Razorpay, Stripe |
| Notifications | React Toastify |
| Fonts | Google Fonts (Cormorant Garamond, DM Sans) |

---

## 🐛 Troubleshooting

**MongoDB connection failed**
- Ensure MongoDB is running locally: `mongod`
- Or use MongoDB Atlas and update `MONGO_URI`

**CORS errors**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly

**Razorpay not loading**
- Check the `<script>` tag in `public/index.html`
- Use test keys (starting with `rzp_test_`)

**JWT errors**
- Ensure `JWT_SECRET` is set and matches between sessions
- Clear `localStorage` in browser if token is corrupted

---

Built with ❤️ for Torts & Twirls
