import os
from flask import Flask, request, jsonify
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
    
    # Uniform Assignment Tracking (JSON String or individual flags)
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

# Safe Database Initialization
with app.app_context():
    db.create_all()
    
    # Create or Update Director Cesar Lengua-Miranda Account
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

# FVA Omnibus Terms Dataset
FVA_TERMS = [
    {"term": "A cappella", "definition": "Singing without instrumental accompaniment.", "category": "General Terms"},
    {"term": "Accelerando", "definition": "Gradually speeding up the tempo.", "category": "Tempo"},
    {"term": "Adagio", "definition": "Slow and stately tempo.", "category": "Tempo"},
    {"term": "Allegro", "definition": "Fast, lively, and bright tempo.", "category": "Tempo"},
    {"term": "Andante", "definition": "At a walking pace; moderately slow.", "category": "Tempo"},
    {"term": "Crescendo", "definition": "Gradually growing louder in volume.", "category": "Dynamics"},
    {"term": "Decrescendo / Diminuendo", "definition": "Gradually growing softer in volume.", "category": "Dynamics"},
    {"term": "Legato", "definition": "Smooth and connected singing or playing.", "category": "Articulation"},
    {"term": "Staccato", "definition": "Short, detached, and separated notes.", "category": "Articulation"},
    {"term": "Mezzo Forte (mf)", "definition": "Moderately loud.", "category": "Dynamics"},
    {"term": "Piano (p)", "definition": "Soft volume.", "category": "Dynamics"},
    {"term": "Forte (f)", "definition": "Loud volume.", "category": "Dynamics"},
    {"term": "Solfège", "definition": "System of pitch syllable designation (Do, Re, Mi, Fa, Sol, La, Ti).", "category": "Theory"},
    {"term": "Tessitura", "definition": "The most acceptable and comfortable vocal range for a given singer or part.", "category": "Vocal Mechanics"},
    {"term": "Timbre", "definition": "The distinct tone color or quality of a voice or instrument.", "category": "Vocal Mechanics"},
    {"term": "Subito", "definition": "Suddenly (e.g., subito piano - suddenly soft).", "category": "Expression"}
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

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json() or {}
    new_s = Student(
        student_id=data['student_id'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        ensemble=data['ensemble'],
        additional_ensembles=data.get('additional_ensembles', ''),
        voice_part=data['voice_part'],
        height_inches=int(data.get('height_inches', 65)),
        wenger_section=data.get('wenger_section', 'Riser A'),
        wenger_row=data.get('wenger_row', 'Row 1'),
        wenger_slot=data.get('wenger_slot', 'Far Left')
    )
    db.session.add(new_s)
    
    if not User.query.filter_by(student_id=data['student_id']).first():
        user = User(
            student_id=data['student_id'],
            name=f"{data['first_name']} {data['last_name']}",
            password_hash=generate_password_hash('titan123'),
            role='student',
            ensemble=data['ensemble'],
            voice_part=data['voice_part']
        )
        db.session.add(user)
        
    db.session.commit()
    return jsonify({"success": True, "message": "Student added successfully"})

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

@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.get_json() or {}
    student = Student.query.get(id)
    if student:
        student.first_name = data.get('first_name', student.first_name)
        student.last_name = data.get('last_name', student.last_name)
        student.ensemble = data.get('ensemble', student.ensemble)
        student.additional_ensembles = data.get('additional_ensembles', student.additional_ensembles)
        student.voice_part = data.get('voice_part', student.voice_part)
        student.height_inches = int(data.get('height_inches', student.height_inches or 65))
        student.wenger_section = data.get('wenger_section', student.wenger_section)
        student.wenger_row = data.get('wenger_row', student.wenger_row)
        student.wenger_slot = data.get('wenger_slot', student.wenger_slot)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get(id)
    if student:
        user = User.query.filter_by(student_id=student.student_id).first()
        if user:
            db.session.delete(user)
        db.session.delete(student)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

@app.route('/api/fva-terms', methods=['GET'])
def get_fva_terms():
    return jsonify(FVA_TERMS)

@app.route('/api/admin/reset-student-password', methods=['POST'])
def reset_student_password():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    new_password = data.get('new_password', 'titan123')
    
    user = User.query.filter_by(student_id=student_id).first()
    if user:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"success": True, "message": f"Password reset to '{new_password}' for student ID {student_id}"})
    return jsonify({"success": False, "message": "Student user account not found."}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
