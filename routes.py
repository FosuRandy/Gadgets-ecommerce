import os
import json
from datetime import datetime
from flask import render_template, redirect, url_for, flash, request, jsonify, session, abort
from flask_login import login_user, logout_user, login_required, current_user
from urllib.parse import urlparse
from werkzeug.utils import secure_filename
from app import db, login_manager
from models import User, Product, CartItem, Order, OrderItem, Promotion, Slideshow
from forms import (RegistrationForm, LoginForm, ProductForm, CheckoutForm, 
                  OrderTrackingForm, PromotionForm, SlideshowForm)
from utils import (send_order_confirmation_email, verify_paystack_transaction, 
                 get_active_promotion, apply_promotion_to_price)

def register_routes(app):
    
    @app.context_processor
    def inject_global_vars():
        """Inject variables into all templates"""
        cart_count = 0
        if current_user.is_authenticated:
            cart_count = CartItem.query.filter_by(user_id=current_user.id).count()
        
        active_promotion = get_active_promotion()
        
        return {
            'cart_count': cart_count,
            'active_promotion': active_promotion,
            'current_year': datetime.utcnow().year,
            'site_name': app.config.get('SITE_NAME', 'ContentCreate'),
            'paystack_public_key': app.config.get('PAYSTACK_PUBLIC_KEY', '')
        }
    
    @app.route('/')
    def index():
        """Home page route"""
        # Get featured products (first 4 products)
        featured_products = Product.query.limit(4).all()
        
        # Get slideshow content
        slides = Slideshow.query.filter_by(is_active=True).order_by(Slideshow.display_order).all()
        
        # Get active promotion
        promotion = get_active_promotion()
        
        return render_template('index.html', 
                              featured_products=featured_products,
                              slides=slides,
                              promotion=promotion)
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        """User registration route"""
        if current_user.is_authenticated:
            return redirect(url_for('index'))
        
        form = RegistrationForm()
        if form.validate_on_submit():
            user = User(username=form.username.data, email=form.email.data)
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()
            flash('Registration successful! You can now log in.', 'success')
            return redirect(url_for('login'))
        
        return render_template('register.html', title='Register', form=form)
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        """User login route"""
        if current_user.is_authenticated:
            return redirect(url_for('index'))
        
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data).first()
            if user is None or not user.check_password(form.password.data):
                flash('Invalid email or password', 'danger')
                return redirect(url_for('login'))
            
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            if not next_page or urlparse(next_page).netloc != '':
                if user.is_admin():
                    next_page = url_for('admin_dashboard')
                else:
                    next_page = url_for('index')
            
            return redirect(next_page)
        
        return render_template('login.html', title='Login', form=form)
    
    @app.route('/logout')
    def logout():
        """User logout route"""
        logout_user()
        flash('You have been logged out', 'info')
        return redirect(url_for('index'))
    
    @app.route('/products')
    def products():
        """Product listing route with optional category filter"""
        category = request.args.get('category')
        search = request.args.get('search')
        
        # Base query
        query = Product.query
        
        # Apply filters if provided
        if category:
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(Product.name.ilike(f'%{search}%') | 
                                Product.description.ilike(f'%{search}%'))
        
        # Get products
        products = query.all()
        
        # Get all categories for the filter dropdown
        categories = [
            {'id': 'camera', 'name': 'Camera Equipment'},
            {'id': 'audio', 'name': 'Audio Equipment'},
            {'id': 'lighting', 'name': 'Lighting Equipment'},
            {'id': 'software', 'name': 'Software & Plugins'},
            {'id': 'accessories', 'name': 'Accessories'}
        ]
        
        # Get active promotion
        promotion = get_active_promotion()
        
        return render_template('products.html', 
                              title='Products',
                              products=products,
                              categories=categories,
                              selected_category=category,
                              search_query=search,
                              promotion=promotion)
    
    @app.route('/product/<int:product_id>')
    def product_detail(product_id):
        """Product detail page"""
        product = Product.query.get_or_404(product_id)
        
        # Get related products (same category, excluding current product)
        related_products = Product.query.filter_by(category=product.category) \
                                  .filter(Product.id != product_id) \
                                  .limit(4).all()
        
        # Get active promotion
        promotion = get_active_promotion()
        
        # Calculate promotional price if applicable
        regular_price = product.price
        promo_price = None
        
        if promotion and promotion.is_valid:
            promo_price = apply_promotion_to_price(regular_price, promotion)
        
        return render_template('product_detail.html',
                              title=product.name,
                              product=product,
                              related_products=related_products,
                              promotion=promotion,
                              regular_price=regular_price,
                              promo_price=promo_price)
    
    @app.route('/cart')
    @login_required
    def view_cart():
        """Shopping cart page"""
        cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
        
        # Calculate total
        total = sum(item.product.price * item.quantity for item in cart_items)
        
        # Get active promotion
        promotion = get_active_promotion()
        
        # Calculate promotional price if applicable
        promo_total = None
        if promotion and promotion.is_valid and cart_items:
            promo_total = apply_promotion_to_price(total, promotion)
        
        return render_template('cart.html',
                              title='Shopping Cart',
                              cart_items=cart_items,
                              total=total,
                              promotion=promotion,
                              promo_total=promo_total)
    
    @app.route('/cart/add/<int:product_id>', methods=['POST'])
    @login_required
    def add_to_cart(product_id):
        """Add item to cart"""
        product = Product.query.get_or_404(product_id)
        
        # Get quantity from form or default to 1
        quantity = int(request.form.get('quantity', 1))
        
        if quantity < 1:
            flash('Quantity must be at least 1', 'danger')
            return redirect(url_for('product_detail', product_id=product_id))
        
        if quantity > product.stock:
            flash(f'Sorry, only {product.stock} items in stock', 'danger')
            return redirect(url_for('product_detail', product_id=product_id))
        
        # Check if product already in cart
        cart_item = CartItem.query.filter_by(user_id=current_user.id, product_id=product_id).first()
        
        if cart_item:
            # Update quantity if already in cart
            cart_item.quantity += quantity
            flash(f'Updated quantity of {product.name} in your cart', 'success')
        else:
            # Add new item to cart
            cart_item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)
            flash(f'Added {product.name} to your cart', 'success')
        
        db.session.commit()
        return redirect(url_for('view_cart'))
    
    @app.route('/cart/update/<int:item_id>', methods=['POST'])
    @login_required
    def update_cart_item(item_id):
        """Update cart item quantity"""
        cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
        
        quantity = int(request.form.get('quantity', 1))
        
        if quantity < 1:
            db.session.delete(cart_item)
            db.session.commit()
            flash('Item removed from cart', 'info')
        else:
            if quantity > cart_item.product.stock:
                flash(f'Sorry, only {cart_item.product.stock} items in stock', 'danger')
                return redirect(url_for('view_cart'))
            
            cart_item.quantity = quantity
            db.session.commit()
            flash('Cart updated', 'success')
        
        return redirect(url_for('view_cart'))
    
    @app.route('/cart/remove/<int:item_id>', methods=['POST'])
    @login_required
    def remove_from_cart(item_id):
        """Remove item from cart"""
        cart_item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
        
        db.session.delete(cart_item)
        db.session.commit()
        
        flash('Item removed from cart', 'info')
        return redirect(url_for('view_cart'))
    
    @app.route('/checkout', methods=['GET', 'POST'])
    @login_required
    def checkout():
        """Checkout process"""
        # Get cart items
        cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
        
        if not cart_items:
            flash('Your cart is empty', 'info')
            return redirect(url_for('products'))
        
        # Calculate total
        total = sum(item.product.price * item.quantity for item in cart_items)
        
        # Get active promotion
        promotion = get_active_promotion()
        
        # Apply promotion if valid
        final_total = total
        if promotion and promotion.is_valid:
            final_total = apply_promotion_to_price(total, promotion)
        
        form = CheckoutForm()
        
        if form.validate_on_submit():
            # Validate stock levels before proceeding
            for item in cart_items:
                if item.quantity > item.product.stock:
                    flash(f'Sorry, only {item.product.stock} of {item.product.name} in stock', 'danger')
                    return redirect(url_for('checkout'))
            
            # Create order
            order = Order(
                order_number=Order.generate_order_number(),
                user_id=current_user.id,
                total_amount=final_total,
                shipping_address=form.address.data,
                shipping_city=form.city.data,
                shipping_country="Ghana",
                shipping_phone=form.phone.data
            )
            db.session.add(order)
            db.session.flush()  # Flush to get the order.id without committing
            
            # Add order items
            for cart_item in cart_items:
                # Create order item
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=cart_item.product_id,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )
                db.session.add(order_item)
                
                # Update product stock
                product = cart_item.product
                product.stock -= cart_item.quantity
            
            # Save everything
            db.session.commit()
            
            # Store order info in session for payment page
            session['order_id'] = order.id
            session['order_amount'] = final_total
            session['order_email'] = form.email.data
            
            # Clear cart
            CartItem.query.filter_by(user_id=current_user.id).delete()
            db.session.commit()
            
            return redirect(url_for('payment'))
        
        return render_template('checkout.html',
                              title='Checkout',
                              form=form,
                              cart_items=cart_items,
                              total=total,
                              promotion=promotion,
                              final_total=final_total)
    
    @app.route('/payment')
    @login_required
    def payment():
        """Payment page with Paystack integration"""
        # Retrieve order info from session
        order_id = session.get('order_id')
        order_amount = session.get('order_amount')
        order_email = session.get('order_email')
        
        if not order_id or not order_amount:
            flash('No order information found. Please try again.', 'danger')
            return redirect(url_for('view_cart'))
        
        order = Order.query.get_or_404(order_id)
        
        # Check if order belongs to current user
        if order.user_id != current_user.id:
            abort(403)
        
        # Amount in kobo (pesewas) for Paystack
        amount_pesewas = int(order_amount * 100)
        
        return render_template('payment.html',
                              title='Payment',
                              order=order,
                              amount_pesewas=amount_pesewas,
                              customer_email=order_email)
    
    @app.route('/payment/verify/<reference>', methods=['GET'])
    @login_required
    def verify_payment(reference):
        """Verify payment callback"""
        order_id = session.get('order_id')
        if not order_id:
            flash('No order information found', 'danger')
            return redirect(url_for('index'))
        
        order = Order.query.get_or_404(order_id)
        
        # Verify payment with Paystack
        transaction_data = verify_paystack_transaction(reference)
        
        if transaction_data:
            # Payment successful
            order.payment_status = 'paid'
            order.payment_reference = reference
            order.status = 'processing'
            db.session.commit()
            
            # Send confirmation email
            send_order_confirmation_email(order)
            
            # Clear session data
            session.pop('order_id', None)
            session.pop('order_amount', None)
            session.pop('order_email', None)
            
            flash('Payment successful! Your order has been placed.', 'success')
            return redirect(url_for('order_confirmation', order_id=order.id))
        else:
            # Payment failed
            flash('Payment verification failed. Please contact customer support.', 'danger')
            return redirect(url_for('index'))
    
    @app.route('/order/confirmation/<int:order_id>')
    @login_required
    def order_confirmation(order_id):
        """Order confirmation page"""
        order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
        
        return render_template('order_confirmation.html',
                              title='Order Confirmation',
                              order=order)
    
    @app.route('/track-order', methods=['GET', 'POST'])
    def track_order():
        """Order tracking page"""
        form = OrderTrackingForm()
        order = None
        
        if form.validate_on_submit():
            order = Order.query.filter_by(
                order_number=form.order_number.data
            ).join(User).filter(
                User.email==form.email.data
            ).first()
            
            if not order:
                flash('No order found with the provided details', 'danger')
        
        return render_template('track_order.html',
                              title='Track Order',
                              form=form,
                              order=order)
    
    # Admin routes
    @app.route('/admin')
    @login_required
    def admin_dashboard():
        """Admin dashboard"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        # Get summary data
        product_count = Product.query.count()
        order_count = Order.query.count()
        pending_orders = Order.query.filter_by(status='pending').count()
        low_stock_count = Product.query.filter(Product.stock < 5).count()
        
        # Get recent orders
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
        
        return render_template('admin/dashboard.html',
                              title='Admin Dashboard',
                              product_count=product_count,
                              order_count=order_count,
                              pending_orders=pending_orders,
                              low_stock_count=low_stock_count,
                              recent_orders=recent_orders)
    
    @app.route('/admin/products')
    @login_required
    def admin_products():
        """Admin product management"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        products = Product.query.all()
        
        return render_template('admin/products.html',
                              title='Manage Products',
                              products=products)
    
    @app.route('/admin/products/add', methods=['GET', 'POST'])
    @login_required
    def admin_add_product():
        """Add new product"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        form = ProductForm()
        
        if form.validate_on_submit():
            product = Product(
                name=form.name.data,
                description=form.description.data,
                price=form.price.data,
                stock=form.stock.data,
                image_url=form.image_url.data,
                category=form.category.data
            )
            db.session.add(product)
            db.session.commit()
            
            flash('Product added successfully', 'success')
            return redirect(url_for('admin_products'))
        
        return render_template('admin/product_form.html',
                              title='Add Product',
                              form=form,
                              action='Add')
    
    @app.route('/admin/products/edit/<int:product_id>', methods=['GET', 'POST'])
    @login_required
    def admin_edit_product(product_id):
        """Edit product"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        product = Product.query.get_or_404(product_id)
        form = ProductForm(obj=product)
        
        if form.validate_on_submit():
            product.name = form.name.data
            product.description = form.description.data
            product.price = form.price.data
            product.stock = form.stock.data
            product.image_url = form.image_url.data
            product.category = form.category.data
            product.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            flash('Product updated successfully', 'success')
            return redirect(url_for('admin_products'))
        
        return render_template('admin/product_form.html',
                              title='Edit Product',
                              form=form,
                              action='Update',
                              product=product)
    
    @app.route('/admin/products/delete/<int:product_id>', methods=['POST'])
    @login_required
    def admin_delete_product(product_id):
        """Delete product"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        product = Product.query.get_or_404(product_id)
        
        db.session.delete(product)
        db.session.commit()
        
        flash('Product deleted successfully', 'success')
        return redirect(url_for('admin_products'))
    
    @app.route('/admin/orders')
    @login_required
    def admin_orders():
        """Admin order management"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        status_filter = request.args.get('status')
        
        # Base query
        query = Order.query
        
        # Apply filter if provided
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        # Get orders ordered by date (newest first)
        orders = query.order_by(Order.created_at.desc()).all()
        
        return render_template('admin/orders.html',
                              title='Manage Orders',
                              orders=orders,
                              status_filter=status_filter)
    
    @app.route('/admin/orders/<int:order_id>')
    @login_required
    def admin_order_detail(order_id):
        """Admin order detail"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        order = Order.query.get_or_404(order_id)
        
        return render_template('admin/order_detail.html',
                              title=f'Order #{order.order_number}',
                              order=order)
    
    @app.route('/admin/orders/update-status/<int:order_id>', methods=['POST'])
    @login_required
    def admin_update_order_status(order_id):
        """Update order status"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        order = Order.query.get_or_404(order_id)
        status = request.form.get('status')
        
        if status in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
            order.status = status
            order.updated_at = datetime.utcnow()
            db.session.commit()
            
            flash(f'Order status updated to {status}', 'success')
        else:
            flash('Invalid status', 'danger')
        
        return redirect(url_for('admin_order_detail', order_id=order.id))
    
    @app.route('/admin/promotions')
    @login_required
    def admin_promotions():
        """Admin promotion management"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        promotions = Promotion.query.order_by(Promotion.created_at.desc()).all()
        
        return render_template('admin/promotions.html',
                              title='Manage Promotions',
                              promotions=promotions)
    
    @app.route('/admin/promotions/add', methods=['GET', 'POST'])
    @login_required
    def admin_add_promotion():
        """Add new promotion"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        form = PromotionForm()
        
        if form.validate_on_submit():
            promotion = Promotion(
                title=form.title.data,
                description=form.description.data,
                discount_percent=form.discount_percent.data,
                start_date=form.start_date.data,
                end_date=form.end_date.data,
                is_active=form.is_active.data
            )
            db.session.add(promotion)
            db.session.commit()
            
            flash('Promotion added successfully', 'success')
            return redirect(url_for('admin_promotions'))
        
        return render_template('admin/promotion_form.html',
                              title='Add Promotion',
                              form=form,
                              action='Add')
    
    @app.route('/admin/promotions/edit/<int:promotion_id>', methods=['GET', 'POST'])
    @login_required
    def admin_edit_promotion(promotion_id):
        """Edit promotion"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        promotion = Promotion.query.get_or_404(promotion_id)
        form = PromotionForm(obj=promotion)
        
        if form.validate_on_submit():
            promotion.title = form.title.data
            promotion.description = form.description.data
            promotion.discount_percent = form.discount_percent.data
            promotion.start_date = form.start_date.data
            promotion.end_date = form.end_date.data
            promotion.is_active = form.is_active.data
            
            db.session.commit()
            
            flash('Promotion updated successfully', 'success')
            return redirect(url_for('admin_promotions'))
        
        return render_template('admin/promotion_form.html',
                              title='Edit Promotion',
                              form=form,
                              action='Update',
                              promotion=promotion)
    
    @app.route('/admin/promotions/delete/<int:promotion_id>', methods=['POST'])
    @login_required
    def admin_delete_promotion(promotion_id):
        """Delete promotion"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        promotion = Promotion.query.get_or_404(promotion_id)
        
        db.session.delete(promotion)
        db.session.commit()
        
        flash('Promotion deleted successfully', 'success')
        return redirect(url_for('admin_promotions'))
    
    @app.route('/admin/slideshow')
    @login_required
    def admin_slideshow():
        """Admin slideshow management"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        slides = Slideshow.query.order_by(Slideshow.display_order).all()
        
        return render_template('admin/slideshow.html',
                              title='Manage Slideshow',
                              slides=slides)
    
    @app.route('/admin/slideshow/add', methods=['GET', 'POST'])
    @login_required
    def admin_add_slide():
        """Add new slideshow slide"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        form = SlideshowForm()
        
        if form.validate_on_submit():
            slide = Slideshow(
                title=form.title.data,
                subtitle=form.subtitle.data,
                image_url=form.image_url.data,
                link_url=form.link_url.data,
                display_order=form.display_order.data,
                is_active=form.is_active.data
            )
            db.session.add(slide)
            db.session.commit()
            
            flash('Slide added successfully', 'success')
            return redirect(url_for('admin_slideshow'))
        
        return render_template('admin/slideshow_form.html',
                              title='Add Slide',
                              form=form,
                              action='Add')
    
    @app.route('/admin/slideshow/edit/<int:slide_id>', methods=['GET', 'POST'])
    @login_required
    def admin_edit_slide(slide_id):
        """Edit slideshow slide"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        slide = Slideshow.query.get_or_404(slide_id)
        form = SlideshowForm(obj=slide)
        
        if form.validate_on_submit():
            slide.title = form.title.data
            slide.subtitle = form.subtitle.data
            slide.image_url = form.image_url.data
            slide.link_url = form.link_url.data
            slide.display_order = form.display_order.data
            slide.is_active = form.is_active.data
            
            db.session.commit()
            
            flash('Slide updated successfully', 'success')
            return redirect(url_for('admin_slideshow'))
        
        return render_template('admin/slideshow_form.html',
                              title='Edit Slide',
                              form=form,
                              action='Update',
                              slide=slide)
    
    @app.route('/admin/slideshow/delete/<int:slide_id>', methods=['POST'])
    @login_required
    def admin_delete_slide(slide_id):
        """Delete slideshow slide"""
        if not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'danger')
            return redirect(url_for('index'))
        
        slide = Slideshow.query.get_or_404(slide_id)
        
        db.session.delete(slide)
        db.session.commit()
        
        flash('Slide deleted successfully', 'success')
        return redirect(url_for('admin_slideshow'))
    
    # API routes for AJAX requests
    @app.route('/api/cart/count')
    @login_required
    def cart_count():
        """Get current cart count for AJAX requests"""
        count = CartItem.query.filter_by(user_id=current_user.id).count()
        return jsonify({'count': count})
