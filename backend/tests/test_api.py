from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import tempfile
import os

class APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
    
    def test_health_check(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
    
    def test_areas_endpoint_no_data(self):
        response = self.client.get('/api/areas/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('areas', response.data)
        self.assertEqual(response.data['areas'], [])
    
    def test_analyze_endpoint_no_data(self):
        response = self.client.get('/api/analyze/', {'area': 'TestArea'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_upload_invalid_file(self):
        # Create a temporary text file
        temp_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        temp_file.write(b'Test content')
        temp_file.close()
        
        with open(temp_file.name, 'rb') as file:
            response = self.client.post('/api/upload/', {'file': file}, format='multipart')
        
        os.unlink(temp_file.name)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)