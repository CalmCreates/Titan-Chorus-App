import os
import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import sendgrid
from sendgrid.helpers.mail import Mail

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/titan_chorus')
db = SQLAlchemy(app)

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')

# --- AUTOMATED ALUMNI PIPELINE & ANNUAL ROLLOVER ENGINE ---

@app.route('/api/admin/annual-rollover', methods=['POST'])
def run_annual_rollover():
    """
    1. Archives Seniors who reached graduation year.
    2. Sends automatic welcome email to new alumni.
    3. Promotes lower grades and creates clean record slots for next school year.
    """
    data = request.json
    current_year = data.get('current_school_year') # e.g., '2025-2026'
    next_year = data.get('next_school_year')       # e.g., '2026-2027'
    current_grad_class = int(current_year.split('-')[1])

    # 1. Identify and Archive Graduating Seniors
    graduating_students = db.session.execute(
        "SELECT * FROM students WHERE graduation_year <= :grad_year AND status = 'Active'",
        {'grad_year': current_grad_class}
    ).fetchall()

    for student in graduating_students:
        # Update status
        db.session.execute(
            "UPDATE students SET status = 'Archived_Alumni' WHERE id = :id",
            {'id': student.id}
        )
        # Trigger Automated Alumni Onboarding Email
        if student.email:
            send_alumni_invitation_email(student.email, student.first_name)

    # 2. Advance non-graduating active students to next academic year structure
    active_students = db.session.execute(
        "SELECT * FROM students WHERE status = 'Active'"
    ).fetchall()

    for student in active_students:
        # Insert a blank template for new school year, requiring updated voice/class choices
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
    """Sends automatic invitation email to newly graduated students."""
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    
    subject = "Congratulations & Welcome to the Olympia Titan Chorus Alumni Network!"
    content = f"""
    <div style="font-family: Arial, sans-serif; color: #111;">
        <h2 style="color: #003366;">Olympia High School Titan Chorus</h2>
        <p><em>"We Strive to Touch Lives!"</em></p>
        <hr>
        <p>Dear {first_name},</p>
        <p>Congratulations on your graduation! Thank you for leaving your footprint on the Titan Chorus program.</p>
        <p>As an official alumni, we would love to keep in touch with you. You will receive periodic newsletters about our upcoming concerts, community achievements, and volunteer/mentorship opportunities.</p>
        <p>Please click below to confirm your preferred personal email address and join our alumni portal:</p>
        <p><a href="https://titanchorus.org/alumni/join?email={recipient_email}" style="background-color: #003366; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Join Alumni Network</a></p>
        <br>
        <p>With Titan Pride,</p>
        <p><strong>Olympia High School Choral Department</strong></p>
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
        print(f"Error sending alumni email: {e}")

# --- CALL HOME LOG ENGINE ---

@app.route('/api/students/<int:student_id>/call-home', methods=['POST'])
def log_call_home(student_id):
    data = request.json
    db.session.execute("""
        INSERT INTO contact_logs (student_id, logged_by, reason, notes, parent_contacted)
        VALUES (:student_id, :logged_by, :reason, :notes, :parent_contacted)
    """, {
        'student_id': student_id,
        'logged_by': data['logged_by'],
        'reason': data['reason'],
        'notes': data.get('notes', ''),
        'parent_contacted': data.get('parent_contacted', '')
    })
    db.session.commit()
    return jsonify({"message": "Call home record saved successfully."}), 201

if __name__ == '__main__':
    app.run(debug=True)
