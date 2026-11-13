# MEMORA

### Memory, with a history.

Memora is an experimental memory system exploring a simple idea: **AI memory should be inspectable, editable, and reversible.**

Instead of treating memory as an invisible layer behind an AI conversation, Memora gives it structure — individual memories, version history, and a record of how they change over time.

<br>

<p align="center">
  <img src="https://img.shields.io/badge/status-in%20development-9b8cff?style=flat-square" />
  <img src="https://img.shields.io/badge/backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/ORM-SQLAlchemy-D71F00?style=flat-square" />
  <img src="https://img.shields.io/badge/migrations-Alembic-6B8E23?style=flat-square" />
</p>

---

## 01 — The idea

AI systems can remember information about people, but that memory is often difficult to inspect or control.

Memora explores a different approach.

- **Inspectable** — understand what the system remembers.
- **Editable** — change stored memories when they become inaccurate.
- **Versioned** — preserve previous states instead of silently overwriting them.
- **Reversible** — return to an earlier version.
- **Traceable** — keep a history of memory events.

The long-term direction is to connect these capabilities to an AI system whose behaviour can evolve through user-controlled memory.

## 02 — Current implementation

This project is actively being developed. The current foundation includes:

| Component | Status |
|---|---|
| FastAPI backend | Implemented |
| PostgreSQL integration | Implemented |
| User and memory models | Implemented |
| Memory CRUD endpoints | Implemented |
| Memory version history | Implemented |
| Memory update and revert | Implemented |
| Memory event tracking | Implemented |
| Alembic migrations | Implemented |
| Frontend interface | In development |
| AI-powered personality engine | Planned |

## 03 — Architecture

```text
                  MEMORA
                     │
          ┌──────────┴──────────┐
          │                     │
       Frontend              Backend
          │                     │
          │                  FastAPI
          │                     │
          │              ┌──────┴──────┐
          │              │             │
          │          Memory API    Event API
          │              │             │
          │              └──────┬──────┘
          │                     │
          │                 SQLAlchemy
          │                     │
          │                PostgreSQL
          │                     │
          │               Alembic
          │
      User Interface
```

The backend currently provides the foundation for storing memories, preserving versions, and recording memory-related events.

## 04 — Tech stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic

**Database**
- PostgreSQL

**Frontend**
- Interface development is ongoing.

## 05 — Getting started

### Prerequisites

Make sure you have:

- Python 3.10+
- PostgreSQL
- Git
- Node.js and npm (for frontend development)

### Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/memora-os.git
cd memora-os
```

### Set up the backend

Create and activate a virtual environment on Windows PowerShell:

```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

Configure your database connection in:

```text
backend/.env
```

Add your PostgreSQL connection string:

```env
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@localhost:5432/memora
```

Replace the placeholders with your local PostgreSQL credentials.

### Run database migrations

From the project root:

```powershell
alembic -c backend/alembic.ini upgrade head
```

### Start the backend

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Frontend setup instructions will be added once its package configuration and development workflow are finalized.

## 06 — Project structure

```text
memora-os/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── alembic.ini
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

*The structure above shows the backend's main areas; the complete repository may contain additional frontend and configuration files.*

## 07 — Development direction

The next stages of Memora are focused on:

1. Completing the memory and version APIs.
2. Connecting the frontend to live backend data.
3. Building a more detailed memory timeline.
4. Developing memory comparison and time-travel workflows.
5. Exploring AI integration and user-controlled personality evolution.

These are development goals, not claims of completed functionality.

## 08 — Project philosophy

> Memory should not be a black box.
>
> It should be something people can understand, question, change, and take back.

---

<p align="center">
  <strong>MEMORA</strong>
  <br>
  <sub>An experiment in giving AI memory a history.</sub>
</p>