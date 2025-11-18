# Real Estate Chatbot (Full Project)

This archive contains a minimal Django backend and a React frontend (create-react-app style).
Backend serves a single endpoint that reads `data.xlsx` and returns analysis for a queried locality.

## Backend (Django)

Path: ./backend

1. Create virtualenv and install:

   ```
   python -m venv venv
   source venv/bin/activate   # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. Run migrations and server:
   ```
   cd backend
   python manage.py migrate
   python manage.py runserver
   ```

API endpoint:
POST http://127.0.0.1:8000/api/analyze/
Body (json): { "query": "Analyze Wakad" }

## Frontend (React)

Path: ./client

1. Install dependencies:

   ```
   cd client
   npm install
   ```

2. Start dev server:
   ```
   npm start
   ```

The React app will call the Django API at http://127.0.0.1:8000/api/analyze/

Note: Styling uses Tailwind-like utility classes in JSX. For full UI parity, install and configure Tailwind or adjust classes.
