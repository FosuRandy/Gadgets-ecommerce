/**
 * ContentCreate E-commerce - Cart Module
 * Handles cart functionality: add, update, remove
 */

document.addEventListener('DOMContentLoaded', function() {
    // Update cart count via AJAX after adding product
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Don't prevent default - let the form submit normally to the backend
            // But add effect and update cart count after success
            
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            
            // Add visual feedback after form submission
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            button.disabled = true;
            
            // Set a timeout to restore the button
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
                
                // Update cart count
                updateCartCount();
                
                // Show toast notification
                showNotification(`${productName} added to cart!`, 'success');
            }, 800);
        });
    });
    
    // Quantity increment/decrement buttons
    const quantityControls = document.querySelectorAll('.quantity-control');
    
    quantityControls.forEach(control => {
        control.addEventListener('click', function(e) {
            e.preventDefault();
            
            const input = this.closest('.quantity-wrapper').querySelector('.quantity-input');
            const currentValue = parseInt(input.value);
            const maxStock = parseInt(input.getAttribute('max')) || 99;
            const isIncrement = this.classList.contains('quantity-increment');
            
            if (isIncrement && currentValue < maxStock) {
                input.value = currentValue + 1;
            } else if (!isIncrement && currentValue > 1) {
                input.value = currentValue - 1;
            }
            
            // Trigger change event to update any dependent logic
            const event = new Event('change');
            input.dispatchEvent(event);
            
            // If in cart page, submit the update form
            const updateForm = this.closest('.cart-update-form');
            if (updateForm) {
                updateForm.submit();
            }
        });
    });
    
    // Update cart count via AJAX
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        if (cartCountElements.length > 0) {
            fetch('/api/cart/count')
                .then(response => response.json())
                .then(data => {
                    cartCountElements.forEach(element => {
                        element.textContent = data.count;
                    });
                })
                .catch(error => console.error('Error updating cart count:', error));
        }
    }
    
    // Show toast notification
    function showNotification(message, type = 'info') {
        // Create toast container if not exists
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const uniqueId = 'toast-' + new Date().getTime();
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'text-bg-success' : 'text-bg-info'}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.setAttribute('id', uniqueId);
        
        // Create toast body
        const toastBody = document.createElement('div');
        toastBody.className = 'toast-body d-flex align-items-center';
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} me-2`;
        toastBody.appendChild(icon);
        
        // Add message
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        toastBody.appendChild(messageSpan);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close btn-close-white ms-auto';
        closeButton.setAttribute('data-bs-dismiss', 'toast');
        closeButton.setAttribute('aria-label', 'Close');
        toastBody.appendChild(closeButton);
        
        // Combine everything
        toast.appendChild(toastBody);
        toastContainer.appendChild(toast);
        
        // Initialize and show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    // Update cart item subtotal when quantity changes
    const cartQuantityInputs = document.querySelectorAll('.cart-quantity-input');
    
    cartQuantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const quantity = parseInt(this.value);
            const priceElement = this.closest('.cart-item').querySelector('.item-price');
            const subtotalElement = this.closest('.cart-item').querySelector('.item-subtotal');
            
            if (priceElement && subtotalElement) {
                const price = parseFloat(priceElement.getAttribute('data-price'));
                const subtotal = price * quantity;
                
                // Update the subtotal display
                subtotalElement.textContent = `GH₵${subtotal.toFixed(2)}`;
            }
        });
    });
    
    // Cart remove confirmation
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to remove this item from your cart?')) {
                e.preventDefault();
            }
        });
    });
});
