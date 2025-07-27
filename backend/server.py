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
class DirectionUpdate(BaseModel):   # Add this model
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

@app.put("/api/profile/{field}")
def api_update_profile_field(field: str, update: ProfileFieldUpdate):
    """Update a specific profile field"""
    valid_fields = ['sdi', 'first_name', 'last_name', 'current_semester', 'direction']
    
    if field not in valid_fields:
        raise HTTPException(status_code=400, detail=f"Invalid field: {field}. Must be one of {valid_fields}")
    
    try:
        # Convert value to appropriate type
        value = update.value
        if field in ['sdi', 'current_semester']:
            try:
                value = int(value)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"{field} must be a number")
        
        update_profile_info_with_id(1, field, value)
        return {"message": f"Profile {field} updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile {field}: {str(e)}")


@app.get("/api/profile")
def api_get_full_profile():
    """Get complete profile information using database functions"""
    try:
        profile_id = 1  # Assuming single user
        
        # Use existing database functions
        sdi_result = get_sdi_with_id(profile_id)
        first_name_result = get_first_name_with_id(profile_id)
        last_name_result = get_last_name_with_id(profile_id)
        current_semester_result = get_current_semester_with_id(profile_id)
        direction_result = get_direction_with_id(profile_id)
        
        return {
            "id": profile_id,
            "sdi": sdi_result[0][0] if sdi_result and sdi_result[0][0] else None,
            "first_name": first_name_result[0][0] if first_name_result and first_name_result[0][0] else None,
            "last_name": last_name_result[0][0] if last_name_result and last_name_result[0][0] else None,
            "current_semester": current_semester_result[0][0] if current_semester_result and current_semester_result[0][0] else None,
            "direction": direction_result[0][0] if direction_result and direction_result[0][0] else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/api/profile")
def api_update_full_profile(profile: FullProfileUpdate):
    """Update multiple profile fields using database functions"""
    try:
        profile_id = 1  # Assuming single user
        
        # Update each field that's provided using the database function
        if profile.sdi is not None:
            update_profile_info_with_id(profile_id, 'sdi', profile.sdi)
        if profile.first_name is not None:
            update_profile_info_with_id(profile_id, 'first_name', profile.first_name)
        if profile.last_name is not None:
            update_profile_info_with_id(profile_id, 'last_name', profile.last_name)
        if profile.current_semester is not None:
            update_profile_info_with_id(profile_id, 'current_semester', profile.current_semester)
        if profile.direction is not None:
            update_profile_info_with_id(profile_id, 'direction', profile.direction)
        
        # Return updated profile using the GET endpoint logic
        return api_get_full_profile()
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Keep the individual field endpoints as they already use database functions correctly:
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

@app.put("/api/profile/{field}")
def api_update_profile_field(field: str, update: ProfileFieldUpdate):
    """Update a specific profile field using database function"""
    valid_fields = ['sdi', 'first_name', 'last_name', 'current_semester', 'direction']
    
    if field not in valid_fields:
        raise HTTPException(status_code=400, detail=f"Invalid field: {field}. Must be one of {valid_fields}")
    
    try:
        # Convert value to appropriate type
        value = update.value
        if field in ['sdi', 'current_semester']:
            try:
                value = int(value)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"{field} must be a number")
        
        # Use the database function
        update_profile_info_with_id(1, field, value)
        return {"message": f"Profile {field} updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile {field}: {str(e)}")