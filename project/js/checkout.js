/**
 * TechStore - Checkout Module
 * Handles checkout process and order creation
 */

const Checkout = {
    init() {
        // Check if cart is empty first (before login check to avoid losing cart)
        if (TechStore.getCart().length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        // Check if user is logged in
        if (!Auth.isLoggedIn()) {
            // Save cart to pending and redirect to login
            const currentCart = localStorage.getItem('ts_cart');
            if (currentCart) {
                localStorage.setItem('ts_pending_cart', currentCart);
            }
            const redirectUrl = encodeURIComponent(window.location.href);
            window.location.href = `login.html?redirect=${redirectUrl}`;
            return;
        }

        this.renderOrderSummary();
        this.bindEvents();
        this.setupFormValidation();
    },

    bindEvents() {
        document.getElementById('placeOrderBtn')?.addEventListener('click', () => {
            this.placeOrder();
        });
    },

    setupFormValidation() {
        const forms = document.querySelectorAll('#checkoutForm, #paymentForm');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                form.classList.add('was-validated');
            });
        });

        // Card number formatting
        document.getElementById('cardNumber')?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value.substring(0, 19);
        });

        // Expiry date formatting
        document.getElementById('expiryDate')?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value.substring(0, 5);
        });

        // CVV - only numbers
        document.getElementById('cvv')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    },

    renderOrderSummary() {
        const items = TechStore.getCartItemsWithProducts();
        const subtotal = TechStore.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        document.getElementById('orderSummary').innerHTML = `
            ${items.map(item => `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" class="me-2">
                        <div>
                            <p class="mb-0 small fw-bold">${item.product.name}</p>
                            <p class="mb-0 small text-muted">Qty: ${item.quantity}</p>
                        </div>
                    </div>
                    <span class="fw-bold">$${item.total.toFixed(2)}</span>
                </div>
            `).join('')}
        `;

        document.getElementById('summarySubtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('summaryShipping').innerHTML = shipping === 0 ? '<span class="text-success">FREE</span>' : '$' + shipping.toFixed(2);
        document.getElementById('summaryTax').textContent = '$' + tax.toFixed(2);
        document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
    },

    placeOrder() {
        // Validate forms
        const checkoutForm = document.getElementById('checkoutForm');
        const paymentForm = document.getElementById('paymentForm');

        if (!checkoutForm.checkValidity() || !paymentForm.checkValidity()) {
            checkoutForm.classList.add('was-validated');
            paymentForm.classList.add('was-validated');
            Cart.showToast('Please fill in all required fields', 'error');
            return;
        }

        // Create order
        const items = TechStore.getCartItemsWithProducts();
        const user = TechStore.getCurrentUser();

        const subtotal = TechStore.getCartTotal();
        const shipping = subtotal > 50 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        const order = TechStore.createOrder({
            userId: user.id,
            customerName: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            shippingAddress: {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value
            },
            items: items.map(item => ({
                productId: item.productId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            })),
            subtotal,
            shipping,
            tax,
            total,
            paymentMethod: 'card'
        });

        // Clear cart
        TechStore.clearCart();
        Cart.updateCartCount();

        // Show confirmation
        document.getElementById('orderNumber').textContent = order.orderNumber;
        const modal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
        modal.show();
    }
};

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkoutForm')) {
        Checkout.init();
    }
});
