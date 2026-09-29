import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

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
    role = db.Column(db.String(20), default='student') # 'director' or 'student'
    ensemble = db.Column(db.String(50), nullable=True)
    voice_part = db.Column(db.String(20), nullable=True)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    ensemble = db.Column(db.String(50), nullable=False)
    voice_part = db.Column(db.String(20), nullable=False)
    dues_paid = db.Column(db.Boolean, default=False)
    paperwork_complete = db.Column(db.Boolean, default=False)

@app.before_request
def create_tables():
    db.create_all()
    # Create Default Director Account if not present
    if not User.query.filter_by(student_id='ADMIN').first():
        admin = User(
            student_id='ADMIN',
            name='Chorus Director',
            password_hash=generate_password_hash('titan2026'),
            role='director'
        )
        db.session.add(admin)
        db.session.commit()

# API Endpoints
@app.route('/')
def home():
    return jsonify({
        "status": "Online",
        "program": "Olympia High School Titan Chorus Hub",
        "motto": "We Strive to Touch Lives!"
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(student_id=data.get('student_id')).first()
    if user and check_password_hash(user.password_hash, data.get('password')):
        return jsonify({
            "success": True,
            "role": user.role,
            "name": user.name,
            "student_id": user.student_id,
            "ensemble": user.ensemble or 'General',
            "voice_part": user.voice_part or 'Unassigned'
        })
    return jsonify({"success": False, "message": "Invalid ID or Password"}), 401

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
        "dues_paid": s.dues_paid,
        "paperwork_complete": s.paperwork_complete
    } for s in students])

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    new_s = Student(
        student_id=data['student_id'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        ensemble=data['ensemble'],
        voice_part=data['voice_part'],
        dues_paid=data.get('dues_paid', False),
        paperwork_complete=data.get('paperwork_complete', False)
    )
    db.session.add(new_s)
    
    # Auto-create student login account with default password 'titan123'
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

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get(id)
    if student:
        # Also clean up User login account if present
        user = User.query.filter_by(student_id=student.student_id).first()
        if user:
            db.session.delete(user)
        db.session.delete(student)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

# Student Self-Service Password Change
@app.route('/api/user/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    user = User.query.filter_by(student_id=data.get('student_id')).first()
    if user and check_password_hash(user.password_hash, data.get('old_password')):
        user.password_hash = generate_password_hash(data.get('new_password'))
        db.session.commit()
        return jsonify({"success": True, "message": "Password updated successfully!"})
    return jsonify({"success": False, "message": "Incorrect current password."}), 400

# Director Password Reset (Override)
@app.route('/api/admin/reset-student-password', methods=['POST'])
def reset_student_password():
    data = request.get_json()
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
