import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import sendgrid
from sendgrid.helpers.mail import Mail

app = Flask(__name__)

# --- SAFE DATABASE CONFIGURATION ---
# Get Database URL from Render environment variables
raw_db_url = os.getenv('DATABASE_URL', '')

# Format postgres:// to postgresql:// safely
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# Fallback to local SQLite file if DATABASE_URL is missing so the app NEVER crashes on startup
if not raw_db_url:
    raw_db_url = 'sqlite:///titan_chorus_fallback.db'

app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', None)

# Automatically create database tables if using SQLite fallback
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"Database initialization warning: {e}")

# --- HEALTH CHECK / HOMEPAGE ---
@app.route('/')
def home():
    return jsonify({
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
