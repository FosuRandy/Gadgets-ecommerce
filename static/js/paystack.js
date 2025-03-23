/**
 * ContentCreate E-commerce - Paystack Integration
 * Handles Paystack payment functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Paystack payment button if it exists
    const paymentForm = document.getElementById('paystack-payment-form');
    
    if (paymentForm) {
        const paystackButton = document.getElementById('paystack-pay-button');
        const publicKey = paystackButton.getAttribute('data-public-key');
        const email = paystackButton.getAttribute('data-email');
        const amount = paystackButton.getAttribute('data-amount');
        const currency = paystackButton.getAttribute('data-currency') || 'GHS';
        const reference = generateReference();
        
        paystackButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if Paystack is loaded
            if (typeof PaystackPop === 'undefined') {
                alert('Unable to connect to payment gateway. Please check your internet connection and try again.');
                return;
            }
            
            // Show loading state
            paystackButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            paystackButton.disabled = true;
            
            // Initialize Paystack payment
            const handler = PaystackPop.setup({
                key: publicKey,
                email: email,
                amount: amount,
                currency: currency,
                ref: reference,
                onClose: function() {
                    // Payment window closed
                    paystackButton.innerHTML = 'Pay Now';
                    paystackButton.disabled = false;
                    
                    // Show message
                    showPaymentMessage('Payment cancelled. Click "Pay Now" to try again.', 'warning');
                },
                callback: function(response) {
                    // Payment completed successfully
                    paystackButton.innerHTML = '<i class="fas fa-check-circle"></i> Verifying...';
                    
                    // Redirect to verification URL
                    window.location.href = `/payment/verify/${response.reference}`;
                }
            });
            
            handler.openIframe();
        });
        
        // Generate a unique reference for the transaction
        function generateReference() {
            const timestamp = new Date().getTime();
            const randomStr = Math.random().toString(36).substring(2, 15);
            return `pay-${timestamp}-${randomStr}`;
        }
        
        // Display payment messages
        function showPaymentMessage(message, type = 'info') {
            const messageContainer = document.getElementById('payment-messages');
            if (!messageContainer) return;
            
            const alertClass = type === 'success' ? 'alert-success' : 
                              type === 'warning' ? 'alert-warning' : 
                              type === 'danger' ? 'alert-danger' : 'alert-info';
            
            messageContainer.innerHTML = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
});
