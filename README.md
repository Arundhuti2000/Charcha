# Charcha Social Media 

A full-stack social media application with real-time voting, user authentication, and scalable cloud deployment.

**Live Demo:** https://ca-social-media.mangodesert-0d3ef58a.eastus.azurecontainerapps.io
**API Docs:** https://ca-social-media.mangodesert-0d3ef58a.eastus.azurecontainerapps.io/docs

---

## Overview

Social platform where users can create accounts, share posts, and engage through a voting system. Built with FastAPI backend and React TypeScript frontend, deployed on Azure Container Apps with PostgreSQL database.
Still in Progress, many features yet to come.

## Features

**User Management**
- JWT-based authentication with secure token handling
- User registration and profile management
- Protected routes and authorization middleware

**Content System**
- Create, edit, and delete posts with categories and ratings
- Real-time vote counting (upvotes/downvotes)
- Search posts by title and content
- User-specific post history

**Technical Capabilities**
- Responsive design with dark theme support
- Auto-scaling deployment (0-10 replicas)
- Database migrations with version control
- Comprehensive API documentation

---

## Architecture

**Backend (FastAPI)**
```
Repository Pattern implementation for clean data access
Dependency injection for modular, testable code
SQLAlchemy ORM with PostgreSQL database
Alembic migrations for schema management
JWT authentication with bcrypt password hashing
```

**Frontend (React TypeScript)**
```
TanStack Query for server state management
Custom hooks for API interactions
Tailwind CSS with component-based styling
Form validation with real-time feedback
Responsive design with mobile-first approach
```

**Infrastructure (Azure)**
```
Container Apps deployment with automatic scaling
Managed PostgreSQL database with connection pooling
Docker containerization with multi-stage builds
Environment-based configuration management
SSL termination and load balancing
```

---

## Performance

- API response times averaging 180ms
- Optimized database queries with proper indexing
- Efficient vote aggregation using SQL window functions
- Frontend bundle optimization for fast loading
- Auto-scaling based on CPU/memory utilization

## Technology Stack

**Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL, Alembic, JWT  
**Frontend:** React 19, TypeScript, TanStack Query, Tailwind CSS, Vite  
**Infrastructure:** Azure Container Apps, Azure PostgreSQL, Docker  
**Security:** JWT tokens, bcrypt hashing, CORS configuration, input validation

---

## Database Schema

**Users Table**
- User authentication and profile information
- Timestamps for account creation tracking

**Posts Table**  
- Post content with categories and ratings
- Foreign key relationships to users
- Full-text search indexing

**Votes Table**
- User voting records with post associations
- Composite primary key for vote uniqueness
- Direction tracking (upvote/downvote)

---

## API Endpoints

**Authentication**
- `POST /login` - User authentication
- `POST /register` - Account creation

**Posts**
- `GET /posts/` - Retrieve posts with vote counts
- `POST /posts/` - Create new post
- `PUT /posts/{id}` - Update existing post
- `DELETE /posts/{id}` - Remove post
- `GET /posts/profileposts` - User's posts

**Voting**
- `POST /vote/` - Submit vote (1: upvote, -1: downvote, 0: remove)

**Users**
- `GET /users/{id}` - User profile information
- `GET /users/` - Current user profile

---

## Local Development

**Prerequisites**
- Python 3.11+
- Node.js 20+
- PostgreSQL 12+

**Backend Setup**
```bash
cd socialmedia-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend Setup**
```bash
cd socialmedia-frontend
npm install
npm run dev
```

**Docker Deployment**
```bash
docker build -t socialmedia-api:latest .
docker tag socialmedia-api:latest acrsocialmedia01.azurecr.io/socialmedia-api:latest
docker push acrsocialmedia01.azurecr.io/socialmedia-api:latest
```

---

## Project Structure

```
socialmedia-api/
├── app/
│   ├── routes/              # API endpoint definitions
│   ├── repositories/        # Data access layer
│   │   ├── database/        # Database implementations  
│   │   └── interfaces/      # Abstract interfaces
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic validation schemas
│   ├── oauth2.py           # JWT authentication logic
│   ├── database.py         # Database connection setup
│   └── dependencies.py     # Dependency injection
├── alembicdb/              # Database migration files
└── requirements.txt        # Python dependencies

socialmedia-frontend/
├── src/
│   ├── api/               # API client and React Query hooks
│   ├── components/        # Reusable UI components
│   ├── pages/            # Application pages
│   ├── utils/            # Helper functions
│   └── types.ts         # TypeScript definitions
├── package.json         # Node.js dependencies
└── vite.config.ts      # Build configuration
```

---

## Environment Configuration

**Backend (.env)**
```
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=socialmedia_db
SECRET_KEY=your-jwt-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend (.env.development)**
```
REACT_APP_API_URL=http://localhost:8000
```

---

## Deployment

Application deployed on Azure Container Apps with:
- Automatic scaling based on demand
- Managed PostgreSQL database
- SSL certificates and custom domains
- Environment variable management
- Application monitoring and logging

**Production URLs:**
- Frontend: Deployed via Azure Container Apps
- Backend API: Containerized FastAPI application
- Database: Azure Database for PostgreSQL

