from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import User, Player, Sport, PlayerSportRegistration
import csv


class Command(BaseCommand):
    help = 'Bulk register users and players from CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv',
            type=str,
            help='Path to CSV file with user data',
            required=False
        )
        parser.add_argument(
            '--interactive',
            action='store_true',
            help='Enter data interactively',
        )

    def handle(self, *args, **options):
        if options['csv']:
            self.bulk_from_csv(options['csv'])
        elif options['interactive']:
            self.interactive_registration()
        else:
            self.stdout.write(
                self.style.WARNING('Please specify --csv <file> or --interactive')
            )

    def bulk_from_csv(self, csv_file):
        """
        CSV format expected:
        username,email,password,first_name,last_name,contact_no,department,role,sport_ids
        
        Example:
        john_doe,john@example.com,password123,John,Doe,1234567890,CS,player,"1,2,3"
        """
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                created_count = 0
                error_count = 0

                for row in reader:
                    try:
                        with transaction.atomic():
                            # Create user with general role first
                            user = User.objects.create_user(
                                username=row['username'],
                                email=row['email'],
                                password=row['password'],
                                first_name=row.get('first_name', ''),
                                last_name=row.get('last_name', ''),
                                contact_no=row.get('contact_no', ''),
                                department=row.get('department', ''),
                                role='general'  # Always start as general
                            )

                            # Check if should create player profile
                            should_be_player = row.get('role', '').lower() == 'player'
                            if should_be_player:
                                # Create player profile and update role
                                player = Player.objects.create(user=user)
                                user.role = 'player'
                                user.save()
                                
                                # Register for sports if sport_ids provided
                                sport_ids = row.get('sport_ids', '').strip()
                                if sport_ids:
                                    sport_id_list = [int(sid.strip()) for sid in sport_ids.split(',')]
                                    for sport_id in sport_id_list:
                                        try:
                                            sport = Sport.objects.get(id=sport_id)
                                            PlayerSportRegistration.objects.create(
                                                player=player,
                                                sport=sport
                                            )
                                        except Sport.DoesNotExist:
                                            self.stdout.write(
                                                self.style.WARNING(
                                                    f'Sport ID {sport_id} not found for {user.username}'
                                                )
                                            )

                            created_count += 1
                            self.stdout.write(
                                self.style.SUCCESS(f'✓ Created: {user.username}')
                            )

                    except Exception as e:
                        error_count += 1
                        self.stdout.write(
                            self.style.ERROR(f'✗ Error for {row.get("username", "unknown")}: {str(e)}')
                        )

                self.stdout.write(
                    self.style.SUCCESS(
                        f'\n=== Summary ===\nCreated: {created_count}\nErrors: {error_count}'
                    )
                )

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading CSV: {str(e)}'))

    def interactive_registration(self):
        """Register users interactively one by one"""
        self.stdout.write(self.style.SUCCESS('=== Interactive Player Registration ===\n'))
        
        while True:
            self.stdout.write('\n--- New User ---')
            username = input('Username (or "quit" to exit): ').strip()
            
            if username.lower() == 'quit':
                break

            email = input('Email: ').strip()
            password = input('Password: ').strip()
            first_name = input('First name (optional): ').strip()
            last_name = input('Last name (optional): ').strip()
            contact_no = input('Contact number (optional): ').strip()
            department = input('Department (optional): ').strip()
            role = input('Role [general/player/captain/admin] (default: player): ').strip() or 'player'

            try:
                with transaction.atomic():
                    # Create user with general role first
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        contact_no=contact_no,
                        department=department,
                        role='general'  # Always start as general
                    )

                    # If player, create player profile and update role
                    if role == 'player':
                        player = Player.objects.create(user=user)
                        user.role = 'player'
                        user.save()
                        
                        # Show available sports
                        sports = Sport.objects.all()
                        if sports:
                            self.stdout.write('\nAvailable Sports:')
                            for sport in sports:
                                self.stdout.write(f'  {sport.id}. {sport.sports_name}')
                            
                            sport_ids_input = input('\nEnter sport IDs (comma-separated, or leave empty): ').strip()
                            if sport_ids_input:
                                sport_id_list = [int(sid.strip()) for sid in sport_ids_input.split(',')]
                                for sport_id in sport_id_list:
                                    try:
                                        sport = Sport.objects.get(id=sport_id)
                                        PlayerSportRegistration.objects.create(
                                            player=player,
                                            sport=sport
                                        )
                                        self.stdout.write(
                                            self.style.SUCCESS(f'  ✓ Registered for {sport.sports_name}')
                                        )
                                    except Sport.DoesNotExist:
                                        self.stdout.write(
                                            self.style.WARNING(f'  ✗ Sport ID {sport_id} not found')
                                        )

                    self.stdout.write(self.style.SUCCESS(f'\n✓ User {username} created successfully!'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('\n=== Registration Complete ==='))
