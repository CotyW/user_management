import os
import re
from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Create Flask app
app = Flask(__name__, 
            static_folder='frontend/static', 
            static_url_path='/static')

CORS(app)  # Enable CORS for all routes

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "users.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import and initialize database 
from backend.models import db, User
db.init_app(app)

# Validation Functions
def validate_email(email):
    """Simple email validation"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

def validate_phone(phone):
    """Validate phone number (10 digits)"""
    return len(phone) == 10 and phone.isdigit()

def validate_user_data(data):
    """Validate user input"""
    errors = {}

    # Check required fields
    required_fields = ['first_name', 'last_name', 'email', 'phone']
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"

    # Additional specific validations
    if 'email' in data and not validate_email(data['email']):
        errors['email'] = 'Invalid email format'

    if 'phone' in data and not validate_phone(data['phone']):
        errors['phone'] = 'Phone must be 10 digits'

    return errors

# Create database tables
def init_db():
    with app.app_context():
        db.create_all()

# Routes to serve static files
@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    """Retrieve all users"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        # Validate incoming data
        data = request.json
        validation_errors = validate_user_data(data)
        
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Check if email or phone already exists
        existing_email = User.query.filter_by(email=data['email']).first()
        existing_phone = User.query.filter_by(phone=data['phone']).first()
        
        if existing_email:
            return jsonify({'error': 'Email already exists'}), 400
        if existing_phone:
            return jsonify({'error': 'Phone number already exists'}), 400
        
        # Create new user
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data['phone']
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify(new_user.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Retrieve a specific user"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update an existing user"""
    try:
        # Find the user
        user = User.query.get_or_404(user_id)
        
        # Get and validate incoming data
        data = request.json
        validation_errors = validate_user_data(data)
        
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Check for email conflicts 
        existing_email = User.query.filter(
            User.email == data['email'], 
            User.id != user_id
        ).first()
        
        # Check for phone conflicts 
        existing_phone = User.query.filter(
            User.phone == data['phone'], 
            User.id != user_id
        ).first()
        
        if existing_email:
            return jsonify({'error': 'Email already exists'}), 400
        if existing_phone:
            return jsonify({'error': 'Phone number already exists'}), 400
        
        # Update user details
        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.email = data['email']
        user.phone = data['phone']
        
        db.session.commit()
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get_or_404(user_id)
        
        db.session.delete(user)
        db.session.commit()
        
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Initialize database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=3000, debug=debug_mode)