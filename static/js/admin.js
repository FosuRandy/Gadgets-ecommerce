/**
 * ContentCreate E-commerce - Admin Dashboard JavaScript
 * Handles admin functionality: product management, order management, etc.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('.btn-delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
    
    // Order status update
    const orderStatusSelect = document.getElementById('order-status');
    const orderStatusForm = document.getElementById('order-status-form');
    
    if (orderStatusSelect && orderStatusForm) {
        orderStatusSelect.addEventListener('change', function() {
            if (confirm('Are you sure you want to update the order status?')) {
                orderStatusForm.submit();
            } else {
                // Reset to original value
                this.value = this.getAttribute('data-original-value');
            }
        });
    }
    
    // Date picker initialization for promotion form
    const dateTimeInputs = document.querySelectorAll('input[type="datetime-local"]');
    dateTimeInputs.forEach(input => {
        // Set default date/time if the field is empty
        if (!input.value) {
            // For start date: Now
            if (input.id === 'start_date') {
                const now = new Date();
                input.value = formatDateTime(now);
            }
            // For end date: 7 days from now
            else if (input.id === 'end_date') {
                const sevenDaysLater = new Date();
                sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
                input.value = formatDateTime(sevenDaysLater);
            }
        }
    });
    
    // Format date time for input fields
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Image URL preview
    const imageUrlInput = document.getElementById('image_url');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageUrlInput && imagePreview) {
        // Initial preview
        if (imageUrlInput.value) {
            imagePreview.src = imageUrlInput.value;
            imagePreview.style.display = 'block';
        }
        
        // Update preview on input change
        imageUrlInput.addEventListener('input', function() {
            if (this.value.trim()) {
                imagePreview.src = this.value;
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
        });
        
        // Handle image load error
        imagePreview.addEventListener('error', function() {
            this.src = '/static/images/placeholder.svg';
            this.alt = 'Preview not available';
        });
    }
    
    // Product table search filter
    const productSearchInput = document.getElementById('product-search');
    
    if (productSearchInput) {
        productSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const productRows = document.querySelectorAll('.product-row');
            
            productRows.forEach(row => {
                const productName = row.getAttribute('data-product-name').toLowerCase();
                const productCategory = row.getAttribute('data-product-category').toLowerCase();
                
                if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // Order filter by status
    const orderStatusFilter = document.getElementById('order-status-filter');
    
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', function() {
            const status = this.value;
            let url = window.location.href.split('?')[0];
            
            if (status) {
                url += `?status=${status}`;
            }
            
            window.location.href = url;
        });
    }
    
    // Initialize charts if the page has charts
    const orderChartCanvas = document.getElementById('orders-chart');
    if (orderChartCanvas) {
        // Get order data from data attribute
        const orderCountsJson = orderChartCanvas.getAttribute('data-order-counts');
        const orderCounts = orderCountsJson ? JSON.parse(orderCountsJson) : {};
        
        const labels = Object.keys(orderCounts);
        const data = Object.values(orderCounts);
        
        const ctx = orderChartCanvas.getContext('2d');
        const ordersChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders',
                    data: data,
                    backgroundColor: 'rgba(74, 111, 220, 0.2)',
                    borderColor: '#4a6fdc',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#4a6fdc'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // Display order in table
    const salesChartCanvas = document.getElementById('sales-chart');
    if (salesChartCanvas) {
        // Get sales data from data attribute
        const salesDataJson = salesChartCanvas.getAttribute('data-sales');
        const salesData = salesDataJson ? JSON.parse(salesDataJson) : {};
        
        const labels = Object.keys(salesData);
        const data = Object.values(salesData);
        
        const ctx = salesChartCanvas.getContext('2d');
        const salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales (GH₵)',
                    data: data,
                    backgroundColor: 'rgba(247, 201, 72, 0.5)',
                    borderColor: '#f7c948',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
