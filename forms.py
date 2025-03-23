from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, FloatField, IntegerField, SelectField, HiddenField, DateTimeField, FileField
from wtforms.validators import DataRequired, Email, EqualTo, Length, NumberRange, ValidationError, Optional, URL
from datetime import datetime
from models import User, Product, Supplier

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')
    
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username is already taken. Please choose a different one.')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email is already registered. Please use a different one.')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class ProductForm(FlaskForm):
    name = StringField('Product Name', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[DataRequired()])
    price = FloatField('Price (GH₵)', validators=[DataRequired(), NumberRange(min=0)])
    stock = IntegerField('Stock Quantity', validators=[DataRequired(), NumberRange(min=0)])
    image_url = StringField('Image URL', validators=[DataRequired(), URL()])
    category = SelectField('Category', validators=[DataRequired()], choices=[
        ('camera', 'Camera Equipment'),
        ('audio', 'Audio Equipment'),
        ('lighting', 'Lighting Equipment'),
        ('software', 'Software & Plugins'),
        ('accessories', 'Accessories')
    ])
    submit = SubmitField('Save Product')

class CheckoutForm(FlaskForm):
    full_name = StringField('Full Name', validators=[DataRequired(), Length(max=100)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Phone', validators=[DataRequired(), Length(min=10, max=20)])
    address = TextAreaField('Shipping Address', validators=[DataRequired()])
    city = StringField('City', validators=[DataRequired()])
    submit = SubmitField('Proceed to Payment')

class OrderTrackingForm(FlaskForm):
    order_number = StringField('Order Number', validators=[DataRequired(), Length(min=5, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Track Order')

class PromotionForm(FlaskForm):
    title = StringField('Promotion Title', validators=[DataRequired(), Length(max=100)])
    description = TextAreaField('Description', validators=[DataRequired()])
    discount_percent = FloatField('Discount Percentage', validators=[DataRequired(), NumberRange(min=1, max=100)])
    start_date = DateTimeField('Start Date', validators=[DataRequired()], format='%Y-%m-%dT%H:%M')
    end_date = DateTimeField('End Date', validators=[DataRequired()], format='%Y-%m-%dT%H:%M')
    is_active = BooleanField('Active')
    submit = SubmitField('Save Promotion')

class SlideshowForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(max=100)])
    subtitle = StringField('Subtitle', validators=[Optional(), Length(max=200)])
    image_url = StringField('Image URL', validators=[DataRequired(), URL()])
    link_url = StringField('Link URL', validators=[Optional(), URL()])
    display_order = IntegerField('Display Order', validators=[DataRequired(), NumberRange(min=0)])
    is_active = BooleanField('Active')
    submit = SubmitField('Save Slide')

class StockAdjustmentForm(FlaskForm):
    product_id = SelectField('Product', validators=[DataRequired()], coerce=int)
    quantity = IntegerField('Quantity Change', validators=[DataRequired()])
    reason = SelectField('Reason', validators=[DataRequired()], choices=[
        ('restock', 'Restock (New Inventory)'),
        ('damage', 'Damaged Items'),
        ('adjustment', 'Inventory Adjustment'),
        ('return', 'Customer Return'),
        ('other', 'Other (Please specify in notes)')
    ])
    notes = TextAreaField('Notes', validators=[Optional()])
    reference = StringField('Reference (Optional)', validators=[Optional(), Length(max=100)])
    submit = SubmitField('Submit Adjustment')
    
    def __init__(self, *args, **kwargs):
        super(StockAdjustmentForm, self).__init__(*args, **kwargs)
        self.product_id.choices = [(p.id, p.name) for p in Product.query.order_by(Product.name).all()]

class SupplierForm(FlaskForm):
    name = StringField('Supplier Name', validators=[DataRequired(), Length(max=100)])
    contact_name = StringField('Contact Person', validators=[Optional(), Length(max=100)])
    email = StringField('Email', validators=[Optional(), Email(), Length(max=120)])
    phone = StringField('Phone', validators=[Optional(), Length(max=20)])
    address = TextAreaField('Address', validators=[Optional()])
    notes = TextAreaField('Notes', validators=[Optional()])
    submit = SubmitField('Save Supplier')

class PurchaseOrderForm(FlaskForm):
    supplier_id = SelectField('Supplier', validators=[DataRequired()], coerce=int)
    expected_delivery_date = DateTimeField('Expected Delivery Date', validators=[Optional()], format='%Y-%m-%dT%H:%M')
    notes = TextAreaField('Notes', validators=[Optional()])
    status = SelectField('Status', validators=[DataRequired()], choices=[
        ('draft', 'Draft'),
        ('ordered', 'Ordered'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled')
    ])
    submit = SubmitField('Save Purchase Order')
    
    def __init__(self, *args, **kwargs):
        super(PurchaseOrderForm, self).__init__(*args, **kwargs)
        self.supplier_id.choices = [(s.id, s.name) for s in Supplier.query.order_by(Supplier.name).all()]

class PurchaseOrderItemForm(FlaskForm):
    product_id = SelectField('Product', validators=[DataRequired()], coerce=int)
    quantity_ordered = IntegerField('Quantity Ordered', validators=[DataRequired(), NumberRange(min=1)])
    unit_price = FloatField('Unit Price (GH₵)', validators=[DataRequired(), NumberRange(min=0)])
    submit = SubmitField('Add Item')
    
    def __init__(self, *args, **kwargs):
        super(PurchaseOrderItemForm, self).__init__(*args, **kwargs)
        self.product_id.choices = [(p.id, p.name) for p in Product.query.order_by(Product.name).all()]

class ReceivePurchaseOrderForm(FlaskForm):
    delivery_date = DateTimeField('Delivery Date', validators=[DataRequired()], format='%Y-%m-%dT%H:%M', default=datetime.utcnow)
    notes = TextAreaField('Delivery Notes', validators=[Optional()])
    submit = SubmitField('Receive Items')

class ReceiveItemForm(FlaskForm):
    quantity_received = IntegerField('Quantity Received', validators=[DataRequired(), NumberRange(min=0)])
