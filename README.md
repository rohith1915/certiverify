# CertVerify — Full Stack Certificate Verification System

A complete certificate management and verification system built with **React + Node.js + MySQL**.

---

## Project Structure

```
certverify/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── index.js                    # Entry point
│   │   ├── models/db.js                # MySQL pool + DB init + seeding
│   │   ├── middleware/auth.js          # JWT middleware
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login, getMe
│   │   │   └── studentController.js   # CRUD, verify, import, stats
│   │   └── routes/
│   │       ├── auth.js
│   │       └── students.js
│   ├── .env.example
│   └── package.json
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx                     # Routes
    │   ├── api/axios.js                # Axios + JWT interceptor
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx       # Admin dashboard
    │   │   └── VerifyPage.jsx          # Public verify
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── StudentModal.jsx        # Add/Edit form
    │       └── CertModal.jsx           # Certificate preview + PDF download
    ├── index.html
    └── package.json
```

---

## Prerequisites

- Node.js v18+
- MySQL 8.0+
- npm or yarn

---

## Setup Instructions

### 1. MySQL Database

Open MySQL and create the database:

```sql
CREATE DATABASE certverify;
```

> Tables (`users`, `students`) are created **automatically** on first server start.
> Default admin credentials are also seeded: **admin / admin123**

---

### 2. Backend Setup

```bash
cd certverify/backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=certverify
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

Start the backend:
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd certverify/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Default Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## Features

### Admin Dashboard
- Login with JWT authentication
- View all students in a searchable, filterable table
- Add, Edit, Delete student records
- Search by name, course, or year
- Bulk import students from CSV / Excel file
- View certificate preview with PDF download
- Stats cards: total students, courses, latest year

### Public Certificate Verification
- No login required — accessible at `/verify`
- Enter any Certificate ID (e.g. `CERT001`) to verify
- Shows student name, course, year, email on success

---

## API Endpoints

### Auth
| Method | Endpoint       | Access  | Description        |
|--------|----------------|---------|--------------------|
| POST   | /api/auth/login | Public | Login, get JWT     |
| GET    | /api/auth/me   | Private | Get logged-in user |

### Students
| Method | Endpoint                       | Access  | Description               |
|--------|--------------------------------|---------|---------------------------|
| GET    | /api/students                  | Private | List all (with search)    |
| GET    | /api/students/stats            | Private | Stats for dashboard       |
| GET    | /api/students/:id              | Private | Get single student        |
| POST   | /api/students                  | Private | Create student            |
| PUT    | /api/students/:id              | Private | Update student            |
| DELETE | /api/students/:id              | Private | Delete student            |
| GET    | /api/students/verify/:certId   | **Public** | Verify certificate     |
| POST   | /api/students/import/excel     | Private | Bulk import CSV/XLSX      |

---

## CSV Import Format

Your CSV file should have these columns (first row = header):

```
name,email,roll,course,year,cert_id
Ravi,ravi@gmail.com,106,MBA,2026,CERT006
Priya,priya@gmail.com,107,BBA,2025,CERT007
```

`cert_id` is optional — it will be auto-generated if left blank.

---

## Deployment

### Backend (Railway / Render)
1. Push `backend/` folder to a GitHub repo
2. Connect to Railway or Render
3. Set environment variables in dashboard
4. Deploy — it auto-runs `npm start`

### Frontend (Vercel)
1. Push `frontend/` folder to GitHub
2. Import on Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend-url.com`
4. Update `vite.config.js` proxy or use `import.meta.env.VITE_API_URL` in `axios.js`

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router v6     |
| Styling   | CSS Modules                         |
| HTTP      | Axios with JWT interceptors         |
| Backend   | Node.js, Express 4                  |
| Database  | MySQL 8 via mysql2                  |
| Auth      | JWT (jsonwebtoken) + bcryptjs       |
| PDF       | jsPDF                               |
| Import    | xlsx (SheetJS)                      |
| Upload    | Multer                              |
