/**
 * TechStore - Cart Module
 * Handles shopping cart functionality
 */

const Cart = {
    init() {
        this.updateCartCount();
    },

    // Update cart count in navbar
    updateCartCount() {
        const countElements = document.querySelectorAll('.cart-count');
        const count = TechStore.getCartCount();

        countElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline' : 'none';
        });
    },

    // Add item to cart
    addToCart(productId, quantity = 1) {
        const product = TechStore.getProductById(productId);

        if (!product) {
            this.showToast('Product not found', 'error');
            return;
        }

        if (product.stock < quantity) {
            this.showToast(`Only ${product.stock} items in stock`, 'error');
            return;
        }

        TechStore.addToCart(productId, quantity);
        this.updateCartCount();
        this.showToast(`${product.name} added to cart`, 'success');

        // Update cart UI if on cart page (check both pathname and href for deployed environments)
        if (window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html')) {
            this.renderCart();
        }
    },

    // Remove item from cart
    removeFromCart(productId) {
        TechStore.removeFromCart(productId);
        this.updateCartCount();
        this.renderCart();
        this.showToast('Item removed from cart', 'info');
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const product = TechStore.getProductById(productId);

        if (product && quantity > product.stock) {
            this.showToast(`Only ${product.stock} items in stock`, 'error');
            return;
        }

        TechStore.updateCartQuantity(productId, quantity);
        this.updateCartCount();
        this.renderCart();
    },

    // Clear cart
    clearCart() {
        TechStore.clearCart();
        this.updateCartCount();
        this.renderCart();
        this.showToast('Cart cleared', 'info');
    },

    // Render cart page
    renderCart() {
        const cartContent = document.getElementById('cartContent');
        if (!cartContent) return;

        const items = TechStore.getCartItemsWithProducts();

        if (items.length === 0) {
            cartContent.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-cart3"></i>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                        <a href="products.html" class="btn btn-primary">
                            <i class="bi bi-bag"></i> Browse Products
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        const subtotal = TechStore.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        cartContent.innerHTML = `
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Cart Items (${items.length})</h5>
                            <button class="btn btn-outline-danger btn-sm" onclick="Cart.clearCart()">
                                <i class="bi bi-trash"></i> Clear Cart
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        ${items.map(item => `
                            <div class="cart-item">
                                <img src="${item.product.image}" alt="${item.product.name}">
                                <div class="cart-item-details">
                                    <h5 class="cart-item-title">${item.product.name}</h5>
                                    <p class="text-muted small">${item.product.category}</p>
                                    <p class="cart-item-price">$${item.product.price.toFixed(2)}</p>
                                </div>
                                <div class="cart-item-quantity">
                                    <button class="btn btn-outline-secondary" onclick="Cart.updateQuantity(${item.productId}, ${item.quantity - 1})">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <span class="fw-bold">${item.quantity}</span>
                                    <button class="btn btn-outline-secondary" onclick="Cart.updateQuantity(${item.productId}, ${item.quantity + 1})">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                                <div class="text-end">
                                    <p class="fw-bold mb-2">$${item.total.toFixed(2)}</p>
                                    <button class="btn btn-link cart-item-remove" onclick="Cart.removeFromCart(${item.productId})">
                                        <i class="bi bi-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="cart-summary">
                    <h4 class="mb-4">Order Summary</h4>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Shipping:</span>
                        <span>${shipping === 0 ? '<span class="text-success">FREE</span>' : '$' + shipping.toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Tax (8%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-4">
                        <strong>Total:</strong>
                        <strong class="text-primary fs-4">$${total.toFixed(2)}</strong>
                    </div>
                    <a href="checkout.html" class="btn btn-primary w-100 btn-lg">
                        <i class="bi bi-credit-card"></i> Proceed to Checkout
                    </a>
                    <a href="products.html" class="btn btn-outline-secondary w-100 mt-2">
                        <i class="bi bi-arrow-left"></i> Continue Shopping
                    </a>
                    ${shipping > 0 ? `<p class="text-muted small mt-3 text-center">Add $${(50 - subtotal).toFixed(2)} more for free shipping!</p>` : ''}
                </div>
            </div>
        `;
    },

    // Show toast notification
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');

        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toastId = 'toast-' + Date.now();
        const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';

        container.innerHTML += `
            <div class="toast show ${bgClass} text-white mb-2" role="alert" id="${toastId}">
                <div class="toast-body d-flex justify-content-between align-items-center">
                    <span>${message}</span>
                    <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
                </div>
            </div>
        `;

        setTimeout(() => {
            const toast = document.getElementById(toastId);
            if (toast) toast.remove();
        }, 3000);
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
