# tests/test_api.py
import unittest
import json
from app import app, db
from backend.models import User

class ApiTestCase(unittest.TestCase):
    def setUp(self):
        """Set up testing environment before each test"""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Use in-memory database
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        """Clean up after each test"""
        with app.app_context():
            db.session.remove()
            db.drop_all()
    
    def test_get_users_empty(self):
        """Test GET /api/users with empty database"""
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data), [])
    
    def test_create_user(self):
        """Test creating a new user"""
        user_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone': '1234567890'
        }
        response = self.client.post(
            '/api/users',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        
        # Debug the response
        print(f"Response status: {response.status_code}")
        print(f"Response data: {response.data}")
        
        self.assertEqual(response.status_code, 201)
        
        data = json.loads(response.data)
        self.assertEqual(data['first_name'], 'John')
        self.assertEqual(data['last_name'], 'Doe')
        self.assertEqual(data['email'], 'john@example.com')
        self.assertEqual(data['phone'], '1234567890')
        
    def test_get_user_by_id(self):
        """Test retrieving a specific user by ID"""
        # First create a user
        user_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane@example.com',
            'phone': '0987654321'
        }
        create_response = self.client.post(
            '/api/users',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        user_id = json.loads(create_response.data)['id']
        
        # Then retrieve the user
        response = self.client.get(f'/api/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['first_name'], 'Jane')
        self.assertEqual(data['last_name'], 'Smith')
    
    def test_update_user(self):
        """Test updating an existing user"""
        # First create a user
        user_data = {
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'email': 'alice@example.com',
            'phone': '5555555555'
        }
        create_response = self.client.post(
            '/api/users',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        user_id = json.loads(create_response.data)['id']
        
        # Then update the user
        update_data = {
            'first_name': 'Alice',
            'last_name': 'Williams',  # Changed last name
            'email': 'alice@example.com',
            'phone': '5555555555'
        }
        update_response = self.client.put(
            f'/api/users/{user_id}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        self.assertEqual(update_response.status_code, 200)
        
        data = json.loads(update_response.data)
        self.assertEqual(data['last_name'], 'Williams')
    
    def test_delete_user(self):
        """Test deleting a user"""
        # First create a user
        user_data = {
            'first_name': 'Bob',
            'last_name': 'Brown',
            'email': 'bob@example.com',
            'phone': '1112223333'
        }
        create_response = self.client.post(
            '/api/users',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        user_id = json.loads(create_response.data)['id']
        
        # Then delete the user
        delete_response = self.client.delete(f'/api/users/{user_id}')
        self.assertEqual(delete_response.status_code, 204)
        
        # Verify user is gone
        get_response = self.client.get(f'/api/users/{user_id}')
        self.assertEqual(get_response.status_code, 404)

if __name__ == '__main__':
    unittest.main()