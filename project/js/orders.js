/**
 * TechStore - Orders Module
 * Handles order history and order details display
 */

const Orders = {
    init() {
        this.renderOrders();
    },

    renderOrders() {
        const container = document.getElementById('ordersContent');
        if (!container) return;

        const user = TechStore.getCurrentUser();

        if (!user) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-person"></i>
                    <h3>Please login to view orders</h3>
                    <p>You need to be logged in to see your order history</p>
                    <a href="login.html?redirect=orders.html" class="btn btn-primary">
                        <i class="bi bi-box-arrow-in-right"></i> Login
                    </a>
                </div>
            `;
            return;
        }

        const orders = TechStore.getUserOrders(user.id);

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-box"></i>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
                    <a href="products.html" class="btn btn-primary">
                        <i class="bi bi-bag"></i> Browse Products
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    ${orders.map(order => `
                        <div class="order-card" onclick="Orders.showOrderDetail(${order.id})">
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <span class="fw-bold">Order #${order.orderNumber}</span>
                                </div>
                                <div class="col-md-2">
                                    <span class="text-muted">${new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div class="col-md-2">
                                    <span class="order-status order-status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                </div>
                                <div class="col-md-2">
                                    <span class="fw-bold">$${order.total.toFixed(2)}</span>
                                </div>
                                <div class="col-md-3 text-end">
                                    <button class="btn btn-outline-primary btn-sm">
                                        <i class="bi bi-eye"></i> View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    showOrderDetail(orderId) {
        const order = TechStore.getOrderById(orderId);
        if (!order) return;

        const content = document.getElementById('orderDetailContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="order-status order-status-${order.status}">${order.status}</span></p>
                </div>
                <div class="col-md-6">
                    <h6>Shipping Address</h6>
                    <p>
                        ${order.customerName}<br>
                        ${order.shippingAddress.address}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                        ${order.shippingAddress.country}
                    </p>
                </div>
            </div>
            <hr>
            <h6>Order Items</h6>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <h6>Payment Method</h6>
                    <p><i class="bi bi-credit-card"></i> Credit Card</p>
                </div>
                <div class="col-md-6">
                    <div class="card bg-light">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <span>Subtotal:</span>
                                <span>$${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Shipping:</span>
                                <span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Tax:</span>
                                <span>$${order.tax.toFixed(2)}</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>$${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        modal.show();
    }
};

// Initialize orders page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ordersContent')) {
        Orders.init();
    }
});
