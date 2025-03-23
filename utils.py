import os
import json
import random
import requests
from datetime import datetime, timedelta
from flask import current_app, url_for
from flask_mail import Message
from app import db, mail
from models import User, Product, Promotion, Slideshow

def initialize_demo_data():
    """Initialize demo data if the database is empty"""
    # Only run if no users exist
    if User.query.count() == 0:
        # Create admin user
        admin = User(
            username="admin",
            email="admin@example.com",
            role="admin"
        )
        admin.set_password("adminpassword")
        db.session.add(admin)
        
        # Create regular user
        user = User(
            username="user",
            email="user@example.com", 
            role="customer"
        )
        user.set_password("userpassword")
        db.session.add(user)
        
        # Commit users
        db.session.commit()
        
        # Create sample products
        products = [
            {
                "name": "Professional DSLR Camera",
                "description": "High-quality DSLR camera perfect for photography and video recording. Features 24MP sensor, 4K video recording, and advanced autofocus.",
                "price": 3200.00,
                "stock": 15,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/DSLRCamera.svg",
                "category": "camera"
            },
            {
                "name": "Condenser Microphone",
                "description": "Professional studio-quality condenser microphone with cardioid pattern. Perfect for vocals, podcasts, and studio recordings.",
                "price": 450.00,
                "stock": 25,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/Microphone.svg",
                "category": "audio"
            },
            {
                "name": "LED Ring Light Kit",
                "description": "18-inch LED ring light with adjustable brightness and color temperature. Includes stand and phone holder for perfect lighting in any situation.",
                "price": 320.00,
                "stock": 30,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/RingLight.svg",
                "category": "lighting"
            },
            {
                "name": "Video Editing Software Premium",
                "description": "Professional video editing software with advanced features like color grading, motion tracking, and special effects. One-year license included.",
                "price": 600.00,
                "stock": 100,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/EditingSoftware.svg",
                "category": "software"
            },
            {
                "name": "Portable SSD Drive - 1TB",
                "description": "Ultra-fast portable SSD drive with 1TB capacity. Transfer speeds up to 1000MB/s. Perfect for storing and transferring large video files.",
                "price": 780.00,
                "stock": 20,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/SSDDrive.svg",
                "category": "accessories"
            },
            {
                "name": "Wireless Lavalier Microphone",
                "description": "Compact wireless lavalier microphone with 50m range. Includes transmitter, receiver, and windscreen for clear audio recording on the go.",
                "price": 380.00,
                "stock": 18,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/LavalierMic.svg",
                "category": "audio"
            },
            {
                "name": "Adjustable Tripod Stand",
                "description": "Heavy-duty tripod stand with adjustable height from 65cm to 200cm. Includes quick-release plate and fluid head for smooth panning.",
                "price": 250.00,
                "stock": 22,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/Tripod.svg",
                "category": "accessories"
            },
            {
                "name": "Photo Editing Software Suite",
                "description": "Complete photo editing software suite with advanced tools for retouching, compositing, and RAW processing. One-year subscription.",
                "price": 490.00,
                "stock": 80,
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/PhotoSoftware.svg",
                "category": "software"
            }
        ]
        
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
        
        # Create active promotion
        promo = Promotion(
            title="Launch Week Special",
            description="Get 20% off all products during our launch week celebration!",
            discount_percent=20.0,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=7),
            is_active=True
        )
        db.session.add(promo)
        
        # Create slideshow items
        slides = [
            {
                "title": "Professional Gear for Content Creators",
                "subtitle": "High-quality equipment to elevate your content",
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/ContentCreationStudio.svg",
                "link_url": "/products",
                "display_order": 1,
                "is_active": True
            },
            {
                "title": "Launch Week Sale - 20% Off",
                "subtitle": "Limited time offer on all our products",
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/SalePromotion.svg",
                "link_url": "/products",
                "display_order": 2,
                "is_active": True
            },
            {
                "title": "Audio Equipment for Perfect Sound",
                "subtitle": "Capture crystal clear audio for your productions",
                "image_url": "https://cdn.shopify.com/s/files/1/0046/2471/1793/files/AudioProduction.svg",
                "link_url": "/products?category=audio",
                "display_order": 3,
                "is_active": True
            }
        ]
        
        for slide_data in slides:
            slide = Slideshow(**slide_data)
            db.session.add(slide)
        
        # Commit everything
        db.session.commit()

def send_order_confirmation_email(order):
    """Send order confirmation email to the customer"""
    try:
        msg = Message(
            subject=f"Your Order Confirmation #{order.order_number}",
            recipients=[order.user.email]
        )
        
        msg.html = f"""
        <h2>Thank you for your order!</h2>
        <p>We're processing your order #{order.order_number} placed on {order.created_at.strftime('%B %d, %Y')}.</p>
        
        <h3>Order Details:</h3>
        <table style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            </tr>
            {''.join([f"<tr><td style='border: 1px solid #ddd; padding: 8px;'>{item.product.name}</td><td style='border: 1px solid #ddd; padding: 8px;'>{item.quantity}</td><td style='border: 1px solid #ddd; padding: 8px;'>GH₵{item.price:.2f}</td></tr>" for item in order.items])}
            <tr>
                <td colspan="2" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Total:</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>GH₵{order.total_amount:.2f}</strong></td>
            </tr>
        </table>
        
        <h3>Shipping Address:</h3>
        <p>{order.shipping_address}<br>{order.shipping_city}, {order.shipping_country}</p>
        
        <p>You can track your order status using your order number at <a href="{url_for('track_order', _external=True)}">our order tracking page</a>.</p>
        
        <p>Thank you for shopping with us!</p>
        """
        
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send order confirmation email: {str(e)}")
        return False

def verify_paystack_transaction(reference):
    """Verify Paystack transaction using the reference"""
    secret_key = current_app.config.get('PAYSTACK_SECRET_KEY')
    if not secret_key:
        current_app.logger.error("Paystack secret key not configured")
        return None
    
    try:
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data['status'] and data['data']['status'] == 'success':
                return data['data']
        return None
    except Exception as e:
        current_app.logger.error(f"Failed to verify Paystack transaction: {str(e)}")
        return None

def get_active_promotion():
    """Get currently active promotion"""
    now = datetime.utcnow()
    return Promotion.query.filter(
        Promotion.is_active == True,
        Promotion.start_date <= now,
        Promotion.end_date >= now
    ).first()

def apply_promotion_to_price(price, promotion=None):
    """Apply promotion discount to price if promotion is valid"""
    if not promotion:
        promotion = get_active_promotion()
    
    if promotion and promotion.is_valid:
        discount = price * (promotion.discount_percent / 100)
        return price - discount
    return price
