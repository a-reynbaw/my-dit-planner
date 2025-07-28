from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import (
    get_sdi_with_id,
    get_first_name_with_id,      # Add this
    get_last_name_with_id,       # Add this
    get_current_semester_with_id, # Add this
    get_direction_with_id,  
    update_direction,
    update_profile_info_with_id,  # Add this
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
class SdiUpdate(BaseModel):
    direction: int
class FirstnameUpdate(BaseModel):
    direction: str
class LastnameUpdate(BaseModel):
    direction: str
class CurrentSemesterUpdate(BaseModel):
    direction: int
class DirectionUpdate(BaseModel):
    direction: str
class ProfileFieldUpdate(BaseModel):
    value: str  # Generic value for any profile field

class FullProfileUpdate(BaseModel):
    sdi: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    current_semester: Optional[int] = None
    direction: Optional[str] = None

# API Endpoints
######### GET ENDPOINTS #########
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
   
@app.get("/api/profile/first_name") 
def api_get_first_name():
    try:
        result = get_first_name_with_id(1)
        if result and len(result) > 0:
            return {"first_name": result[0][0]}
        else:
            return {"first_name": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading first name: {str(e)}")

@app.get("/api/profile/last_name") 
def api_get_last_name():
    try:
        result = get_last_name_with_id(1)
        if result and len(result) > 0:
            return {"last_name": result[0][0]}
        else:
            return {"last_name": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading last name: {str(e)}")

@app.get("/api/profile/current_semester") 
def api_get_current_semester():
    try:
        result = get_current_semester_with_id(1)
        if result and len(result) > 0:
            return {"current_semester": result[0][0]}
        else:
            return {"current_semester": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading current semester: {str(e)}")

@app.get("/api/profile/direction")
def api_get_direction():
    try:
        result = get_direction_with_id(1)
        if result and len(result) > 0:
            direction = result[0][0] 
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

######### PUT ENDPOINTS #########
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

@app.put("/api/profile/sdi")
def api_update_sdi_with_id(update: SdiUpdate):
    try:
        update_sdi_with_id(1, update.sdi)
        return {"message": "SDI updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating sdi: {str(e)}")

@app.put("/api/profile/first_name")
def api_update_first_name_with_id(update: FirstnameUpdate):
    try:
        update_first_name_with_id(1, update.first_name)
        return {"message": "Firstname updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating firstname: {str(e)}")

@app.put("/api/profile/last_name")
def api_update_last_name_with_id(update: LastnameUpdate):
    try:
        update_last_name_with_id(1, update.last_name)
        return {"message": "Lastname updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating lastname: {str(e)}")

@app.put("/api/profile/current_semester")
def api_update_current_semester_with_id(update: CurrentSemesterUpdate):
    try:
        update_current_semester_with_id(1, update.current_semester)
        return {"message": "Current course updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating current course: {str(e)}")

@app.put("/api/profile/direction")
def api_update_direction_with_id(update: DirectionUpdate):
    try:
        update_direction(1, update.direction)
        return {"message": "Direction updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating direction: {str(e)}")
