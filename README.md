# EduFlow LMS 🎓

> **A production-ready Learning Management System.**
> React 18 · TypeScript · Node.js · PostgreSQL · Docker · AWS ECS Fargate

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 Home Page | Hero, categories, featured courses, stats, CTA |
| 📚 Browse Courses | Search, filter by category/level, course cards |
| 📖 Course Detail | Curriculum, instructor info, reviews, enroll button |
| 🎬 Lesson Player | Video (YouTube/Vimeo/HTML5), notes, progress tracking |
| 📊 Dashboard | Streak, stats, AI recommendations, enrolled courses |
| 🎯 My Learning | All enrollments with progress bars |
| 🤖 EduFlow AI Bot | Smart chatbot with name memory and course guidance |
| 🌙 Dark/Light Mode | Toggle with localStorage persistence |
| 👤 Profile | Edit profile, change password |
| 🔐 Auth | JWT register/login, protected routes |
| ❤️ Health Check | `GET /health` for ECS ALB monitoring |

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 15 |
| Auth | JWT + bcryptjs |
| Logging | Winston |
| Containers | Docker (multi-stage builds) |
| Cloud | AWS ECS Fargate + ALB + RDS + ECR + CloudWatch |

---

## 🚀 Quick Start (Local — No Database Needed)

```powershell
# Terminal 1 — Backend demo server (in-memory, no DB required)
cd backend
npm install
node demo-server.js

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open → **http://localhost:3000**

Register an account → demo data auto-loads with 3 enrolled courses + AI bot!

---

## 🐳 Run with Docker (Full Stack)

```powershell
docker-compose up --build
```

Open → **http://localhost**

---

## 📁 Project Structure

```
ECS/
├── backend/                   # Node.js REST API
│   ├── src/
│   │   ├── config/            # env + database pool
│   │   ├── controllers/       # route handlers
│   │   ├── middleware/        # auth, error, rate-limit
│   │   ├── models/            # TypeScript types
│   │   ├── routes/            # express routers
│   │   ├── services/          # business logic
│   │   ├── utils/             # logger
│   │   ├── app.ts             # express setup
│   │   └── server.ts          # entry + graceful shutdown
│   ├── demo-server.js         # in-memory demo (no DB)
│   └── Dockerfile
│
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/        # common, layout, courses
│   │   ├── contexts/          # Auth, Toast, Theme
│   │   ├── pages/             # all route pages
│   │   ├── services/          # axios API client
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # helpers + style maps
│   ├── nginx.conf             # production nginx + /api proxy
│   └── Dockerfile
│
├── database/
│   └── migrations/            # PostgreSQL schema (eduflow db)
├── docker-compose.yml         # local dev (all services)
├── docker-compose.prod.yml    # ECR image reference
└── docs/
    └── AWS_DEPLOYMENT.md      # complete step-by-step AWS guide
```

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/courses` | No | Browse courses |
| GET | `/api/courses/:id` | No | Course detail |
| POST | `/api/enrollments/:id/enroll` | Yes | Enroll |
| GET | `/api/enrollments/my` | Yes | My enrollments |
| PUT | `/api/enrollments/lessons/:id/complete` | Yes | Mark lesson done |
| GET | `/api/dashboard/student` | Yes | Student dashboard |
| GET | `/api/dashboard/instructor` | Yes | Instructor dashboard |

---

## ☁️ AWS Deployment

See **[docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)** for complete step-by-step AWS Console guide.

---

## 🔒 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | App environment |
| `PORT` | `5000` | API port |
| `DB_NAME` | `eduflow` | PostgreSQL database name |
| `DB_USER` | `eduflow_user` | PostgreSQL user |
| `DB_PASSWORD` | — | PostgreSQL password |
| `DATABASE_URL` | — | Full connection string (overrides DB_*) |
| `JWT_SECRET` | — | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `CORS_ORIGINS` | — | Allowed origins (comma-separated) |
| `BCRYPT_ROUNDS` | `12` | Password hashing rounds |
