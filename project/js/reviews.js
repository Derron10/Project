/**
 * TechStore - Reviews Module
 * Handles review-related functionality (re-exported from product-detail.js)
 * This file exists for modular organization
 */

// Reviews functionality is implemented in product-detail.js
// This file can be extended for standalone review features if needed

const Reviews = {
    // Helper to get all reviews for a product
    getProductReviews(productId) {
        return TechStore.getProductReviews(productId);
    },

    // Helper to get average rating
    getAverageRating(productId) {
        return TechStore.getProductRating(productId);
    },

    // Helper to submit a review (used by product-detail.js)
    submitReview(productId, rating, author, title, text) {
        return TechStore.addReview({
            productId,
            rating,
            author,
            title,
            text,
            createdAt: new Date().toISOString()
        });
    }
};
