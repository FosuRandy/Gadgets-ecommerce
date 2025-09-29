from datetime import datetime, timedelta
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, login_manager
import uuid

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    permissions = db.relationship('Permission', secondary='role_permissions', back_populates='roles')
    user_assignments = db.relationship('RoleAssignment', backref='role', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Role {self.name}>'


class Permission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    resource = db.Column(db.String(50), nullable=False)  # e.g., 'product', 'order', 'user'
    action = db.Column(db.String(50), nullable=False)    # e.g., 'create', 'read', 'update', 'delete'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    roles = db.relationship('Role', secondary='role_permissions', back_populates='permissions')
    
    def __repr__(self):
        return f'<Permission {self.name}>'


# Association table for Role-Permission many-to-many relationship
role_permissions = db.Table('role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permission.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)


class RoleAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    assigner = db.relationship('User', foreign_keys=[assigned_by], lazy=True)
    
    def __repr__(self):
        return f'<RoleAssignment {self.user_id}-{self.role_id}>'


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='customer')  # Keep for backward compatibility
    is_seller = db.Column(db.Boolean, default=False)
    seller_status = db.Column(db.String(20), default='inactive')  # inactive, pending, approved, suspended
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='user', lazy=True)
    role_assignments = db.relationship('RoleAssignment', foreign_keys='RoleAssignment.user_id', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        # Check both old and new role system for backward compatibility
        return self.role == 'admin' or self.has_role('super_admin')
    
    def has_role(self, role_name):
        """Check if user has a specific role"""
        for assignment in self.role_assignments:
            if assignment.is_active and assignment.role.name == role_name:
                return True
        return False
    
    def has_permission(self, permission_name):
        """Check if user has a specific permission"""
        for assignment in self.role_assignments:
            if assignment.is_active:
                for permission in assignment.role.permissions:
                    if permission.name == permission_name:
                        return True
        return False
    
    def get_roles(self):
        """Get list of active roles for this user"""
        return [assignment.role for assignment in self.role_assignments if assignment.is_active]
    
    def __repr__(self):
        return f'<User {self.username}>'


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    low_stock_threshold = db.Column(db.Integer, nullable=False, default=5)
    sku = db.Column(db.String(50), nullable=True, unique=True)
    image_url = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    
    # Gadget-specific attributes
    brand = db.Column(db.String(100), nullable=True)
    model = db.Column(db.String(100), nullable=True)
    specifications = db.Column(db.JSON, nullable=True)  # Store tech specs as JSON
    warranty_months = db.Column(db.Integer, nullable=True, default=12)
    compatibility = db.Column(db.Text, nullable=True)  # Compatible devices/systems
    condition = db.Column(db.String(20), nullable=False, default='new')  # new, refurbished, used
    
    # Seller information
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    seller_commission = db.Column(db.Float, nullable=True, default=15.0)  # Commission percentage
    approval_status = db.Column(db.String(20), nullable=False, default='approved')  # pending, approved, rejected
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='product', lazy=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    seller = db.relationship('User', backref='products_sold', foreign_keys=[seller_id], lazy=True)
    
    @property
    def is_low_stock(self):
        return self.stock <= self.low_stock_threshold
    
    def adjust_stock(self, quantity, reason, admin_id=None, reference=None):
        """Adjust stock and create inventory log entry"""
        previous_stock = self.stock
        self.stock += quantity  # Can be negative for reduction
        
        # Create inventory log entry
        log_entry = {
            'product_id': self.id,
            'quantity_change': quantity,
            'previous_stock': previous_stock,
            'new_stock': self.stock,
            'reason': reason,
            'reference': reference,
            'admin_id': admin_id
        }
        
        # We'll create the InventoryLog object after the Product is saved
        return log_entry
    
    def __repr__(self):
        return f'<Product {self.name}>'


class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<CartItem {self.id}>'


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    total_amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False, default='pending')
    payment_reference = db.Column(db.String(100), nullable=True)
    shipping_address = db.Column(db.Text, nullable=False)
    shipping_city = db.Column(db.String(100), nullable=False)
    shipping_country = db.Column(db.String(100), nullable=False, default='Ghana')
    shipping_phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Order {self.order_number}>'
    
    @staticmethod
    def generate_order_number():
        return f"ORD-{uuid.uuid4().hex[:8].upper()}"


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)  # Price at time of purchase
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'


class Promotion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    discount_percent = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Promotion {self.title}>'
    
    @property
    def is_valid(self):
        now = datetime.utcnow()
        return self.is_active and self.start_date <= now <= self.end_date


class Slideshow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    subtitle = db.Column(db.String(200), nullable=True)
    image_url = db.Column(db.String(500), nullable=False)
    link_url = db.Column(db.String(500), nullable=True)
    display_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Slideshow {self.title}>'


class InventoryLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity_change = db.Column(db.Integer, nullable=False)  # Can be positive (added) or negative (removed)
    previous_stock = db.Column(db.Integer, nullable=False)
    new_stock = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(100), nullable=False)  # e.g., "Order", "Manual adjustment", "Restock", etc.
    reference = db.Column(db.String(100), nullable=True)  # Optional reference (e.g., order number, supplier invoice)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Optional reference to admin who made the change
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    admin = db.relationship('User', backref='inventory_changes', foreign_keys=[admin_id], lazy=True)
    product = db.relationship('Product', backref=db.backref('inventory_logs', lazy=True))
    
    def __repr__(self):
        return f'<InventoryLog {self.id}: {self.product_id} ({self.quantity_change})>'


class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact_name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    purchase_orders = db.relationship('PurchaseOrder', backref='supplier', lazy=True)
    
    def __repr__(self):
        return f'<Supplier {self.name}>'


class PurchaseOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    po_number = db.Column(db.String(20), unique=True, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='draft')  # draft, ordered, received, cancelled
    order_date = db.Column(db.DateTime, nullable=True)
    expected_delivery_date = db.Column(db.DateTime, nullable=True)
    delivery_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('PurchaseOrderItem', backref='purchase_order', lazy=True, cascade="all, delete-orphan")
    creator = db.relationship('User', backref='purchase_orders', foreign_keys=[created_by], lazy=True)
    
    @staticmethod
    def generate_po_number():
        return f"PO-{uuid.uuid4().hex[:8].upper()}"
    
    def __repr__(self):
        return f'<PurchaseOrder {self.po_number}>'


class PurchaseOrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity_ordered = db.Column(db.Integer, nullable=False)
    quantity_received = db.Column(db.Integer, nullable=False, default=0)
    unit_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    product = db.relationship('Product', backref='purchase_items', lazy=True)
    
    def __repr__(self):
        return f'<PurchaseOrderItem {self.id}>'
