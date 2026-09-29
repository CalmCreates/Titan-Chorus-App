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
        db.session.delete(student)
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"success": False}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)    return jsonify({
        "program": "Olympia High School Titan Chorus",
        "motto": "We Strive to Touch Lives!",
        "status": "Online",
        "database": "Connected" if raw_db_url else "Fallback"
    }), 200

# --- SAFE ALUMNI EMAIL SENDER ---
def send_alumni_invitation_email(recipient_email, first_name):
    # If SendGrid API key isn't provided, skip silently instead of throwing an error
    if not SENDGRID_API_KEY:
        print(f"Skipping alumni email to {recipient_email}: SENDGRID_API_KEY not set.")
        return False
    
    try:
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        subject = "Congratulations & Welcome to the Olympia Titan Chorus Alumni Network!"
        content = f"""
        <div style="font-family: Arial, sans-serif; color: #111;">
            <h2 style="color: #005f73;">Olympia High School Titan Chorus</h2>
            <p><em>"We Strive to Touch Lives!"</em></p>
            <hr>
            <p>Dear {first_name},</p>
            <p>Congratulations on your graduation!</p>
            <p><a href="https://titanchorus.org/alumni/join?email={recipient_email}">Join Alumni Network</a></p>
        </div>
        """
        message = Mail(
            from_email=('alumni@titanchorus.org', 'Olympia Titan Chorus'),
            to_emails=recipient_email,
            subject=subject,
            html_content=content
        )
        sg.send(message)
        return True
    except Exception as e:
        print(f"SendGrid Error for {recipient_email}: {e}")
        return False

# --- ANNUAL ROLLOVER ROUTE ---
@app.route('/api/admin/annual-rollover', methods=['POST'])
def run_annual_rollover():
    data = request.json or {}
    current_year = data.get('current_school_year', '2025-2026')
    next_year = data.get('next_school_year', '2026-2027')
    current_grad_class = int(current_year.split('-')[1])

    try:
        # Find graduating seniors
        graduating_students = db.session.execute(
            "SELECT id, first_name, email FROM students WHERE graduation_year <= :grad_year AND status = 'Active'",
            {'grad_year': current_grad_class}
        ).fetchall()

        for student in graduating_students:
            db.session.execute(
                "UPDATE students SET status = 'Archived_Alumni' WHERE id = :id",
                {'id': student.id}
            )
            # Safely trigger alumni email
            if student.email:
                send_alumni_invitation_email(student.email, student.first_name)

        db.session.commit()
        return jsonify({
            "status": "success",
            "archived_alumni_count": len(graduating_students)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- CALL HOME LOG ROUTE ---
@app.route('/api/students/<int:student_id>/call-home', methods=['POST'])
def log_call_home(student_id):
    data = request.json or {}
    try:
        db.session.execute("""
            INSERT INTO contact_logs (student_id, logged_by, reason, notes, parent_contacted)
            VALUES (:student_id, :logged_by, :reason, :notes, :parent_contacted)
        """, {
            'student_id': student_id,
            'logged_by': data.get('logged_by', 'Director'),
            'reason': data.get('reason', 'General'),
            'notes': data.get('notes', ''),
            'parent_contacted': data.get('parent_contacted', '')
        })
        db.session.commit()
        return jsonify({"message": "Call home record saved."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
