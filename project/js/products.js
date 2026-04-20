/**
 * TechStore - Products Module
 * Handles product listing, filtering, and sorting
 */

const Products = {
    currentPage: 1,
    itemsPerPage: 9,
    filteredProducts: [],

    init() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const search = urlParams.get('q');

        // Set filters from URL
        if (category) {
            document.getElementById('categoryFilter').value = category;
        }
        if (search) {
            document.getElementById('searchInput').value = search;
        }

        // Load products
        this.loadProducts();

        // Bind filter events
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.loadProducts();
        });

        document.getElementById('sortOrder').addEventListener('change', () => {
            this.loadProducts();
        });

        document.getElementById('applyPriceFilter').addEventListener('click', () => {
            this.currentPage = 1;
            this.loadProducts();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            document.getElementById('categoryFilter').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.querySelector('input[name="rating"][value="0"]').checked = true;
            document.getElementById('searchInput').value = '';
            this.currentPage = 1;
            this.loadProducts();
        });

        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const search = document.getElementById('searchInput').value.trim();
            const url = new URL('products.html', window.location.origin);
            if (search) {
                url.searchParams.set('q', search);
            }
            window.location.href = url.toString();
        });

        // Rating filter
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.currentPage = 1;
                this.loadProducts();
            });
        });
    },

    loadProducts() {
        let products = TechStore.getProducts();

        // Apply category filter
        const category = document.getElementById('categoryFilter').value;
        if (category) {
            products = products.filter(p => p.category === category);
        }

        // Apply search filter
        const search = document.getElementById('searchInput').value.trim().toLowerCase();
        if (search) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search) ||
                p.category.toLowerCase().includes(search)
            );
        }

        // Apply price filter
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        if (minPrice > 0 || maxPrice < Infinity) {
            products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
        }

        // Apply rating filter
        const minRating = parseFloat(document.querySelector('input[name="rating"]:checked')?.value) || 0;
        if (minRating > 0) {
            products = products.filter(p => p.rating >= minRating);
        }

        // Apply sorting
        const sortOrder = document.getElementById('sortOrder').value;
        switch (sortOrder) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                products.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        this.filteredProducts = products;
        this.renderProducts();
        this.renderPagination();
        document.getElementById('productCount').textContent = products.length;
    },

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(start, end);

        if (productsToShow.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-search"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search term</p>
                        <button class="btn btn-primary" onclick="document.getElementById('clearFilters').click()">
                            Clear Filters
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        grid.innerHTML = productsToShow.map(product => `
            <div class="col-md-6 col-lg-4">
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
                        <p class="product-card-text">${product.description.substring(0, 80)}...</p>
                        <p class="product-card-price">$${product.price.toFixed(2)}</p>
                        <div class="product-card-actions">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-outline-primary">
                                <i class="bi bi-eye"></i> View
                            </a>
                            <button class="btn btn-primary" onclick="Cart.addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                                <i class="bi bi-cart-plus"></i> ${product.stock === 0 ? 'Out of Stock' : 'Add'}
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

    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="Products.goToPage(${this.currentPage - 1}); return false;">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="Products.goToPage(${i}); return false;">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="Products.goToPage(${this.currentPage + 1}); return false;">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = html;
    },

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderProducts();
        this.renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Initialize products page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productsGrid')) {
        Products.init();
    }
});
