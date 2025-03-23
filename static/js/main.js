/**
 * ContentCreate E-commerce - Main JavaScript
 * Handles general functionality across the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Handle promotion countdown if promotion banner exists
    const promotionBanner = document.querySelector('.promotion-banner');
    if (promotionBanner) {
        const countdownElement = document.querySelector('.countdown');
        const endDateElement = document.querySelector('[data-end-date]');
        
        if (endDateElement && countdownElement) {
            const endDateStr = endDateElement.getAttribute('data-end-date');
            const endDate = new Date(endDateStr);
            
            // Update countdown every second
            function updateCountdown() {
                const now = new Date();
                const diff = endDate - now;
                
                if (diff <= 0) {
                    // Promotion ended
                    countdownElement.innerHTML = '<p>This promotion has ended</p>';
                    return;
                }
                
                // Calculate days, hours, minutes, seconds
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                // Update countdown display
                countdownElement.innerHTML = `
                    <div class="countdown-item">
                        ${days.toString().padStart(2, '0')}
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-item">
                        ${hours.toString().padStart(2, '0')}
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-item">
                        ${minutes.toString().padStart(2, '0')}
                        <span class="countdown-label">Mins</span>
                    </div>
                    <div class="countdown-item">
                        ${seconds.toString().padStart(2, '0')}
                        <span class="countdown-label">Secs</span>
                    </div>
                `;
            }
            
            // Initial update
            updateCountdown();
            
            // Update every second
            setInterval(updateCountdown, 1000);
        }
    }
    
    // Product image zoom effect on product detail page
    const productImage = document.querySelector('.product-detail-img');
    if (productImage) {
        productImage.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        productImage.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Quantity input validation
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (parseInt(this.value) < 1) {
                this.value = 1;
            }
            
            const maxStock = parseInt(this.getAttribute('max'));
            if (maxStock && parseInt(this.value) > maxStock) {
                this.value = maxStock;
                alert(`Sorry, only ${maxStock} items in stock.`);
            }
        });
    });
    
    // Handle flash messages auto-close
    const flashMessages = document.querySelectorAll('.alert-dismissible');
    flashMessages.forEach(message => {
        setTimeout(() => {
            // Create and dispatch close event
            const closeButton = message.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            } else {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 500);
            }
        }, 5000); // Close after 5 seconds
    });
    
    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Category filter in products page
    const categorySelect = document.getElementById('category-filter');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            const currentUrl = new URL(window.location.href);
            
            if (selectedCategory) {
                currentUrl.searchParams.set('category', selectedCategory);
            } else {
                currentUrl.searchParams.delete('category');
            }
            
            window.location.href = currentUrl.toString();
        });
    }
    
    // Search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const searchInput = this.querySelector('input[name="search"]');
            if (!searchInput.value.trim()) {
                e.preventDefault();
            }
        });
    }
});
