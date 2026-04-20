/**
 * TechStore - Admin Module
 * Handles admin panel functionality for managing products, orders, and users
 */

const Admin = {
    init() {
        // Check if user is admin
        if (!Auth.isAdmin()) {
            document.getElementById('adminAccessAlert').innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    You need admin privileges to access this page.
                    <a href="index.html" class="alert-link">Return to Home</a>
                </div>
            `;
            document.getElementById('adminContent').style.display = 'none';
            return;
        }

        this.loadStats();
        this.loadProducts();
        this.loadOrders();
        this.loadUsers();
        this.bindEvents();
    },

    bindEvents() {
        // Refresh stats button
        document.getElementById('refreshStats')?.addEventListener('click', () => {
            this.loadStats();
            Cart.showToast('Stats refreshed', 'success');
        });

        // Save product button
        document.getElementById('saveProduct')?.addEventListener('click', () => {
            this.saveProduct();
        });

        // Product form reset on modal close
        document.getElementById('productModal')?.addEventListener('hidden.bs.modal', () => {
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('productModalTitle').textContent = 'Add Product';
        });
    },

    loadStats() {
        const products = TechStore.getProducts();
        const orders = TechStore.getOrders();
        const users = TechStore.getUsers();

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    loadProducts() {
        const products = TechStore.getProducts();
        const tbody = document.getElementById('adminProductsTable');

        if (!tbody) return;

        tbody.innerHTML = products.map(product => {
            const ratingInfo = TechStore.getProductRating(product.id);
            return `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                    <td>${product.name}</td>
                    <td><span class="badge bg-secondary">${product.category}</span></td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>
                        <span class="badge ${product.stock === 0 ? 'bg-danger' : product.stock < 10 ? 'bg-warning' : 'bg-success'}">
                            ${product.stock}
                        </span>
                    </td>
                    <td>
                        <span class="text-warning">
                            ${'★'.repeat(Math.floor(ratingInfo.average))}${'☆'.repeat(5 - Math.floor(ratingInfo.average))}
                        </span>
                        <small class="text-muted">(${ratingInfo.count})</small>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="Admin.editProduct(${product.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteProduct(${product.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    loadOrders() {
        const orders = TechStore.getOrders();
        const tbody = document.getElementById('adminOrdersTable');

        if (!tbody) return;

        tbody.innerHTML = orders.map(order => {
            const user = TechStore.getUserById(order.userId);
            return `
                <tr>
                    <td>${order.orderNumber}</td>
                    <td>${order.customerName}<br><small class="text-muted">${user ? user.email : 'N/A'}</small></td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td><span class="order-status order-status-${order.status}">${order.status}</span></td>
                    <td>
                        <select class="form-select form-select-sm" style="width: auto; display: inline-block;" onchange="Admin.updateOrderStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    },

    loadUsers() {
        const users = TechStore.getUsers();
        const tbody = document.getElementById('adminUsersTable');

        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    ${user.role !== 'admin' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteUser(${user.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : '<span class="text-muted small">Cannot delete admin</span>'}
                </td>
            </tr>
        `).join('');
    },

    editProduct(id) {
        const product = TechStore.getProductById(id);
        if (!product) return;

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productModalTitle').textContent = 'Edit Product';

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    },

    saveProduct() {
        const id = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value.trim(),
            image: document.getElementById('productImage').value.trim()
        };

        // Validation
        if (!productData.name || !productData.category || !productData.price || !productData.description || !productData.image) {
            Cart.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (id) {
            // Update existing product
            TechStore.updateProduct(id, productData);
            Cart.showToast('Product updated successfully', 'success');
        } else {
            // Add new product
            productData.rating = 0;
            productData.reviews = 0;
            TechStore.addProduct(productData);
            Cart.showToast('Product added successfully', 'success');
        }

        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();

        this.loadStats();
        this.loadProducts();
    },

    deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        TechStore.deleteProduct(id);
        Cart.showToast('Product deleted successfully', 'success');
        this.loadStats();
        this.loadProducts();
    },

    updateOrderStatus(id, status) {
        TechStore.updateOrderStatus(id, status);
        Cart.showToast(`Order status updated to ${status}`, 'success');
        this.loadOrders();
        this.loadStats();
    },

    deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        TechStore.deleteUser(id);
        Cart.showToast('User deleted successfully', 'success');
        this.loadStats();
        this.loadUsers();
    }
};

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('adminProductsTable')) {
        Admin.init();
    }
});
