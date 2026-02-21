# CK-Judge2 (NCKU CSIE PD2 Online Judge)

A modern, full-stack Online Judge system designed for algorithmic problem solving and contest management, featuring a secure **IOI Isolate Sandbox** for judging submissions.

## 🚀 Features

-   **Frontend**: Sci-Fi themed UI built with React, TypeScript, Vite, and Tailwind CSS.
-   **Backend**: High-performance REST API built with Python, FastAPI, and Pydantic.
-   **Database**: PostgreSQL for persistent storage.
-   **Task Queue**: Celery + Redis for asynchronous background tasks (judging submissions natively).
-   **Sandbox Engine**: IOI Isolate v1.10.1 providing Cgroup-level memory & process isolation.
-   **Contest Module**: Full support for creating and managing contests/homeworks with real-time scoring.
-   **Admin Tools**: Global submission management, one-click ZIP download of student code.
-   **Containerization**: Fully Dockerized for easy deployment.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, JSZip |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, Alembic |
| **Worker** | Celery, Redis, IOI Isolate Sandbox |
| **Database** | PostgreSQL 15 |
| **DevOps** | Docker, Docker Compose |

## 📂 Project Structure

```
CK-Judge2/
├── docker-compose.yml       # Root orchestration file
├── online-judge-backend/    # Python Backend Source
│   ├── app/                 # Application logic (API, Models, CRUD)
│   ├── alembic/             # Database migrations
│   ├── Dockerfile           # Backend container definition
│   └── requirements.txt     # Python dependencies
└── online-judge-frontend/   # React Frontend Source
    ├── src/                 # Source code (Components, Pages, API)
    ├── Dockerfile           # Frontend container definition
    └── nginx.conf           # Nginx configuration for SPA
```

## 🏁 Getting Started (Setup Guide)

Follow these steps to deploy CK-Judge2 on a Linux server.

### Prerequisites

-   A Linux machine with a kernel supporting Cgroups v1 (or Docker configured correctly).
-   [Docker](https://www.docker.com/) and `docker-compose` installed.
-   If you intend to expose this to the public internet, ensure port `8000` (Backend) and `3000` (Frontend) are accessible, or set up a reverse proxy like Cloudflared/Nginx.

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/CK-Judge2.git
cd CK-Judge2
```

### 2. Configure Environment Variables

Create a `.env` file from the provided example:

```bash
cp .env_example .env
```

Open `.env` and configure your settings. Pay special attention to:
- `VITE_API_URL`: Set this to your external backend URL (e.g., `https://api.yourdomain.com/api/v1` or `http://<your-server-ip>:8000/api/v1`).
- `BACKEND_CORS_ORIGINS`: Set this to your external frontend URL so the backend allows requests from it.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Database credentials.
- `SECRET_KEY`: A strong random string for JWT authentication.

### 3. Build and Start the Containers

CK-Judge2 relies on a custom-compiled Isolate engine inside the `worker` container. Start the entire stack in detached mode:

```bash
docker-compose up -d --build
```

Wait a few moments for the database to spin up and the backend API to initialize.

### 4. Setup Initial Superuser (Admin)

To manage problems and view all submissions, you need an admin account. 
Run the provided script to generate the initial superuser:

```bash
bash get_superuser.sh
```

Follow the prompts to enter an email (username) and a password. This account will have full `is_superuser` privileges.

### 5. Access the Application

-   **Frontend UI**: `http://<your-server-ip>:3000`
-   **Backend API Docs**: `http://<your-server-ip>:8000/docs`

Log in using the superuser credentials you just created.

---

## 🔧 Troubleshooting & Common Issues

-   **CORS Issues**: If the frontend cannot communicate with the backend (`Network Error`), ensure your `.env` file's `BACKEND_CORS_ORIGINS` correctly lists the exact Origin the frontend is served from (including `http://` or `https://`). Restart the backend after changing `.env`: `docker-compose restart backend`.
-   **Submission Stuck on Pending / System Error**: 
    - Check the worker logs: `docker logs ck-judge2-worker-1`
    - Ensure the worker container started with `privileged: true` in `docker-compose.yml`, which is required for `Isolate` to mount cgroups.
-   **Database Migrations**: If tables are missing or schema is outdated:
    ```bash
    docker exec -it ck-judge2-backend-1 alembic upgrade head
    ```


