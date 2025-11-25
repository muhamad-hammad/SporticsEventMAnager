import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sportics_backend.settings')
django.setup()

from core.models import User, Sport, PlayerRegistration
from django.contrib.auth.hashers import make_password

# Cricket players data
users_data = [
    {"first_name": "Syed Samroze Ali", "username": "22K-4187", "email": "k224187@nu.edu.pk", "sports": [7]},
    {"first_name": "Syed Bilal Gillani", "username": "22K-4867", "email": "k224867@nu.edu.pk", "sports": [7]},
    {"first_name": "Anas Bin Tariq", "username": "23k-6096", "email": "k236096@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Maavia", "username": "22K-4932", "email": "k224932@nu.edu.pk", "sports": [7]},
    {"first_name": "Mohsin Hassan", "username": "24K-1005", "email": "k241005@nu.edu.pk", "sports": [7]},
    {"first_name": "M Anas Tahir", "username": "22K-4915", "email": "k224915@nu.edu.pk", "sports": [7]},
    {"first_name": "Mohammad Yesaullah Sheikh", "username": "23K-0019", "email": "k230019@nu.edu.pk", "sports": [7]},
    {"first_name": "Hamza Nadeem Siddiqui", "username": "22k-4895", "email": "k224895@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Zain Baig", "username": "22K-4593", "email": "k224593@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Arham", "username": "21k-3925", "email": "k213925@nu.edu.pk", "sports": [7]},
    {"first_name": "Hamdan Vohra", "username": "22K-4318", "email": "k224318@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Momin Imran", "username": "25k-5721", "email": "k255721@nu.edu.pk", "sports": [7]},
    {"first_name": "Syed Abdullah Bin Tariq", "username": "22k-4253", "email": "k224253@nu.edu.pk", "sports": [7]},
    {"first_name": "Syed Muhammad Rayyan", "username": "23K-0624", "email": "k230624@nu.edu.pk", "sports": [7]},
    {"first_name": "Mohammad Usman Khan", "username": "25K-6028", "email": "k256028@nu.edu.pk", "sports": [7]},
    {"first_name": "Zeeshan Azam", "username": "25K-0150", "email": "k250150@nu.edu.pk", "sports": [7]},
    {"first_name": "Muawia", "username": "25K-5682", "email": "k255682@nu.edu.pk", "sports": [7]},
    {"first_name": "Taha Malik", "username": "22k-2108", "email": "k222108@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Omer Bari(VC)", "username": "24k-6074", "email": "k246074@nu.edu.pk", "sports": [7]},
    {"first_name": "Syed Muhammad Yuneebullah", "username": "22K-2103", "email": "k222103@nu.edu.pk", "sports": [7]},
    {"first_name": "Hussain Madni", "username": "22K-2106", "email": "k222106@nu.edu.pk", "sports": [7]},
    {"first_name": "Nawal Ali Ahmed", "username": "22K-4099", "email": "k224099@nu.edu.pk", "sports": [7]},
    {"first_name": "Shaheer Anjum", "username": "22k-4101", "email": "k224101@nu.edu.pk", "sports": [7]},
    {"first_name": "Syed Aadil Ahmed", "username": "22K-4339", "email": "k224339@nu.edu.pk", "sports": [7]},
    {"first_name": "Huzaifa Faran", "username": "22K-5197", "email": "k225197@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Bilal", "username": "23K-0026", "email": "k230026@nu.edu.pk", "sports": [7]},
    {"first_name": "Usman Khalid", "username": "23K-0516", "email": "k230516@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Waliuddin Ahmed", "username": "23k-0719", "email": "k230719@nu.edu.pk", "sports": [7]},
    {"first_name": "Yuneeb Azam", "username": "23k-0733", "email": "k230733@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Hammad Ayaz", "username": "23k-6038", "email": "k236038@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Aaliyan", "username": "25k-0901", "email": "k250901@nu.edu.pk", "sports": [7]},
    {"first_name": "Hamza Siddiqui", "username": "25k-0653", "email": "k250653@nu.edu.pk", "sports": [7]},
    {"first_name": "Wali", "username": "25k-5571", "email": "k255571@nu.edu.pk", "sports": [7]},
    {"first_name": "Zaheer", "username": "25k-2515", "email": "k252515@nu.edu.pk", "sports": [7]},
    {"first_name": "Umer Farooq", "username": "23K-2067", "email": "k232067@nu.edu.pk", "sports": [7]},
    {"first_name": "Osaid Ur Rehman", "username": "22k-4763", "email": "k224763@nu.edu.pk", "sports": [7]},
    {"first_name": "Khawaja Alyan Uddin", "username": "24k-2008", "email": "k242008@nu.edu.pk", "sports": [7]},
    {"first_name": "Faizan Raza", "username": "23k-0834", "email": "k230834@nu.edu.pk", "sports": [7]},
    {"first_name": "Sohaib Sarmad", "username": "24k-5011", "email": "k245011@nu.edu.pk", "sports": [7]},
    {"first_name": "Sameed Imran", "username": "24K-1036", "email": "k241036@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Usman Ghani", "username": "22K-4756", "email": "k224756@nu.edu.pk", "sports": [7]},
    {"first_name": "Syed Muhammad Haisam Ali", "username": "23k-6099", "email": "k236099@nu.edu.pk", "sports": [7]},
    {"first_name": "Abdul Wadood", "username": "22k-4764", "email": "k224764@nu.edu.pk", "sports": [7]},
    {"first_name": "Moiz Ahmed", "username": "22k-4795", "email": "k224795@nu.edu.pk", "sports": [7]},
    {"first_name": "Hamaiz Siddiqui", "username": "22k-4682", "email": "k224682@nu.edu.pk", "sports": [7]},
    {"first_name": "Hammad Zaidi", "username": "23K-0597", "email": "k230597@nu.edu.pk", "sports": [7]},
    {"first_name": "M. Saim Khurram", "username": "25K-6500", "email": "k256500@nu.edu.pk", "sports": [7]},
    {"first_name": "Hamza Farhan Saeed", "username": "25K-0684", "email": "k250684@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Khan", "username": "25k-5621", "email": "k255621@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Bazil Qureshi", "username": "25k-5742", "email": "k255742@nu.edu.pk", "sports": [7]},
    {"first_name": "Yousuf", "username": "23k-0809", "email": "k230809@nu.edu.pk", "sports": [7]},
    {"first_name": "Azan", "username": "23k-0819", "email": "k230819@nu.edu.pk", "sports": [7]},
    {"first_name": "Ramis", "username": "23k-0829", "email": "k230829@nu.edu.pk", "sports": [7]},
    {"first_name": "Abdullah Raheel", "username": "23k-0839", "email": "k230839@nu.edu.pk", "sports": [7]},
    {"first_name": "Tayyab", "username": "25K-0685", "email": "k250685@nu.edu.pk", "sports": [7]},
    {"first_name": "Faris", "username": "23k-0849", "email": "k230849@nu.edu.pk", "sports": [7]},
    {"first_name": "Shaheer", "username": "22K-4389", "email": "k224389@nu.edu.pk", "sports": [7]},
    {"first_name": "Abdul Moiz", "username": "23k-0859", "email": "k230859@nu.edu.pk", "sports": [7]},
    {"first_name": "Shoaib", "username": "24k-1028", "email": "k241028@nu.edu.pk", "sports": [7]},
    {"first_name": "Umair Gul", "username": "23k-0869", "email": "k230869@nu.edu.pk", "sports": [7]},
    {"first_name": "Rafay Ahmed", "username": "22k-5030", "email": "k225030@nu.edu.pk", "sports": [7]},
    {"first_name": "Abdul Wasey", "username": "23k-0879", "email": "k230879@nu.edu.pk", "sports": [7]},
    {"first_name": "Uzair Mustafa", "username": "23k-0889", "email": "k230889@nu.edu.pk", "sports": [7]},
    {"first_name": "Muhammad Maaz", "username": "23k-0899", "email": "k230899@nu.edu.pk", "sports": [7]},
    {"first_name": "Shahzad Hussain", "username": "23P-3068", "email": "p233068@nu.edu.pk", "sports": [7]},
    {"first_name": "Saifullah", "username": "24k-5578", "email": "k245578@nu.edu.pk", "sports": [7]},
]

cricket = Sport.objects.get(id=7)
password = "shubair.fast.23"

print("=" * 60)
print("ADDING CRICKET PLAYERS")
print("=" * 60)

created_users = 0
created_registrations = 0
skipped = 0

for data in users_data:
    username = data['username']
    
    # Check if user already exists
    user = User.objects.filter(username=username).first()
    
    if not user:
        # Create new user
        user = User.objects.create(
            username=username,
            email=data['email'],
            first_name=data['first_name'],
            password=make_password(password),
            role='player'
        )
        created_users += 1
        print(f"✓ Created user: {username}")
    else:
        print(f"- User exists: {username}")
    
    # Create PlayerRegistration for cricket
    registration, created = PlayerRegistration.objects.get_or_create(
        user=user,
        sport=cricket,
        defaults={'status': 'approved'}
    )
    
    if created:
        created_registrations += 1
        print(f"  ✓ Registered for cricket (approved)")
    else:
        skipped += 1
        print(f"  - Already registered")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"Users created: {created_users}")
print(f"Cricket registrations created: {created_registrations}")
print(f"Already registered: {skipped}")

# Final count
total = PlayerRegistration.objects.filter(sport=cricket, status='approved').count()
print(f"\n✅ Total approved cricket players: {total}")
