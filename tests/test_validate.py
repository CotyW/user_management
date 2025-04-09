# tests/test_validation.py
import unittest
from app import validate_email, validate_phone, validate_user_data

class ValidationTestCase(unittest.TestCase):
    def test_email_validation(self):
        """Test email validation function"""
        # Valid emails
        self.assertTrue(validate_email('test@example.com'))
        self.assertTrue(validate_email('user.name@domain.co.uk'))
        self.assertTrue(validate_email('user+tag@example.org'))
        
        # Invalid emails
        self.assertFalse(validate_email('not-an-email'))
        self.assertFalse(validate_email('missing@domain'))
        self.assertFalse(validate_email('@example.com'))
        self.assertFalse(validate_email('spaces in@example.com'))
    
    def test_phone_validation(self):
        """Test phone validation function"""
        # Valid phones (10 digits)
        self.assertTrue(validate_phone('1234567890'))
        self.assertTrue(validate_phone('9876543210'))
        
        # Invalid phones
        self.assertFalse(validate_phone('123456789'))  # Too short
        self.assertFalse(validate_phone('12345678901'))  # Too long
        self.assertFalse(validate_phone('123-456-7890'))  # Contains non-digits
        self.assertFalse(validate_phone('abcdefghij'))  # Not digits
    
    def test_user_data_validation(self):
        """Test user data validation function"""
        # Valid data
        valid_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone': '1234567890'
        }
        self.assertEqual(validate_user_data(valid_data), {})  # No errors
        
        # Missing required fields
        missing_name = {
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone': '1234567890'
        }
        errors = validate_user_data(missing_name)
        self.assertIn('first_name', errors)
        
        # Invalid email
        invalid_email = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'not-valid-email',
            'phone': '1234567890'
        }
        errors = validate_user_data(invalid_email)
        self.assertIn('email', errors)
        
        # Invalid phone
        invalid_phone = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'phone': '123-456-7890'  # Contains non-digits
        }
        errors = validate_user_data(invalid_phone)
        self.assertIn('phone', errors)

if __name__ == '__main__':
    unittest.main()