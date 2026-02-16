# CK-Judge2 (NCKU CSIE PD2 Online Judge)

A modern, full-stack Online Judge system designed for algorithmic problem solving and contest management.

## 🚀 Features

-   **Frontend**: Sci-Fi themed UI built with React 19, TypeScript, Vite, and Tailwind CSS v4.
-   **Backend**: High-performance REST API built with Python, FastAPI, and Pydantic.
-   **Database**: PostgreSQL for persistent storage.
-   **Task Queue**: Celery + Redis for asynchronous background tasks (e.g., judging submissions).
-   **Contest Module**: Full support for creating and managing contests with real-time scoring.
-   **Containerization**: Fully Dockerized for easy deployment.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, Alembic |
| **Database** | PostgreSQL 15 |
| **Cache/Queue** | Redis 7 |
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

## 🏁 Getting Started

### Prerequisites

-   [Docker](https://www.docker.com/) installed on your machine.
-   [Docker Compose](https://docs.docker.com/compose/) (included with Docker Desktop).

### Installation & Running

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/CK-Judge2.git
    cd CK-Judge2
    ```

2.  **Start the application**:
    Run the following command in the root directory:
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the application**:
    -   **Frontend**: [http://localhost:3000](http://localhost:3000)
    -   **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Default Credentials

The system is configured with a default superuser for development:

-   **Username**: `admin@example.com`
-   **Password**: *(Generated dynamically via API or set in env. If you need to reset, check `api/v1/auth/reset-superuser`)*
-   **Admin Key**: `change_this_to_a_secure_random_key` (Used to reset superuser password)

## 🔧 Troubleshooting

-   **CORS Issues**: Ensure your backend `config.py` allows the frontend origin. By default, `http://localhost:3000` and `http://127.0.0.1:3000` are allowed.
-   **Database Migrations**: If the database tables are missing, run:
    ```bash
    docker-compose exec backend alembic upgrade head
    ```

## 📜 License

NCKU CSIE PD2
