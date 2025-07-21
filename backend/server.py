from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import (
    get_sdi_with_id,
    init_database,
    get_all_courses,
    # get_degree_requirements,
    update_course_status,
    update_course_grade,
    update_course_planned_semester, # Make sure to import the new function
    DATABASE_PATH
)
import os

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
# Initialize the database on startup if it doesn't exist
def startup_event():
    if not os.path.exists(DATABASE_PATH):
        init_database()
        print("Database initialized successfully")
    else:
        print("Database already exists, skipping initialization")

# Models
class CourseGradeUpdate(BaseModel):
    grade: float
class CourseStatusUpdate(BaseModel):
    status: str
class CoursePlannedSemesterUpdate(BaseModel):
    planned_semester: int


# API Endpoints

@app.get("/api/courses")
def api_get_courses():
    try:
        courses = get_all_courses()
        return courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading courses: {str(e)}")
    
@app.get("/api/profile")
def api_get_sdi():
    try:
        sdi = get_sdi_with_id(0)
        return sdi
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading sdi: {str(e)}")

@app.put("/api/courses/{course_id}/status")
def api_update_course_status(course_id: int, update: CourseStatusUpdate):
    try:
        update_course_status(course_id, update.status)
        if update.status == 'Not Taken':
            update_course_grade(course_id, None)  # Reset grade if status is 'Not Taken'
        return {"message": "Status updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating course status: {str(e)}")

@app.put("/api/courses/{course_id}/grade")
def api_update_course_grade(course_id: int, update: CourseGradeUpdate):
    try:
        update_course_grade(course_id, update.grade)
        return {"message": "Grade updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating course status: {str(e)}")

@app.put("/api/courses/{course_id}/planned_semester")
def api_update_course_planned_semester(course_id: int, update: CoursePlannedSemesterUpdate):
    try:
        update_course_planned_semester(course_id, update.planned_semester)
        return {"message": "Planned semester updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating course planned semester: {str(e)}")


# @app.get("/api/requirements")
# def api_get_requirements():
#     try:
#         requirements = get_degree_requirements()
#         return requirements
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error loading requirements: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)