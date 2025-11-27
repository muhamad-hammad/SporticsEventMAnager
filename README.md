<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>

<body>

<div class="header">
  <h1>🏆 Sportics Event Manager</h1>
  <p class="tagline">A complete sports event management system with Django REST & Next.js</p>
</div>

<div class="section">
  <h2>📋 Table of Contents</h2>
  <ul>
    <li>Features</li>
    <li>Tech Stack</li>
    <li>System Requirements</li>
        <li>Installation (Backend + Frontend)</li>
    <li>Running the Application</li>
    <li>Project Structure</li>
    <li>API Documentation</li>
    <li>Troubleshooting</li>
  </ul>
</div>

<div class="section">
  <h2>✨ Features</h2>
  <ul>
    <li>Role-based user authentication (Admin, Captain, Player)</li>
    <li>LOG Module: Draft system, player registration, house management</li>
    <li>Olympiad Module: Team registration, brackets, multi-sport support</li>
    <li>Court booking with price calculation</li>
    <li>Match creation, scheduling & results</li>
    <li>Leaderboard + standings</li>
  </ul>
</div>

<div class="section">
  <h2>🛠️ Tech Stack</h2>
  <span class="badge">Django REST</span>
  <span class="badge">Next.js 16</span>
  <span class="badge">Tailwind CSS</span>
  <span class="badge">JWT Auth</span>
  <span class="badge">MySQL / SQLite</span>

  <h3>Backend</h3>
  <ul>
    <li>Django 5.2.7</li>
    <li>REST Framework 3.16.1</li>
    <li>JWT Authentication</li>
  </ul>

  <h3>Frontend</h3>
  <ul>
    <li>Next.js 16 (App Router)</li>
    <li>React 19 + TypeScript</li>
    <li>TailwindCSS 4</li>
  </ul>
</div>

<div class="section">
  <h2>💻 System Requirements</h2>
  <ul>
    <li>Python 3.11+</li>
    <li>Node.js 18+</li>
    <li>Git Installed</li>
  </ul>
</div>

<div class="section">
  <h2>📦 Installation — Backend (Django)</h2>

  <h3>1. Clone the repository</h3>
  <pre>
git clone https://github.com/muhamad-hammad/SporticsEventManager.git
cd SporticsEventManager
  </pre>

  <h3>2. Create Virtual Environment</h3>
  <pre>
cd Sportics
python -m venv env
env\Scripts\activate
  </pre>

  <h3>3. Install Dependencies</h3>
  <pre>pip install -r requirements.txt</pre>

  <h3>4. Setup Database</h3>
  <pre>
python manage.py makemigrations
            python manage.py migrate
python manage.py createsuperuser
  </pre>
</div>

<div class="section">
  <h2>🎨 Frontend Installation (Next.js)</h2>

  <h3>1. Navigate to frontend</h3>
  <pre>cd sportics_backend/frontend</pre>

  <h3>2. Install packages</h3>
  <pre>npm install</pre>

  <h3>3. Environment Variables</h3>
  <pre>
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
  </pre>
</div>

<div class="section">
  <h2>🚀 Running the Application</h2>

  <h3>Start Backend</h3>
  <pre>
cd sportics_backend
python manage.py runserver
  </pre>

  <h3>Start Frontend</h3>
  <pre>npm run dev</pre>

  <p>✨ Backend → http://127.0.0.1:8000<br>
     ✨ Frontend → http://localhost:3000</p>
</div>

<div class="section">
  <h2>🗂️ Project Structure</h2>

  <pre>
Sportics/
├── env/
├── sportics_backend/
│   ├── core/
│   ├── frontend/
│   ├── sportics_backend/
│   ├── manage.py
│   └── db.sqlite3
└── README.md
  </pre>
</div>

<div class="section">
  <h2>📚 API Documentation</h2>

  <h3>Authentication</h3>
  <table>
    <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
    <tr><td>POST</td><td>/auth/users/</td><td>Create User</td></tr>
    <tr><td>POST</td><td>/auth/jwt/create/</td><td>Login</td></tr>
    <tr><td>GET</td><td>/auth/users/me/</td><td>Get User</td></tr>
  </table>

  <h3>Sports</h3>
  <table>
    <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
    <tr><td>GET</td><td>/api/sports/</td><td>List Sports</td></tr>
    <tr><td>POST</td><td>/api/sports/</td><td>Create Sport</td></tr>
  </table>
</div>

<div class="section">
  <h2>🐛 Troubleshooting</h2>

  <h3>Port Already in Use</h3>
  <pre>python manage.py runserver 8080</pre>

  <h3>Frontend Issues</h3>
  <pre>
npm cache clean --force
npm install
  </pre>
</div>

<div class="section">
  <h2>👥 Contributors</h2>
  <p><a href="https://github.com/SyedMuhammadShubairHyder">Shubair Hyder</a></p>
  <p><a href="https://github.com/muhamad-hammad">Hammad Bhatti</a></p>
  <p><a href="https://github.com/ayeshowcode">Ayesh</a></p>
</div>

<div class="footer">
  <p>Made for the Database Systems Project</p>
</div>

</body>
</html>
