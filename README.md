# My DIT Planner

My DIT Planner is a full-stack web application designed to help students of the Department of Informatics and Telecommunications (DIT) at the University of Athens to track their academic progress and plan their studies effectively.

## Features

-   **Interactive Dashboard**: Get a quick overview of your academic progress, including completed ECTS, average grade, and course statistics.
-   **Comprehensive Course Catalog**: Browse, search, and filter all available courses. The search supports both Greek and Greeklish.
-   **Status & Grade Management**: Easily update the status of each course (e.g., Passed, Failed, Planned) and record your grades.
-   **Drag & Drop Semester Planning**: Visually organize your courses into semesters to plan your academic journey.
-   **Responsive Design**: Fully usable on both desktop and mobile devices.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, dnd-kit
- **Backend**: Python, FastAPI, SQLite
- **Containerization**: Docker, Docker Compose, Nginx

## Getting Started

To run this project locally, you need to have Docker and Docker Compose installed.

1.  **Clone the repository:**
```sh
git clone <repository-url>
cd my-dit-planner
```

2.  **Build and run the containers:**
```sh
docker-compose up --build
```

3.  **Access the application:**
    Open your web browser and navigate to `http://localhost:5173`. The backend API will be available at `http://localhost:8000`.

## Project Structure

```
.
├── backend/         # FastAPI application
│   ├── database.py  # SQLite database setup and queries
│   ├── server.py    # API endpoints
│   └── Dockerfile
│
├── frontend/        # React application
│   ├── src/
│   │   ├── pages/   # Main pages for the app
│   │   └── components/ # Reusable UI components
│   └── Dockerfile
│
└── docker-compose.yml # Docker Compose configuration
```

## Installation and Setup
1. Clone the repository:
```bash
git clone
```
2. Navigate to the project directory:
```bash
cd my-dit-planner
```
3. Install dependencies:
To build the whole app simply run:
```bash
docker-compose up --build
```

This will build both the frontend and backend Docker images and start the services.
   
4. Access the application:
Open your web browser and navigate to `http://localhost:5173` for the frontend. The backend API will be available at `http://localhost:8000`.

## Cleaning Up

### Stop Services
To stop the backend services while preserving data:
```bash
sudo docker-compose down
```

### Complete Cleanup
To stop the frontend and backend services and remove all volumes and images (⚠️ **This will delete all the containers**):
```bash
sudo docker-compose down -v --rmi all
```

## To-Do List
- [ ] aranal, ct and usvd as compolsory if someone chooses CS direction
- [ ] plan only for semesters a course can be added
- [ ] eleuthera
- [ ] add disertation and internship, not in db ideally, but as a choice in main page(?)
- [ ] also add direction as a choice in main page
- [ ] make the planning stay, so add that to the backend
- [ ] add feature so it colors the the semesters that a course can be added during planning