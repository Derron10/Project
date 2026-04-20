/**
 * TechStore - Data Layer
 * Handles localStorage-based data persistence for products, users, cart, orders, and reviews
 */

const TechStore = {
    // Initialize default data if not exists
    init() {
        if (!localStorage.getItem('ts_products')) {
            this.setProducts(this.getDefaultProducts());
        }
        if (!localStorage.getItem('ts_users')) {
            this.setUsers(this.getDefaultUsers());
        }
        if (!localStorage.getItem('ts_cart')) {
            localStorage.setItem('ts_cart', JSON.stringify([]));
        }
        if (!localStorage.getItem('ts_orders')) {
            localStorage.setItem('ts_orders', JSON.stringify([]));
        }
        if (!localStorage.getItem('ts_reviews')) {
            localStorage.setItem('ts_reviews', JSON.stringify([]));
        }
        if (!localStorage.getItem('ts_currentUser')) {
            localStorage.setItem('ts_currentUser', JSON.stringify(null));
        }
    },

    // ============ PRODUCTS ============
    getProducts() {
        return JSON.parse(localStorage.getItem('ts_products') || '[]');
    },

    setProducts(products) {
        localStorage.setItem('ts_products', JSON.stringify(products));
    },

    getProductById(id) {
        return this.getProducts().find(p => p.id === parseInt(id));
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = Date.now();
        product.createdAt = new Date().toISOString();
        products.push(product);
        this.setProducts(products);
        return product;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            this.setProducts(products);
            return products[index];
        }
        return null;
    },

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== parseInt(id));
        this.setProducts(filtered);
        // Also delete associated reviews
        const reviews = this.getReviews();
        const filteredReviews = reviews.filter(r => r.productId !== parseInt(id));
        this.setReviews(filteredReviews);
    },

    getProductsByCategory(category) {
        if (!category) return this.getProducts();
        return this.getProducts().filter(p => p.category === category);
    },

    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getProducts().filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        );
    },

    // ============ USERS ============
    getUsers() {
        return JSON.parse(localStorage.getItem('ts_users') || '[]');
    },

    setUsers(users) {
        localStorage.setItem('ts_users', JSON.stringify(users));
    },

    getUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    },

    getUserById(id) {
        return this.getUsers().find(u => u.id === id);
    },

    addUser(user) {
        const users = this.getUsers();
        if (this.getUserByEmail(user.email)) {
            return { error: 'Email already registered' };
        }
        user.id = Date.now();
        user.createdAt = new Date().toISOString();
        users.push(user);
        this.setUsers(users);
        return user;
    },

    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            this.setUsers(users);
            return users[index];
        }
        return null;
    },

    deleteUser(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== id);
        this.setUsers(filtered);
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('ts_currentUser'));
    },

    setCurrentUser(user) {
        localStorage.setItem('ts_currentUser', JSON.stringify(user));
    },

    logout() {
        localStorage.setItem('ts_currentUser', JSON.stringify(null));
    },

    // ============ CART ============
    getCart() {
        return JSON.parse(localStorage.getItem('ts_cart') || '[]');
    },

    setCart(cart) {
        localStorage.setItem('ts_cart', JSON.stringify(cart));
    },

    addToCart(productId, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }

        this.setCart(cart);
        return cart;
    },

    removeFromCart(productId) {
        const cart = this.getCart();
        const filtered = cart.filter(item => item.productId !== productId);
        this.setCart(filtered);
        return filtered;
    },

    updateCartQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.productId === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.setCart(cart);
            }
        }
        return cart;
    },

    clearCart() {
        this.setCart([]);
    },

    getCartItemsWithProducts() {
        const cart = this.getCart();
        return cart.map(item => {
            const product = this.getProductById(item.productId);
            return {
                ...item,
                product,
                total: product ? product.price * item.quantity : 0
            };
        }).filter(item => item.product);
    },

    getCartTotal() {
        const items = this.getCartItemsWithProducts();
        return items.reduce((sum, item) => sum + item.total, 0);
    },

    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    // ============ ORDERS ============
    getOrders() {
        return JSON.parse(localStorage.getItem('ts_orders') || '[]');
    },

    setOrders(orders) {
        localStorage.setItem('ts_orders', JSON.stringify(orders));
    },

    getOrderById(id) {
        return this.getOrders().find(o => o.id === parseInt(id));
    },

    getUserOrders(userId) {
        return this.getOrders().filter(o => o.userId === userId);
    },

    createOrder(order) {
        const orders = this.getOrders();
        order.id = Date.now();
        order.orderNumber = 'ORD-' + Date.now();
        order.createdAt = new Date().toISOString();
        order.status = 'pending';
        orders.unshift(order); // Add to beginning
        this.setOrders(orders);

        // Reduce stock for ordered products
        order.items.forEach(item => {
            const product = this.getProductById(item.productId);
            if (product) {
                this.updateProduct(item.productId, { stock: Math.max(0, product.stock - item.quantity) });
            }
        });

        return order;
    },

    updateOrderStatus(id, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === parseInt(id));
        if (index !== -1) {
            orders[index].status = status;
            this.setOrders(orders);
            return orders[index];
        }
        return null;
    },

    // ============ REVIEWS ============
    getReviews() {
        return JSON.parse(localStorage.getItem('ts_reviews') || '[]');
    },

    setReviews(reviews) {
        localStorage.setItem('ts_reviews', JSON.stringify(reviews));
    },

    getProductReviews(productId) {
        return this.getReviews().filter(r => r.productId === productId);
    },

    addReview(review) {
        const reviews = this.getReviews();
        review.id = Date.now();
        review.createdAt = new Date().toISOString();
        reviews.unshift(review);
        this.setReviews(reviews);
        return review;
    },

    getProductRating(productId) {
        const reviews = this.getProductReviews(productId);
        if (reviews.length === 0) return { average: 0, count: 0 };

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            average: sum / reviews.length,
            count: reviews.length
        };
    },

    getRatingDistribution(productId) {
        const reviews = this.getProductReviews(productId);
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            distribution[r.rating]++;
        });
        return distribution;
    },

    // ============ DEFAULT DATA ============
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: 'MacBook Pro 16" M3 Max',
                category: 'laptops',
                price: 3499.99,
                stock: 15,
                description: 'The most powerful MacBook Pro ever. With the M3 Max chip, you get unprecedented performance for demanding workflows like editing 8K video and working with complex 3D environments.',
                image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.8,
                reviews: 124
            },
            {
                id: 2,
                name: 'iPhone 15 Pro Max',
                category: 'smartphones',
                price: 1199.99,
                stock: 45,
                description: 'The ultimate iPhone. Forged in titanium with the A17 Pro chip, featuring the most advanced camera system ever in a smartphone.',
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.9,
                reviews: 256
            },
            {
                id: 3,
                name: 'Sony WH-1000XM5',
                category: 'headphones',
                price: 399.99,
                stock: 30,
                description: 'Industry-leading noise cancellation with exceptional sound quality. 30-hour battery life and crystal-clear hands-free calling.',
                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.7,
                reviews: 89
            },
            {
                id: 4,
                name: 'iPad Pro 12.9" M2',
                category: 'tablets',
                price: 1099.99,
                stock: 20,
                description: 'Supercharged by M2. The ultimate iPad experience with the most advanced display ever in a tablet.',
                image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.8,
                reviews: 167
            },
            {
                id: 5,
                name: 'Apple Watch Ultra 2',
                category: 'smartwatches',
                price: 799.99,
                stock: 25,
                description: 'The most rugged and capable Apple Watch. Built for exploration, adventure, and endurance.',
                image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.9,
                reviews: 92
            },
            {
                id: 6,
                name: 'Canon EOS R5',
                category: 'cameras',
                price: 3899.99,
                stock: 8,
                description: 'Revolutionary full-frame mirrorless camera with 45MP sensor and 8K video recording capability.',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.9,
                reviews: 45
            },
            {
                id: 7,
                name: 'Dell XPS 15',
                category: 'laptops',
                price: 1899.99,
                stock: 18,
                description: 'Stunning InfinityEdge display meets powerful performance. Perfect for creators and professionals.',
                image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.6,
                reviews: 203
            },
            {
                id: 8,
                name: 'Samsung Galaxy S24 Ultra',
                category: 'smartphones',
                price: 1299.99,
                stock: 35,
                description: 'Galaxy AI is here. The ultimate smartphone with advanced AI features and S Pen included.',
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.7,
                reviews: 178
            },
            {
                id: 9,
                name: 'AirPods Pro (2nd Gen)',
                category: 'headphones',
                price: 249.99,
                stock: 60,
                description: 'Up to 2x more Active Noise Cancellation. Adaptive Transparency. Personalized Spatial Audio.',
                image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.8,
                reviews: 312
            },
            {
                id: 10,
                name: 'Magic Keyboard',
                category: 'accessories',
                price: 299.99,
                stock: 40,
                description: 'A great typing experience with improved scissor mechanism and Touch ID for secure unlock.',
                image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.5,
                reviews: 87
            },
            {
                id: 11,
                name: 'Samsung Galaxy Tab S9 Ultra',
                category: 'tablets',
                price: 1199.99,
                stock: 12,
                description: 'The largest Galaxy Tab ever. Dynamic AMOLED 2X display with S Pen included.',
                image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.6,
                reviews: 64
            },
            {
                id: 12,
                name: 'Garmin Fenix 7X Pro',
                category: 'smartwatches',
                price: 899.99,
                stock: 15,
                description: 'The ultimate multisport GPS watch with solar charging and advanced training features.',
                image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.8,
                reviews: 56
            },
            {
                id: 13,
                name: 'Sony A7 IV',
                category: 'cameras',
                price: 2499.99,
                stock: 10,
                description: 'The hybrid content creator\'s dream camera. 33MP full-frame sensor with advanced autofocus.',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.8,
                reviews: 78
            },
            {
                id: 14,
                name: 'Logitech MX Master 3S',
                category: 'accessories',
                price: 99.99,
                stock: 50,
                description: 'An iconic mouse remastered. Feel every moment of your workflow with 8K DPI tracking.',
                image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.7,
                reviews: 234
            },
            {
                id: 15,
                name: 'ASUS ROG Zephyrus G14',
                category: 'laptops',
                price: 1649.99,
                stock: 22,
                description: 'The ultimate gaming laptop that doesn\'t compromise on portability. AMD Ryzen 9 with RTX 4060.',
                image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.7,
                reviews: 145
            },
            {
                id: 16,
                name: 'Google Pixel 8 Pro',
                category: 'smartphones',
                price: 999.99,
                stock: 28,
                description: 'The AI-first smartphone. Best-in-class camera with Magic Eraser and Best Take.',
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=400&fit=crop&auto=format&q=80',
                rating: 4.6,
                reviews: 112
            }
        ];
    },

    getDefaultUsers() {
        return [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@techstore.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'John Customer',
                email: 'customer@techstore.com',
                password: 'customer123',
                role: 'customer',
                createdAt: new Date().toISOString()
            }
        ];
    }
};

// Initialize the data layer when the script loads
TechStore.init();
