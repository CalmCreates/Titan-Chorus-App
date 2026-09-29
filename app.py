import os
import math
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure Database
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///titan_chorus.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='student')
    ensemble = db.Column(db.String(100), nullable=True)
    voice_part = db.Column(db.String(20), nullable=True)

class Ensemble(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    ensemble = db.Column(db.String(100), nullable=False)
    additional_ensembles = db.Column(db.String(200), nullable=True, default='')
    voice_part = db.Column(db.String(20), nullable=False)
    height_inches = db.Column(db.Integer, nullable=True, default=65)
    wenger_section = db.Column(db.String(20), nullable=True, default='Riser A')
    wenger_row = db.Column(db.String(20), nullable=True, default='Row 1')
    wenger_slot = db.Column(db.String(20), nullable=True, default='Far Left')
    dues_paid = db.Column(db.Boolean, default=False)
    paperwork_complete = db.Column(db.Boolean, default=False)
    
    # Uniform Assignment Tracking
    uniform_tshirt = db.Column(db.Boolean, default=False)
    uniform_tshirt_size = db.Column(db.String(10), nullable=True, default='M')
    uniform_polo = db.Column(db.Boolean, default=False)
    uniform_polo_size = db.Column(db.String(10), nullable=True, default='M')
    uniform_dress = db.Column(db.Boolean, default=False)
    uniform_jacket = db.Column(db.Boolean, default=False)
    uniform_silver_tie = db.Column(db.Boolean, default=False)
    uniform_teal_tie = db.Column(db.Boolean, default=False)
    uniform_red_tie = db.Column(db.Boolean, default=False)
    uniform_white_tie = db.Column(db.Boolean, default=False)
    uniform_backpack = db.Column(db.Boolean, default=False)
    uniform_other = db.Column(db.String(100), nullable=True, default='')
    uniform_other_checked = db.Column(db.Boolean, default=False)

class SheetMusic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    composer = db.Column(db.String(100), nullable=True)
    concert_folder = db.Column(db.String(100), nullable=False, default='General')
    pdf_data = db.Column(db.Text, nullable=False)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    location_name = db.Column(db.String(150), nullable=False)
    event_date = db.Column(db.String(50), nullable=False)
    call_time = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    radius_feet = db.Column(db.Float, default=150.0) # Proximity limit (feet)
    is_active = db.Column(db.Boolean, default=True)

class AttendanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    student_id = db.Column(db.String(20), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    check_in_time = db.Column(db.String(50), nullable=False)
    distance_feet = db.Column(db.Float, nullable=False)

# Safe Database Initialization
with app.app_context():
    db.create_all()
    admin = User.query.filter_by(student_id='ADMIN').first()
    if not admin:
        admin = User(
            student_id='ADMIN',
            name='Cesar Lengua-Miranda',
            password_hash=generate_password_hash('titan2026'),
            role='director'
        )
        db.session.add(admin)
    else:
        admin.name = 'Cesar Lengua-Miranda'

    if Ensemble.query.count() == 0:
        defaults = ['Concert Chorus', 'Bel Canto', 'Titan A Cappella', 'Treble Chorus']
        for name in defaults:
            db.session.add(Ensemble(name=name))
    db.session.commit()

# Helper: Calculate distance in feet between two GPS coordinates (Haversine formula)
def calculate_distance_feet(lat1, lon1, lat2, lon2):
    R_feet = 20902231.0 # Radius of Earth in feet
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R_feet * c

# Official 50 FVA Terms Dataset
FVA_TERMS_FULL = [
    {"num": 1, "term": "Anacrusis", "definition": "upbeat or pickup", "category": "Music Terms"},
    {"num": 2, "term": "Arpeggio", "definition": "the notes of the chord played in succession to one another, rather than simultaneously; a broken chord", "category": "Music Terms"},
    {"num": 3, "term": "Chromatic", "definition": "motion by half steps; also describes harmony or melody that employs some of the sequential 12 pitches in an octave", "category": "Music Terms"},
    {"num": 4, "term": "Descant", "definition": "a high obligato part above the melody", "category": "Music Terms"},
    {"num": 5, "term": "Divisi", "definition": "performers singing the same part are divided to sing different parts.", "category": "Music Terms"},
    {"num": 6, "term": "Falsetto", "definition": "type of vocal phonation that enables the singer to sing notes beyond the normal vocal range.", "category": "Music Terms"},
    {"num": 7, "term": "Fermata", "definition": "a pause or hold", "category": "Music Terms"},
    {"num": 8, "term": "Improvisation", "definition": "music that is created spontaneously", "category": "Music Terms"},
    {"num": 9, "term": "Interval", "definition": "the relationship between two pitches, the distance between an upper and a lower pitch", "category": "Music Terms"},
    {"num": 10, "term": "Ledger lines", "definition": "short horizontal lines used to extend a staff either higher or lower", "category": "Music Terms"},
    {"num": 11, "term": "Mezzo forte", "definition": "medium loud", "category": "Music Terms"},
    {"num": 12, "term": "Modulation", "definition": "to change key within a composition", "category": "Music Terms"},
    {"num": 13, "term": "Opera", "definition": "a major vocal work that involves theatrical elements", "category": "Music Terms"},
    {"num": 14, "term": "Oratorio", "definition": "large scale musical composition on a sacred subject.", "category": "Music Terms"},
    {"num": 15, "term": "Senza", "definition": "without", "category": "Music Terms"},
    {"num": 16, "term": "Solfege", "definition": "a system used for teaching sight-reading (Do-Re-Mi)", "category": "Music Terms"},
    {"num": 17, "term": "Tessitura", "definition": "most widely used range of pitches in a piece of music", "category": "Music Terms"},
    {"num": 18, "term": "Triad", "definition": "three note chord consisting of the root, third, and fifth", "category": "Music Terms"},
    {"num": 19, "term": "Vibrato", "definition": "a rapid fluctuation of pitch slightly higher or lower than the main pitch", "category": "Music Terms"},
    {"num": 20, "term": "Form", "definition": "the organization and structure of a composition", "category": "Form"},
    {"num": 21, "term": "Binary form", "definition": "AB- form of a composition that has two distinct sections", "category": "Form"},
    {"num": 22, "term": "Strophic", "definition": "describes a song where the stanzas are all sung to the same music", "category": "Form"},
    {"num": 23, "term": "Part song", "definition": "an unaccompanied homophonic choral composition for three or more voices", "category": "Form"},
    {"num": 24, "term": "D. C. or Da Capo", "definition": "repeat from the beginning of the composition", "category": "Form"},
    {"num": 25, "term": "Bel canto", "definition": "“beautiful singing”; an Italian Opera term", "category": "Style and Phrasing"},
    {"num": 26, "term": "Cantabile", "definition": "in a singing style; singable", "category": "Style and Phrasing"},
    {"num": 27, "term": "Dolce", "definition": "sweetly, usually also softly", "category": "Style and Phrasing"},
    {"num": 28, "term": "Espressivo", "definition": "to play or sing with expression", "category": "Style and Phrasing"},
    {"num": 29, "term": "Legato", "definition": "to play or sing in a smooth, connected manner", "category": "Style and Phrasing"},
    {"num": 30, "term": "Meno mosso", "definition": "less motion", "category": "Style and Phrasing"},
    {"num": 31, "term": "Motif", "definition": "a short musical idea or melodic theme, usually shorter than a musical phrase", "category": "Style and Phrasing"},
    {"num": 32, "term": "Niente", "definition": "dying away to nothing", "category": "Style and Phrasing"},
    {"num": 33, "term": "Poco piu mosso", "definition": "a little more motion", "category": "Style and Phrasing"},
    {"num": 34, "term": "Sforzando", "definition": "strongly accented; forced", "category": "Style and Phrasing"},
    {"num": 35, "term": "Sotto voce", "definition": "Softly; with subdued sound; performed in an undertone", "category": "Style and Phrasing"},
    {"num": 36, "term": "Subito", "definition": "suddenly; quickly", "category": "Style and Phrasing"},
    {"num": 37, "term": "A tempo", "definition": "return to the original tempo after some deviation", "category": "Tempo and Meter"},
    {"num": 38, "term": "Accelerando", "definition": "becoming gradually faster", "category": "Tempo and Meter"},
    {"num": 39, "term": "Allargando", "definition": "slowing of tempo, usually with increasing volume; most frequently occurs toward the end of a piece", "category": "Tempo and Meter"},
    {"num": 40, "term": "Allegro con spirito", "definition": "fast tempo with spirit", "category": "Tempo and Meter"},
    {"num": 41, "term": "Andante", "definition": "rather slow, at a moderate walking speed", "category": "Tempo and Meter"},
    {"num": 42, "term": "Grandioso", "definition": "grand, majestic", "category": "Tempo and Meter"},
    {"num": 43, "term": "Largo", "definition": "very slow and broad", "category": "Tempo and Meter"},
    {"num": 44, "term": "L’istesso", "definition": "the beat remains constant when the meter changes", "category": "Tempo and Meter"},
    {"num": 45, "term": "Meter", "definition": "indicated by a time signature, can be simple or compound", "category": "Tempo and Meter"},
    {"num": 46, "term": "Presto", "definition": "very fast; faster than allegro", "category": "Tempo and Meter"},
    {"num": 47, "term": "Rallentando", "definition": "gradually slowing down", "category": "Tempo and Meter"},
    {"num": 48, "term": "Rubato", "definition": "Making the established pulse flexible by accelerating and slowing down the tempo; an expressive device", "category": "Tempo and Meter"},
    {"num": 49, "term": "Tranquillo", "definition": "to perform in a relaxed tempo", "category": "Tempo and Meter"},
    {"num": 50, "term": "Vivace", "definition": "lively; briskly", "category": "Tempo and Meter"}
]

# API Endpoints
@app.route('/')
def root_status():
    return jsonify({
        "status": "Online",
        "program": "Olympia High School Titan Chorus Hub",
        "director": "Cesar Lengua-Miranda",
        "motto": "We Strive to Touch Lives!"
    })

@app.route('/api/login', methods=['POST'])
def user_login():
    data = request.get_json() or {}
    user = User.query.filter_by(student_id=data.get('student_id')).first()
    if user and check_password_hash(user.password_hash, data.get('password', '')):
        return jsonify({
            "success": True,
            "role": user.role,
            "name": user.name,
            "student_id": user.student_id,
            "ensemble": user.ensemble or 'General',
            "voice_part": user.voice_part or 'Unassigned'
        })
    return jsonify({"success": False, "message": "Invalid Student ID or Password"}), 401

@app.route('/api/ensembles', methods=['GET'])
def get_ensembles():
    items = Ensemble.query.all()
    return jsonify([e.name for e in items])

@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([{
        "id": s.id,
        "student_id": s.student_id,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "ensemble": s.ensemble,
        "additional_ensembles": s.additional_ensembles or '',
        "voice_part": s.voice_part,
        "height_inches": s.height_inches or 65,
        "wenger_section": s.wenger_section or 'Riser A',
        "wenger_row": s.wenger_row or 'Row 1',
        "wenger_slot": s.wenger_slot or 'Far Left',
        "dues_paid": s.dues_paid,
        "paperwork_complete": s.paperwork_complete,
        "uniform_tshirt": s.uniform_tshirt,
        "uniform_tshirt_size": s.uniform_tshirt_size or 'M',
        "uniform_polo": s.uniform_polo,
        "uniform_polo_size": s.uniform_polo_size or 'M',
        "uniform_dress": s.uniform_dress,
        "uniform_jacket": s.uniform_jacket,
        "uniform_silver_tie": s.uniform_silver_tie,
        "uniform_teal_tie": s.uniform_teal_tie,
        "uniform_red_tie": s.uniform_red_tie,
        "uniform_white_tie": s.uniform_white_tie,
        "uniform_backpack": s.uniform_backpack,
        "uniform_other": s.uniform_other or '',
        "uniform_other_checked": s.uniform_other_checked
    } for s in students])

@app.route('/api/students/uniform', methods=['POST'])
def update_student_uniform():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    student = Student.query.filter_by(student_id=student_id).first()
    
    if student:
        student.uniform_tshirt = data.get('uniform_tshirt', student.uniform_tshirt)
        student.uniform_tshirt_size = data.get('uniform_tshirt_size', student.uniform_tshirt_size)
        student.uniform_polo = data.get('uniform_polo', student.uniform_polo)
        student.uniform_polo_size = data.get('uniform_polo_size', student.uniform_polo_size)
        student.uniform_dress = data.get('uniform_dress', student.uniform_dress)
        student.uniform_jacket = data.get('uniform_jacket', student.uniform_jacket)
        student.uniform_silver_tie = data.get('uniform_silver_tie', student.uniform_silver_tie)
        student.uniform_teal_tie = data.get('uniform_teal_tie', student.uniform_teal_tie)
        student.uniform_red_tie = data.get('uniform_red_tie', student.uniform_red_tie)
        student.uniform_white_tie = data.get('uniform_white_tie', student.uniform_white_tie)
        student.uniform_backpack = data.get('uniform_backpack', student.uniform_backpack)
        student.uniform_other = data.get('uniform_other', student.uniform_other)
        student.uniform_other_checked = data.get('uniform_other_checked', student.uniform_other_checked)
        
        db.session.commit()
        return jsonify({"success": True, "message": "Uniform checklist updated."})
    return jsonify({"success": False, "message": "Student record not found."}), 404

# EVENT & GPS ATTENDANCE ENDPOINTS
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{
        "id": e.id,
        "title": e.title,
        "location_name": e.location_name,
        "event_date": e.event_date,
        "call_time": e.call_time,
        "latitude": e.latitude,
        "longitude": e.longitude,
        "radius_feet": e.radius_feet,
        "is_active": e.is_active
    } for e in events])

