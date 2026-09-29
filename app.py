import os
import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import sendgrid
from sendgrid.helpers.mail import Mail

app = Flask(__name__)

# Render PostgreSQL URL fix (SQLAlchemy requires postgresql:// instead of postgres://)
db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/titan_chorus')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')

# --- HEALTH CHECK / HOMEPAGE ---
@app.route('/')
def home():
    return jsonify({
        "program": "Olympia High School Titan Chorus",
        "motto": "We Strive to Touch Lives!",
        "status": "Online"
    }), 200

# --- AUTOMATED ALUMNI PIPELINE & ANNUAL ROLLOVER ENGINE ---

@app.route('/api/admin/annual-rollover', methods=['POST'])
def run_annual_rollover():
    data = request.json or {}
    current_year = data.get('current_school_year', '2025-2026')
    next_year = data.get('next_school_year', '2026-2027')
    current_grad_class = int(current_year.split('-')[1])

    graduating_students = db.session.execute(
        "SELECT * FROM students WHERE graduation_year <= :grad_year AND status = 'Active'",
        {'grad_year': current_grad_class}
    ).fetchall()

    for student in graduating_students:
        db.session.execute(
            "UPDATE students SET status = 'Archived_Alumni' WHERE id = :id",
            {'id': student.id}
        )
        if hasattr(student, 'email') and student.email:
            send_alumni_invitation_email(student.email, student.first_name)

    active_students = db.session.execute(
        "SELECT * FROM students WHERE status = 'Active'"
    ).fetchall()

    for student in active_students:
        db.session.execute("""
            INSERT INTO student_academic_years 
            (student_id, school_year, class_assigned, voice_type, grade_level, paperwork_submitted, school_cash_online_paid)
            VALUES (:s_id, :next_yr, 'Titan Chorus', 'Soprano 1', 9, FALSE, FALSE)
            ON CONFLICT DO NOTHING
        """, {'s_id': student.id, 'next_yr': next_year})

    db.session.commit()
    return jsonify({
        "status": "success",
        "archived_alumni_count": len(graduating_students),
        "rolled_over_students": len(active_students)
    }), 200


def send_alumni_invitation_email(recipient_email, first_name):
    if not SENDGRID_API_KEY:
        return
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    subject = "Congratulations & Welcome to the Olympia Titan Chorus Alumni Network!"
    content = f"""
    <div style="font-family: Arial, sans-serif; color: #111;">
        <h2 style="color: #005f73;">Olympia High School Titan Chorus</h2>
        <p><em>"We Strive to Touch Lives!"</em></p>
        <hr>
        <p>Dear {first_name},</p>
        <p>Congratulations on your graduation!</p>
        <p>Please click below to join our alumni portal:</p>
        <p><a href="https://titanchorus.org/alumni/join?email={recipient_email}">Join Alumni Network</a></p>
    </div>
    """
    message = Mail(
        from_email=('alumni@titanchorus.org', 'Olympia Titan Chorus'),
        to_emails=recipient_email,
        subject=subject,
        html_content=content
    )
    try:
        sg.send(message)
    except Exception as e:
        print(f"Error sending email: {e}")

# --- CALL HOME LOG ENGINE ---

@app.route('/api/students/<int:student_id>/call-home', methods=['POST'])
def log_call_home(student_id):
    data = request.json or {}
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
    return jsonify({"message": "Call home record saved successfully."}), 201

# --- RENDER BINDING FIX ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
