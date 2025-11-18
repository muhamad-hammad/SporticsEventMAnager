from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from .models import User, Player


class RegisterPlayerTest(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='testuser', password='pass123')
		self.client = APIClient()
		# authenticate as the created user (RegisterPlayer requires IsAuthenticated)
		self.client.force_authenticate(user=self.user)

	def test_register_player(self):
		url = '/api/player/register/'
		payload = {
			'student_id': 'S12345',
			'department': 'Computer Science',
			'semester': '5'
		}

		response = self.client.post(url, payload, format='json')
		self.assertEqual(response.status_code, 201)
		# ensure Player object created and linked to the authenticated user
		player = Player.objects.get(user=self.user)
		self.assertEqual(player.student_id, payload['student_id'])
