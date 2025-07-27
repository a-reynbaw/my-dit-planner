from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import (
    get_sdi_with_id,
    get_direction_with_id,  
    update_direction,       
    init_database,
    get_all_courses,
    get_info_by_s_and_name,
    update_course_status,
    update_course_grade,
    update_course_planned_semester,
    get_courses_by_speciality,
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

@app.get("/api/health")
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
class DirectionUpdate(BaseModel):   # Add this model
    direction: str

# API Endpoints

@app.get("/api/courses")
def api_get_courses():
    try:
        courses = get_all_courses()
        return courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading courses: {str(e)}")
    
@app.get("/api/profile/sdi") 
def api_get_sdi():
    try:
        result = get_sdi_with_id(1)
        if result and len(result) > 0:
            return {"sdi": result[0][0]}
        else:
            raise HTTPException(status_code=404, detail="User profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading sdi: {str(e)}")

@app.get("/api/profile/direction")
def api_get_direction():
    try:
        result = get_direction_with_id(1)
        if result and len(result) > 0:
            direction = result[0][0]  # Extract the direction value
            return {"direction": direction}
        else:
            # Return null if no direction is set
            return {"direction": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading direction: {str(e)}")
    
@app.get("/api/specialities")
def api_get_speciality_names():
    speciality_names = {
        'S1': 'Αλγόριθμοι, Προγραμματισμός και Λογικής',
        'S2': 'Επιστήμη Δεδομένων και Μηχανική Μάθηση',
        'S3': 'Συστήματα Υπολογιστών και Λογισμικό',
        'S4': 'Τηλεπικοινωνίες και Δίκτυα',
        'S5': 'Ηλεκτρονική και Αρχιτεκτονική Υπολογιστών',
        'S6': 'Επεξεργασία Σήματος και Εικόνας'
    }
    return speciality_names

@app.get("/api/specialities/{s_id}")
def api_get_courses_by_speciality(s_id: str):
    """Get all courses for a specific speciality"""
    try:
        courses = get_courses_by_speciality(s_id)
        return courses
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting courses for speciality {s_id}: {str(e)}")

@app.get("/api/courses/{course_name}/speciality/{s_no}")
def api_get_course_speciality_info(course_name: str, s_no: str):
    """Get speciality information for a specific course"""
    try:
        result = get_info_by_s_and_name(s_no, course_name)
        if result and len(result) > 0:
            return {"course_name": course_name, "speciality": s_no, "value": result[0][0]}
        else:
            return {"course_name": course_name, "speciality": s_no, "value": None}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting speciality info: {str(e)}")


@app.put("/api/profile/direction")
def api_update_direction(update: DirectionUpdate):
    try:
        update_direction(1, update.direction)
        return {"message": "Direction updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating direction: {str(e)}")

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