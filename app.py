import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

db_url = os.environ.get('DATABASE_URL')
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url or 'sqlite:///titan_chorus.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------------------------------------------------------------------------
# DATABASE MODELS
# ---------------------------------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student')  # 'director', 'clc', 'student', 'alumni'
    ensemble = db.Column(db.String(100), default='Unassigned')
    voice_part = db.Column(db.String(50), default='TBD')
    dues_paid_amount = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "name": self.name,
            "role": self.role,
            "ensemble": self.ensemble,
            "voice_part": self.voice_part,
            "dues_paid_amount": self.dues_paid_amount or 0.0
        }

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    event_date = db.Column(db.String(50), nullable=False)
    location_name = db.Column(db.String(150), nullable=False)
    call_time = db.Column(db.String(50), nullable=False)
    radius_feet = db.Column(db.Integer, default=300)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "event_date": self.event_date,
            "location_name": self.location_name,
            "call_time": self.call_time,
            "radius_feet": self.radius_feet
        }

class FinancialTransaction(db.Model):
    __tablename__ = 'financial_transactions'
    id = db.Column(db.Integer, primary_key=True)
    trans_date = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    trans_type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    school_year = db.Column(db.String(20), default='2026-2027')

    def to_dict(self):
        return {
            "id": self.id,
            "trans_date": self.trans_date,
            "category": self.category,
            "description": self.description,
            "trans_type": self.trans_type,
            "amount": self.amount,
            "school_year": self.school_year
        }

with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"DB Init Warning: {e}")

    try:
        admin = User.query.filter_by(student_id='ADMIN').first()
        if not admin:
            admin = User(
                student_id='ADMIN',
                name='Cesar Lengua-Miranda',
                password_hash=generate_password_hash('titan2026'),
                role='director',
                ensemble='Director',
                voice_part='Director'
            )
            db.session.add(admin)
            db.session.commit()
    except Exception as e:
        db.session.rollback()

# ---------------------------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------------------------

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Online", "program": "Olympia High School Titan Chorus Hub"}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    student_id = (data.get('student_id') or '').strip()
    password = (data.get('password') or '').strip()

    user = User.query.filter_by(student_id=student_id).first()
    if user and check_password_hash(user.password_hash, password):
        user_dict = user.to_dict()
        user_dict["success"] = True
        return jsonify(user_dict), 200

    return jsonify({"success": False, "message": "Invalid Student ID or Password"}), 401

@app.route('/api/change-password', methods=['POST'])
def change_password():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = User.query.filter_by(student_id=student_id).first()
    if not user or not check_password_hash(user.password_hash, old_password):
        return jsonify({"success": False, "message": "Current password is incorrect"}), 400

    try:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"success": True, "message": "Password updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    students = User.query.all()
    return jsonify([s.to_dict() for s in students]), 200

@app.route('/api/students/role', methods=['POST'])
def update_student_role():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    new_role = data.get('role')  # 'clc', 'student', 'alumni'

    user = User.query.filter_by(student_id=student_id).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    try:
        user.role = new_role
        db.session.commit()
        return jsonify({"success": True, "user": user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/students/payment', methods=['POST'])
def update_student_payment():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    amount = data.get('amount')

    user = User.query.filter_by(student_id=student_id).first()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    try:
        user.dues_paid_amount = float(amount)
        db.session.commit()
        return jsonify({"success": True, "user": user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([e.to_dict() for e in events]), 200

@app.route('/api/budget', methods=['GET', 'POST'])
def handle_budget():
    if request.method == 'POST':
        data = request.get_json() or {}
        try:
            trans = FinancialTransaction(
                trans_date=data.get('trans_date'),
                category=data.get('category'),
                description=data.get('description'),
                trans_type=data.get('trans_type'),
                amount=float(data.get('amount', 0)),
                school_year=data.get('school_year', '2026-2027')
            )
            db.session.add(trans)
            db.session.commit()
            return jsonify({"success": True, "transaction": trans.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": str(e)}), 500

    transactions = FinancialTransaction.query.order_by(FinancialTransaction.id.desc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
