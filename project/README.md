# TechStore - E-Commerce Website

A modern, fully functional e-commerce website for electronics products. Built with HTML, CSS, JavaScript, and Bootstrap 5. This is a **frontend-only demo** that uses localStorage for data persistence.

![TechStore](https://img.shields.io/badge/TechStore-E--Commerce-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Customer Features
- **Product Browsing** - View all products with grid layout
- **Search & Filter** - Search products by name, filter by category, price range, and rating
- **Sorting** - Sort by price, rating, or name
- **Shopping Cart** - Add/remove items, update quantities
- **Checkout** - Complete checkout with shipping and payment forms
- **Order History** - View past orders with detailed information
- **Product Reviews** - Read and write product reviews with star ratings
- **User Authentication** - Register and login functionality

### Admin Features
- **Admin Dashboard** - View statistics (products, orders, users, revenue)
- **Product Management** - Add, edit, delete products
- **Order Management** - View all orders, update order status
- **User Management** - View registered users, delete users

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@techstore.com` | `admin123` |
| Customer | `customer@techstore.com` | `customer123` |

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styles with CSS variables
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Bootstrap 5.3** - Responsive UI framework
- **Bootstrap Icons** - Icon library
- **localStorage** - Client-side data persistence

## Project Structure

```
project/
├── index.html              # Homepage
├── products.html           # Products listing page
├── product-detail.html     # Individual product page
├── cart.html               # Shopping cart page
├── checkout.html           # Checkout page
├── login.html              # Login page
├── register.html           # Registration page
├── orders.html             # Order history page
├── admin.html              # Admin panel
├── css/
│   └── style.css           # Custom styles
└── js/
    ├── data.js             # Data layer (localStorage)
    ├── auth.js             # Authentication module
    ├── cart.js             # Shopping cart module
    ├── products.js         # Products listing module
    ├── product-detail.js   # Product detail module
    ├── checkout.js         # Checkout module
    ├── orders.js           # Orders module
    ├── admin.js            # Admin panel module
    ├── reviews.js          # Reviews module
    └── main.js             # Common functionality
```

## Getting Started

### Option 1: Local Development

1. **Clone or download** this repository
2. **Open** the project folder in your code editor
3. **Open** `index.html` in your browser (or use a local server)

For a better development experience, use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### Option 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the project folder
3. Your site will be live instantly

### Option 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with default settings

### Option 4: GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select the main branch
4. Your site will be live at `https://yourusername.github.io/repo-name`

## Data Persistence

All data is stored in the browser's **localStorage**:
- Products
- Users
- Cart items
- Orders
- Reviews
- User session

**Note:** Data is stored locally in your browser. Clearing browser data will reset all stored information.

## Default Products

The store comes pre-loaded with 16 electronics products:
- Laptops (MacBook Pro, Dell XPS, ASUS ROG)
- Smartphones (iPhone, Samsung Galaxy, Google Pixel)
- Tablets (iPad Pro, Galaxy Tab)
- Headphones (Sony WH-1000XM5, AirPods Pro)
- Smartwatches (Apple Watch Ultra, Garmin Fenix)
- Cameras (Canon EOS R5, Sony A7 IV)
- Accessories (Magic Keyboard, MX Master 3S)

## Key Features Explained

### Authentication
- Simulated login/register with localStorage
- Session persistence across page reloads
- Role-based access (admin vs customer)

### Shopping Cart
- Add/remove items
- Update quantities
- Persistent cart across sessions
- Real-time cart count in navbar

### Checkout
- Shipping information form
- Payment information form (simulated)
- Order summary with tax calculation
- Order confirmation with order number

### Admin Panel
- Protected route (requires admin login)
- Product CRUD operations
- Order status management
- User management
- Real-time statistics

### Reviews
- 5-star rating system
- Rating distribution visualization
- Review submission with validation
- Average rating calculation

## Customization

### Change Store Name
Search and replace "TechStore" in all HTML files.

### Add Products
Edit `js/data.js` and modify the `getDefaultProducts()` function.

### Change Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    /* ... */
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- **Images:** Unsplash (via source URLs)
- **Icons:** Bootstrap Icons
- **Framework:** Bootstrap 5
- **Developer:** Created for portfolio/CV purposes

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for educational purposes**
