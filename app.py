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
    dues_paid_amount = db.Column(db.Float, default=0.0) # Track exact SchoolCashOnline payment total
    paperwork_complete = db.Column(db.Boolean, default=False)
    
    # Uniform Tracking
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
    radius_feet = db.Column(db.Float, default=150.0)
    is_active = db.Column(db.Boolean, default=True)

class AttendanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    student_id = db.Column(db.String(20), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    check_in_time = db.Column(db.String(50), nullable=False)
    distance_feet = db.Column(db.Float, nullable=False)

# FINANCIAL BUDGET TRANSACTIONS MODEL
class FinancialTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trans_date = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    trans_type = db.Column(db.String(20), nullable=False) # 'income' or 'expense'
    amount = db.Column(db.Float, nullable=False)
    school_year = db.Column(db.String(20), default='2026-2027')

# Initialize DB
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

    if Ensemble.query.count() == 0:
        defaults = ['Treble Chorus', 'Titan Singers', 'Titan Voices', 'Master Singers', 'Bella Voce', 'Olympian Voices']
        for name in defaults:
            db.session.add(Ensemble(name=name))
    db.session.commit()

def calculate_distance_feet(lat1, lon1, lat2, lon2):
    R_feet = 20902231.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R_feet * c

@app.route('/')
def root_status():
    return jsonify({"status": "Online", "program": "Olympia High School Titan Chorus Hub"})

@app.route('/api/login', methods=['POST'])
def user_login():
    data = request.get_json() or {}
    user = User.query.filter_by(student_id=data.get('student_id')).first()
    if user and check_password_hash(user.password_hash, data.get('password', '')):
        student_obj = Student.query.filter_by(student_id=user.student_id).first()
        paid_amt = student_obj.dues_paid_amount if student_obj else 0.0
        return jsonify({
            "success": True,
            "role": user.role,
            "name": user.name,
            "student_id": user.student_id,
            "ensemble": user.ensemble or 'Treble Chorus',
            "voice_part": user.voice_part or 'Soprano',
            "dues_paid_amount": paid_amt
        })
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([{
        "id": s.id,
        "student_id": s.student_id,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "ensemble": s.ensemble,
        "voice_part": s.voice_part,
        "height_inches": s.height_inches or 65,
        "wenger_section": s.wenger_section or 'Riser A',
        "wenger_row": s.wenger_row or 'Row 1',
        "wenger_slot": s.wenger_slot or 'Far Left',
        "dues_paid_amount": s.dues_paid_amount or 0.0
    } for s in students])

@app.route('/api/students/payment', methods=['POST'])
def update_student_payment():
    data = request.get_json() or {}
    student = Student.query.filter_by(student_id=data.get('student_id')).first()
    if student:
        student.dues_paid_amount = float(data.get('amount', 0.0))
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

@app.route('/api/budget', methods=['GET'])
def get_budget_transactions():
    trans = FinancialTransaction.query.order_by(FinancialTransaction.id.desc()).all()
    return jsonify([{
        "id": t.id,
        "trans_date": t.trans_date,
        "category": t.category,
        "description": t.description,
        "trans_type": t.trans_type,
        "amount": t.amount,
        "school_year": t.school_year
    } for t in trans])

@app.route('/api/budget', methods=['POST'])
def add_budget_transaction():
    data = request.get_json() or {}
    new_t = FinancialTransaction(
        trans_date=data.get('trans_date', datetime.now().strftime("%Y-%m-%d")),
        category=data.get('category', 'General Expense'),
        description=data.get('description', ''),
        trans_type=data.get('trans_type', 'expense'),
        amount=float(data.get('amount', 0.0)),
        school_year=data.get('school_year', '2026-2027')
    )
    db.session.add(new_t)
    db.session.commit()
    return jsonify({"success": True})

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
        "radius_feet": e.radius_feet
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
        radius_feet=float(data.get('radius_feet', 150.0))
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/attendance/checkin', methods=['POST'])
def student_checkin():
    data = request.get_json() or {}
    event = Event.query.get(data.get('event_id'))
    if not event:
        return jsonify({"success": False, "message": "Event not found."}), 404

    dist_feet = calculate_distance_feet(float(data.get('latitude', 0.0)), float(data.get('longitude', 0.0)), event.latitude, event.longitude)
    if dist_feet > event.radius_feet:
        return jsonify({"success": False, "message": f"Check-In Blocked: You are {int(dist_feet)} ft away from venue. Must be within {int(event.radius_feet)} ft."}), 400

    now_str = datetime.now().strftime("%I:%M:%S %p (%m/%d/%Y)")
    rec = AttendanceRecord(
        event_id=event.id,
        student_id=data.get('student_id'),
        student_name=data.get('student_name'),
        check_in_time=now_str,
        distance_feet=round(dist_feet, 1)
    )
    db.session.add(rec)
    db.session.commit()
    return jsonify({"success": True, "message": f"✓ Check-In Successful at {now_str}! ({int(dist_feet)} ft from venue)"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
