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
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```bash
    cd my-dit-planner
    ```
3. Build and run the backend server:

    Move to the backend directory and just run the command:
    ```bash
    ./run.sh
    ```

    This will install the needed requirements and run the backend server in a virtual enviroment.

4. Run frontend

    In a new terminal, run the following commands
    ```bash
    cd my-dit-planner/frontend
    npm i
    npm run dev
    ```
   
5. Access the application:
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
- [X] add two tests to the backend for getting and updating the direction
- [X] re-make the main page to make more sense given the current features
- [X] add specialty progress to the requirements
- [X] potential (one) new page: profile/info/setting/stats etc
- [ ] links for usefull resources like delos, dit page, eclass, dit lab
- [X] add free courses
- [X] make the direction selection box a little wider (Degree Requirements)
- [X] add endpoints for S1,...,S6
- [ ] look for prerequisets h opws sto diaolo legontai