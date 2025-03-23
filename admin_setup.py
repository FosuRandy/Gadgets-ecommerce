#!/usr/bin/env python
import os
import sys
from datetime import datetime
from getpass import getpass

# Add the current directory to the path so we can import our app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import User

def create_admin():
    """Create an admin user or update an existing user to admin role"""
    print("=== ContentCreate Admin Setup ===")
    
    # Check for existing users
    with app.app_context():
        user_count = User.query.count()
        print(f"Total users in database: {user_count}")
        
        # Ask for email
        email = input("Enter admin email: ").strip()
        
        # Check if user already exists
        user = User.query.filter_by(email=email).first()
        
        if user:
            print(f"User {user.username} found with email {email}")
            confirm = input(f"Make {user.username} an admin? (y/n): ").strip().lower()
            
            if confirm != 'y':
                print("Operation cancelled.")
                return
            
            # Update user role
            user.role = "admin"
            db.session.commit()
            print(f"User {user.username} is now an administrator.")
        else:
            print("Creating new admin user...")
            username = input("Enter username: ").strip()
            
            # Get password securely
            while True:
                password = getpass("Enter password: ")
                if not password:
                    print("Password cannot be empty.")
                    continue
                    
                confirm_password = getpass("Confirm password: ")
                if password != confirm_password:
                    print("Passwords don't match. Try again.")
                else:
                    break
            
            # Create new admin user
            new_user = User(
                username=username,
                email=email,
                role="admin"
            )
            new_user.set_password(password)
            
            # Save to database
            db.session.add(new_user)
            db.session.commit()
            print(f"Admin user {username} created successfully.")

if __name__ == "__main__":
    create_admin()