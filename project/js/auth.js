/**
 * TechStore - Authentication Module
 * Handles user login, registration, and session management
 */

const Auth = {
    init() {
        this.updateAuthUI();
    },

    // Update UI based on auth state
    updateAuthUI() {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        const user = TechStore.getCurrentUser();

        if (user) {
            authSection.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle"></i> ${user.name.split(' ')[0]}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        ${user.role === 'admin' ? '<li><a class="dropdown-item" href="admin.html"><i class="bi bi-gear"></i> Admin Panel</a></li><li><hr class="dropdown-divider"></li>' : ''}
                        <li><a class="dropdown-item" href="orders.html"><i class="bi bi-box"></i> My Orders</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="Auth.logout(); return false;"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
                    </ul>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <a href="login.html" class="btn btn-outline-light me-2">Login</a>
                <a href="register.html" class="btn btn-primary">Register</a>
            `;
        }

        // Update cart count
        Cart.updateCartCount();
    },

    // Login function
    login(email, password, remember = false) {
        const user = TechStore.getUserByEmail(email);

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Set current user
        TechStore.setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        if (remember) {
            localStorage.setItem('ts_remember', 'true');
        }

        // Restore pending cart if exists
        const pendingCart = localStorage.getItem('ts_pending_cart');
        if (pendingCart) {
            localStorage.setItem('ts_cart', pendingCart);
            localStorage.removeItem('ts_pending_cart');
        }

        this.updateAuthUI();

        return {
            success: true,
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        };
    },

    // Register function
    register(name, email, password) {
        const result = TechStore.addUser({
            name,
            email,
            password,
            role: 'customer'
        });

        if (result.error) {
            return { success: false, message: result.error };
        }

        // Auto login after registration
        TechStore.setCurrentUser({
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role
        });

        this.updateAuthUI();

        return {
            success: true,
            message: 'Registration successful',
            user: { id: result.id, name: result.name, email: result.email, role: result.role }
        };
    },

    // Logout function
    logout() {
        TechStore.logout();
        this.updateAuthUI();

        // Redirect to home if on auth pages
        if (window.location.pathname.includes('login.html') ||
            window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        return TechStore.getCurrentUser() !== null;
    },

    // Check if user is admin
    isAdmin() {
        const user = TechStore.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Require login - redirect if not logged in
    requireLogin(redirectUrl = 'login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl + '?redirect=' + encodeURIComponent(window.location.href);
            return false;
        }
        return true;
    },

    // Require admin - redirect if not admin
    requireAdmin() {
        if (!this.isAdmin()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Get current user
    getCurrentUser() {
        return TechStore.getCurrentUser();
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
