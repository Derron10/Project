/**
 * TechStore - Main Module
 * Handles common functionality across all pages
 */

const Main = {
    init() {
        this.loadFeaturedProducts();
        this.setupSearch();
        this.setupDemoFill();
    },

    // Load featured products on homepage
    loadFeaturedProducts() {
        const container = document.getElementById('featuredProducts');
        if (!container) return;

        const products = TechStore.getProducts();
        // Get top 4 rated products
        const featured = products
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);

        container.innerHTML = featured.map(product => `
            <div class="col-md-6 col-lg-3">
                <div class="product-card fade-in">
                    <div style="position: relative;">
                        <img src="${product.image}" alt="${product.name}" class="card-img-top" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect width=%22600%22 height=%22400%22 fill=%22%23374151%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239CA3AF%22 font-size=%2224%22 font-family=%22sans-serif%22%3EImage Unavailable%3C/text%3E%3C/svg%3E'">
                        ${product.stock === 0 ? '<span class="stock-badge stock-out">Out of Stock</span>' :
                          product.stock < 10 ? '<span class="stock-badge stock-low">Low Stock</span>' :
                          '<span class="stock-badge stock-in">In Stock</span>'}
                    </div>
                    <div class="product-card-body">
                        <h5 class="product-card-title">${product.name}</h5>
                        <div class="product-card-rating mb-2">
                            ${this.renderStars(product.rating)}
                            <span class="text-muted small">(${product.reviews || 0})</span>
                        </div>
                        <p class="product-card-price">$${product.price.toFixed(2)}</p>
                        <div class="product-card-actions">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-outline-primary">
                                <i class="bi bi-eye"></i>
                            </a>
                            <button class="btn btn-primary" onclick="Cart.addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="bi bi-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderStars(rating, maxStars = 5) {
        let stars = '';
        for (let i = 1; i <= maxStars; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="bi bi-star-fill"></i>';
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars += '<i class="bi bi-star-half"></i>';
            } else {
                stars += '<i class="bi bi-star"></i>';
            }
        }
        return stars;
    },

    // Setup search functionality
    setupSearch() {
        const searchForm = document.getElementById('searchForm');
        if (!searchForm) return;

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const search = searchForm.querySelector('input[name="q"]').value.trim();
            if (search) {
                window.location.href = `products.html?q=${encodeURIComponent(search)}`;
            }
        });
    },

    // Setup demo account fill for login page
    setupDemoFill() {
        window.fillDemo = (type) => {
            const emailField = document.getElementById('loginEmail');
            const passwordField = document.getElementById('loginPassword');

            if (!emailField || !passwordField) return;

            if (type === 'customer') {
                emailField.value = 'customer@techstore.com';
                passwordField.value = 'customer123';
            } else if (type === 'admin') {
                emailField.value = 'admin@techstore.com';
                passwordField.value = 'admin123';
            }

            Cart.showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} credentials filled`, 'info');
        };
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Main.init();
});
