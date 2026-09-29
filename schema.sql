-- Enums
CREATE TYPE choir_class AS ENUM ('Titan Chorus', 'Bel Canto', 'A Cappella', 'Concert Choir', 'Treble Choir');
CREATE TYPE voice_type AS ENUM ('Soprano 1', 'Soprano 2', 'Alto 1', 'Alto 2', 'Tenor 1', 'Tenor 2', 'Bass 1', 'Bass 2');
CREATE TYPE shirt_size AS ENUM ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL');
CREATE TYPE status_type AS ENUM ('Active', 'Archived_Alumni', 'Transferred');

-- 1. Main Student Master Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    ocps_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    graduation_year INT NOT NULL,
    status status_type DEFAULT 'Active',
    
    -- Sizes & Uniforms
    shirt_size shirt_size,
    polo_size shirt_size,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Parents / Guardians
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    relationship VARCHAR(50)
);

-- 3. Yearly Dynamic Data Record (Refreshes Every Year)
CREATE TABLE student_academic_years (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    school_year VARCHAR(9) NOT NULL, -- e.g., '2026-2027'
    class_assigned choir_class NOT NULL,
    voice_type voice_type NOT NULL,
    grade_level INT CHECK (grade_level BETWEEN 9 AND 12),
    
    -- Paperwork & Fees
    paperwork_submitted BOOLEAN DEFAULT FALSE,
    school_cash_online_paid BOOLEAN DEFAULT FALSE,
    
    -- Leadership Roles
    section_leader BOOLEAN DEFAULT FALSE,
    committee_chair VARCHAR(100) DEFAULT NULL,
    
    -- Auditions Tracked
    audition_all_county BOOLEAN DEFAULT FALSE,
    audition_all_state BOOLEAN DEFAULT FALSE,
    audition_fl_acda BOOLEAN DEFAULT FALSE,
    audition_national_acda BOOLEAN DEFAULT FALSE,
    
    UNIQUE(student_id, school_year)
);

-- 4. Call Home / Behavioral Logs
CREATE TABLE contact_logs (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    date_logged TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_by VARCHAR(100) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    parent_contacted VARCHAR(100)
);

-- 5. Dynamic Custom Fields Engine (For School Customization)
CREATE TABLE custom_field_definitions (
    id SERIAL PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(20) NOT NULL, -- 'text', 'boolean', 'number', 'select'
    options JSONB DEFAULT NULL, -- dropdown options if select
    applies_to_year BOOLEAN DEFAULT TRUE -- Resets yearly if TRUE
);

CREATE TABLE custom_field_values (
    id SERIAL PRIMARY KEY,
    field_id INT REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    school_year VARCHAR(9), -- NULL if static student-level data
    value TEXT
);
