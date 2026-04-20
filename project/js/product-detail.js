/**
 * TechStore - Product Detail Module
 * Handles product detail page and related functionality
 */

const ProductDetail = {
    productId: null,
    product: null,

    init() {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('id');

        if (!this.productId) {
            window.location.href = 'products.html';
            return;
        }

        this.product = TechStore.getProductById(this.productId);

        if (!this.product) {
            window.location.href = 'products.html';
            return;
        }

        this.renderProduct();
        this.bindEvents();
    },

    bindEvents() {
        // Add to cart button
        document.getElementById('addToCartBtn')?.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
            Cart.addToCart(this.product.id, quantity);
        });

        // Buy Now button - add to cart and redirect to checkout
        const buyNowBtn = document.getElementById('buyNowBtn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
                Cart.addToCart(this.product.id, quantity);
                // Small delay to ensure cart is updated
                setTimeout(() => {
                    window.location.href = 'checkout.html';
                }, 500);
            });
        }

        // Quantity controls
        document.getElementById('decreaseQty')?.addEventListener('click', () => {
            const input = document.getElementById('quantity');
            if (input && input.value > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });

        document.getElementById('increaseQty')?.addEventListener('click', () => {
            const input = document.getElementById('quantity');
            if (input && input.value < this.product.stock) {
                input.value = parseInt(input.value) + 1;
            }
        });

        // Write review button
        document.getElementById('writeReviewBtn')?.addEventListener('click', () => {
            document.getElementById('reviewProductId').value = this.product.id;
        });

        // Review form submission
        document.getElementById('reviewForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });

        // Star rating input
        document.querySelectorAll('#starInput i').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                document.getElementById('ratingValue').value = rating;
                this.updateStarDisplay(rating);
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                this.updateStarDisplay(rating, true);
            });

            star.addEventListener('mouseleave', () => {
                const rating = parseInt(document.getElementById('ratingValue').value) || 0;
                this.updateStarDisplay(rating);
            });
        });
    },

    updateStarDisplay(rating, isHover = false) {
        document.querySelectorAll('#starInput i').forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            star.className = starRating <= rating ? 'bi bi-star-fill' : 'bi bi-star';
        });
    },

    renderProduct() {
        // Update breadcrumb
        document.getElementById('breadcrumbProduct').textContent = this.product.name;

        // Get rating info
        const ratingInfo = TechStore.getProductRating(this.product.id);

        // Render product detail
        document.getElementById('productDetail').innerHTML = `
            <div class="col-lg-6">
                <img src="${this.product.image}" alt="${this.product.name}" class="product-image-main" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect width=%22600%22 height=%22400%22 fill=%22%23374151%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%239CA3AF%22 font-size=%2224%22 font-family=%22sans-serif%22%3EImage Unavailable%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="col-lg-6">
                <div class="product-info">
                    <span class="badge bg-secondary mb-2">${this.product.category}</span>
                    <h1>${this.product.name}</h1>
                    <div class="star-rating star-rating-large mb-3">
                        ${this.renderStars(this.product.rating)}
                        <span class="text-muted ms-2">${ratingInfo.count} reviews</span>
                    </div>
                    <p class="price">$${this.product.price.toFixed(2)}</p>
                    <p class="description">${this.product.description}</p>

                    <div class="product-meta">
                        <div class="meta-item">
                            <i class="bi bi-box"></i>
                            <span>${this.product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="bi bi-truck"></i>
                            <span>Free Shipping</span>
                        </div>
                        <div class="meta-item">
                            <i class="bi bi-arrow-repeat"></i>
                            <span>30-Day Returns</span>
                        </div>
                    </div>

                    ${this.product.stock > 0 ? `
                        <div class="mb-4">
                            <label class="form-label">Quantity</label>
                            <div class="d-flex align-items-center gap-3">
                                <button class="btn btn-outline-secondary" id="decreaseQty">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="number" class="form-control text-center" id="quantity" value="1" min="1" max="${this.product.stock}" style="width: 80px;">
                                <button class="btn btn-outline-secondary" id="increaseQty">
                                    <i class="bi bi-plus"></i>
                                </button>
                                <span class="text-muted small">(${this.product.stock} available)</span>
                            </div>
                        </div>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary btn-lg" id="addToCartBtn">
                                <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                            <button class="btn btn-success btn-lg" id="buyNowBtn">
                                <i class="bi bi-lightning"></i> Buy Now
                            </button>
                        </div>
                    ` : `
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle"></i> This product is currently out of stock.
                        </div>
                    `}
                </div>
            </div>
        `;

        // Render reviews
        this.renderReviews();
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

    renderReviews() {
        const reviews = TechStore.getProductReviews(this.product.id);
        const ratingInfo = TechStore.getProductRating(this.product.id);
        const distribution = TechStore.getRatingDistribution(this.product.id);

        // Update average rating display
        document.getElementById('avgRating').textContent = ratingInfo.average.toFixed(1);
        document.getElementById('avgStars').innerHTML = this.renderStars(ratingInfo.average);
        document.getElementById('reviewCount').textContent = `${ratingInfo.count} reviews`;

        // Render rating distribution
        document.getElementById('ratingDistribution').innerHTML = `
            <div class="col-md-6">
                ${[5, 4, 3, 2, 1].map(stars => {
                    const count = distribution[stars];
                    const percentage = ratingInfo.count > 0 ? (count / ratingInfo.count) * 100 : 0;
                    return `
                        <div class="d-flex align-items-center mb-2">
                            <span class="text-muted" style="width: 30px;">${stars} <i class="bi bi-star-fill text-warning"></i></span>
                            <div class="progress flex-grow-1 mx-2" style="height: 8px;">
                                <div class="progress-bar bg-warning" style="width: ${percentage}%"></div>
                            </div>
                            <span class="text-muted" style="width: 30px;">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Render reviews list
        const reviewsList = document.getElementById('reviewsList');
        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-chat-left-text"></i>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this product!</p>
                </div>
            `;
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div>
                        <span class="review-author">${review.author}</span>
                        <div class="star-rating">${this.renderStars(review.rating)}</div>
                    </div>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <h6 class="review-title">${review.title}</h6>
                <p class="review-text">${review.text}</p>
            </div>
        `).join('');
    },

    submitReview() {
        const rating = parseInt(document.getElementById('ratingValue').value);
        const author = document.getElementById('reviewerName').value.trim();
        const title = document.getElementById('reviewTitle').value.trim();
        const text = document.getElementById('reviewText').value.trim();

        if (rating < 1) {
            alert('Please select a rating');
            return;
        }

        TechStore.addReview({
            productId: this.product.id,
            rating,
            author,
            title,
            text
        });

        // Close modal and refresh reviews
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();

        // Reset form
        document.getElementById('reviewForm').reset();
        document.getElementById('ratingValue').value = '0';
        this.updateStarDisplay(0);

        // Refresh product data and re-render
        this.product = TechStore.getProductById(this.product.id);
        this.renderProduct();

        Cart.showToast('Review submitted successfully!', 'success');
    }
};

// Initialize product detail page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productDetail')) {
        ProductDetail.init();
    }
});
