-- extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- ENUMS
--------------------------------------------------

CREATE TYPE dose_status AS ENUM (
    'pending',
    'taken',
    'skipped',
    'missed'
);

CREATE TYPE medication_type AS ENUM (
    'pill',
    'capsule',
    'liquid',
    'injection',
    'drops',
    'other'
);

--------------------------------------------------
-- USERS
--------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    name TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--------------------------------------------------
-- PUSH SUBSCRIPTIONS
--------------------------------------------------

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_push_user ON push_subscriptions(user_id);

--------------------------------------------------
-- MEDICATIONS
--------------------------------------------------

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage NUMERIC,
    unit TEXT,
    type medication_type DEFAULT 'other',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_medications_user ON medications(user_id);

--------------------------------------------------
-- TREATMENTS (opcional mas útil)
--------------------------------------------------

CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

--------------------------------------------------
-- SCHEDULES (horários recorrentes)
--------------------------------------------------

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    time_of_day TIME NOT NULL,
    quantity NUMERIC DEFAULT 1,
    days_of_week SMALLINT[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_schedule_medication ON schedules(medication_id);
CREATE INDEX idx_schedule_time ON schedules(time_of_day);

--------------------------------------------------
-- DOSE EVENTS (histórico)
--------------------------------------------------

CREATE TABLE dose_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status dose_status DEFAULT 'pending',
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_dose_schedule ON dose_events(schedule_id);
CREATE INDEX idx_dose_time ON dose_events(scheduled_for);
CREATE INDEX idx_dose_status ON dose_events(status);