@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.get_json() or {}
    new_event = Event(
        title=data.get('title'),
        location_name=data.get('location_name'),
        event_date=data.get('event_date'),
        call_time=data.get('call_time'),
        latitude=float(data.get('latitude', 0.0)),
        longitude=float(data.get('longitude', 0.0)),
        radius_feet=float(data.get('radius_feet', 150.0)),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"success": True, "message": "Event created successfully."})

@app.route('/api/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.get(id)
    if event:
        AttendanceRecord.query.filter_by(event_id=id).delete()
        db.session.delete(event)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

@app.route('/api/attendance/checkin', methods=['POST'])
def student_checkin():
    data = request.get_json() or {}
    event_id = data.get('event_id')
    student_id = data.get('student_id')
    student_name = data.get('student_name')
    user_lat = float(data.get('latitude', 0.0))
    user_lon = float(data.get('longitude', 0.0))

    event = Event.query.get(event_id)
    if not event or not event.is_active:
        return jsonify({"success": False, "message": "This event is no longer active for check-in."}), 400

    # Calculate distance to venue in feet
    dist_feet = calculate_distance_feet(user_lat, user_lon, event.latitude, event.longitude)

    if dist_feet > event.radius_feet:
        return jsonify({
            "success": False,
            "message": f"Check-In Blocked: You are {int(dist_feet)} ft away from venue. Must be within {int(event.radius_feet)} ft to check in."
        }), 400

    # Check if already checked in
    existing = AttendanceRecord.query.filter_by(event_id=event_id, student_id=student_id).first()
    if existing:
        return jsonify({"success": True, "message": f"Already checked in at {existing.check_in_time}."})

    now_str = datetime.now().strftime("%I:%M:%S %p (%m/%d/%Y)")
    rec = AttendanceRecord(
        event_id=event_id,
        student_id=student_id,
        student_name=student_name,
        check_in_time=now_str,
        distance_feet=round(dist_feet, 1)
    )
    db.session.add(rec)
    db.session.commit()

    return jsonify({"success": True, "message": f"✓ Check-In Successful at {now_str}! ({int(dist_feet)} ft from venue)"})

@app.route('/api/attendance/report/<int:event_id>', methods=['GET'])
def get_attendance_report(event_id):
    records = AttendanceRecord.query.filter_by(event_id=event_id).all()
    return jsonify([{
        "student_id": r.student_id,
        "student_name": r.student_name,
        "check_in_time": r.check_in_time,
        "distance_feet": r.distance_feet
    } for r in records])

@app.route('/api/attendance/export/<int:event_id>', methods=['GET'])
def export_attendance_csv(event_id):
    event = Event.query.get(event_id)
    records = AttendanceRecord.query.filter_by(event_id=event_id).all()
    
    csv_output = "Student ID,Student Name,Check-In Timestamp,Distance from Venue (ft)\n"
    for r in records:
        csv_output += f'"{r.student_id}","{r.student_name}","{r.check_in_time}","{r.distance_feet}"\n'
        
    return Response(
        csv_output,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename=Attendance_{event.title.replace(' ', '_')}.csv"}
    )

@app.route('/api/sheet-music', methods=['GET'])
def get_sheet_music():
    items = SheetMusic.query.all()
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "composer": m.composer or 'Unknown',
        "concert_folder": m.concert_folder,
        "pdf_data": m.pdf_data
    } for m in items])

@app.route('/api/fva-terms', methods=['GET'])
def get_fva_terms():
    return jsonify(FVA_TERMS_FULL)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
