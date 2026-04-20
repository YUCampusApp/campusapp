-- =============================================================================
-- CampusApp – örnek kullanıcılar (PostgreSQL / DBeaver)
--
-- Tüm kullanıcı tablolarını boşaltıp sıfırdan seed: dbeaver-reset-and-seed.sql
--
-- Şifre (tümü): Password1!
--
-- admins.role: Cafeteria | Library | Hairdresser | Market | Shuttle | Stationary
-- (users."role" = sistem: student / instructor / admin)
--
-- Kütüphane: library_sections (COMP / GENERAL, total_seats), library_reservations
-- (student_id, section_id, start_at, end_at, status: ACTIVE|CANCELLED|COMPLETED).
-- Kuaför: hairdresser_appointments
-- (student_id, start_at, end_at, status: ACTIVE|CANCELLED|COMPLETED).
-- Market: market_items (item, stock).
-- Demo öğrenciler silinmeden önce onlara ait rezervasyonlar temizlenir.
--
-- Execute SQL Script (Ctrl+Alt+X); parça parça Ctrl+Enter kullanmayın.
-- =============================================================================

DELETE FROM public.library_reservations
WHERE student_id IN (
  SELECT u.id FROM public.users u WHERE u.email LIKE 'demo.%@yeditepe.local'
);

DELETE FROM public.hairdresser_appointments
WHERE student_id IN (
  SELECT u.id FROM public.users u WHERE u.email LIKE 'demo.%@yeditepe.local'
);

DELETE FROM public.students
WHERE id IN (SELECT u.id FROM public.users u WHERE u.email LIKE 'demo.%@yeditepe.local');

DELETE FROM public.instructors
WHERE id IN (SELECT u.id FROM public.users u WHERE u.email LIKE 'demo.%@yeditepe.local');

DELETE FROM public.admins
WHERE id IN (SELECT u.id FROM public.users u WHERE u.email LIKE 'demo.%@yeditepe.local');

DELETE FROM public.users WHERE email LIKE 'demo.%@yeditepe.local';

INSERT INTO public.users (name, email, password, "role") VALUES
  ('Demo Student Alpha',    'demo.student1@yeditepe.local',    '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'student'),
  ('Demo Student Beta',     'demo.student2@yeditepe.local',    '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'student'),
  ('Demo Instructor One', 'demo.instructor1@yeditepe.local',   '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'instructor'),
  ('Demo Instructor Two', 'demo.instructor2@yeditepe.local',   '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'instructor'),
  ('Demo Admin Cafeteria',  'demo.admin.cafeteria@yeditepe.local',  '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'admin'),
  ('Demo Admin Library',    'demo.admin.library@yeditepe.local',    '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'admin'),
  ('Demo Admin Hairdresser','demo.admin.hairdresser@yeditepe.local','$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'admin'),
  ('Demo Admin Market',     'demo.admin.market@yeditepe.local',     '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'admin'),
  ('Demo Admin Shuttle',    'demo.admin.shuttle@yeditepe.local',    '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'admin'),
  ('Demo Admin Stationary', 'demo.admin.stationary@yeditepe.local', '$2b$10$YGQTcNZMNgSJTl9/au043OH5WGg0v698HIn1HtCRk6.i6untU9.6y', 'admin');

INSERT INTO public.students (id, student_no, department, class_year)
SELECT id, '20241001', 'Computer Engineering', 2 FROM public.users WHERE email = 'demo.student1@yeditepe.local';

INSERT INTO public.students (id, student_no, department, class_year)
SELECT id, '20241002', 'Industrial Engineering', 1 FROM public.users WHERE email = 'demo.student2@yeditepe.local';

INSERT INTO public.instructors (id, instructor_no, department, title)
SELECT id, 'INS-1001', 'Computer Engineering', 'Assoc. Prof.' FROM public.users WHERE email = 'demo.instructor1@yeditepe.local';

INSERT INTO public.instructors (id, instructor_no, department, title)
SELECT id, 'INS-1002', 'Mathematics', 'Prof. Dr.' FROM public.users WHERE email = 'demo.instructor2@yeditepe.local';

INSERT INTO public.admins (id, admin_no, "role")
SELECT id, 'ADM-CAF-001', 'Cafeteria' FROM public.users WHERE email = 'demo.admin.cafeteria@yeditepe.local';

INSERT INTO public.admins (id, admin_no, "role")
SELECT id, 'ADM-LIB-001', 'Library' FROM public.users WHERE email = 'demo.admin.library@yeditepe.local';

INSERT INTO public.admins (id, admin_no, "role")
SELECT id, 'ADM-HAIR-001', 'Hairdresser' FROM public.users WHERE email = 'demo.admin.hairdresser@yeditepe.local';

INSERT INTO public.admins (id, admin_no, "role")
SELECT id, 'ADM-MKT-001', 'Market' FROM public.users WHERE email = 'demo.admin.market@yeditepe.local';

INSERT INTO public.admins (id, admin_no, "role")
SELECT id, 'ADM-SHU-001', 'Shuttle' FROM public.users WHERE email = 'demo.admin.shuttle@yeditepe.local';

INSERT INTO public.admins (id, admin_no, "role")
SELECT id, 'ADM-STA-001', 'Stationary' FROM public.users WHERE email = 'demo.admin.stationary@yeditepe.local';

DO $$
DECLARE
  seq_name text;
  max_id bigint;
BEGIN
  seq_name := pg_get_serial_sequence('public.users', 'id');
  IF seq_name IS NULL THEN
    seq_name := pg_get_serial_sequence('users', 'id');
  END IF;
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 1) INTO max_id FROM public.users;
    PERFORM setval(seq_name::regclass, max_id);
  END IF;
END $$;

-- Kütüphane bölümleri (Hibernate tek tablo + section_type ayırıcı; uygulama da boşsa oluşturur)
INSERT INTO public.library_sections (total_seats, section_type)
SELECT 30, 'COMP'
WHERE NOT EXISTS (SELECT 1 FROM public.library_sections WHERE section_type = 'COMP');

INSERT INTO public.library_sections (total_seats, section_type)
SELECT 80, 'GENERAL'
WHERE NOT EXISTS (SELECT 1 FROM public.library_sections WHERE section_type = 'GENERAL');

-- Demo kütüphane rezervasyonları (aktif)
INSERT INTO public.library_reservations (student_id, section_id, start_at, end_at, status, created_at)
SELECT s.id,
       sec.id,
       NOW() + INTERVAL '30 minute',
       NOW() + INTERVAL '2 hour',
       'ACTIVE',
       NOW()
FROM public.students s
JOIN public.users u ON u.id = s.id
JOIN public.library_sections sec ON sec.section_type = 'COMP'
WHERE u.email = 'demo.student1@yeditepe.local';

INSERT INTO public.library_reservations (student_id, section_id, start_at, end_at, status, created_at)
SELECT s.id,
       sec.id,
       NOW() + INTERVAL '90 minute',
       NOW() + INTERVAL '3 hour',
       'ACTIVE',
       NOW()
FROM public.students s
JOIN public.users u ON u.id = s.id
JOIN public.library_sections sec ON sec.section_type = 'GENERAL'
WHERE u.email = 'demo.student2@yeditepe.local';

-- Demo kuaför randevuları (aktif)
INSERT INTO public.hairdresser_appointments (student_id, start_at, end_at, status, created_at)
SELECT s.id,
       NOW() + INTERVAL '20 minute',
       NOW() + INTERVAL '65 minute',
       'ACTIVE',
       NOW()
FROM public.students s
JOIN public.users u ON u.id = s.id
WHERE u.email = 'demo.student1@yeditepe.local';

INSERT INTO public.hairdresser_appointments (student_id, start_at, end_at, status, created_at)
SELECT s.id,
       NOW() + INTERVAL '110 minute',
       NOW() + INTERVAL '155 minute',
       'ACTIVE',
       NOW()
FROM public.students s
JOIN public.users u ON u.id = s.id
WHERE u.email = 'demo.student2@yeditepe.local';

TRUNCATE TABLE public.market_items RESTART IDENTITY CASCADE;

INSERT INTO public.market_items (item, stock) VALUES
  ('Bottled Water 0.5L', 120),
  ('Energy Drink', 35),
  ('Mixed Nuts', 18),
  ('Sandwich (Cheese)', 0),
  ('Chocolate Bar', 65),
  ('Filter Coffee', 40);

DO $$
DECLARE
  seq_name text;
  max_id bigint;
BEGIN
  seq_name := pg_get_serial_sequence('public.library_sections', 'id');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 1) INTO max_id FROM public.library_sections;
    PERFORM setval(seq_name::regclass, GREATEST(max_id, 1));
  END IF;
  seq_name := pg_get_serial_sequence('public.library_reservations', 'id');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 1) INTO max_id FROM public.library_reservations;
    PERFORM setval(seq_name::regclass, GREATEST(max_id, 1));
  END IF;
  seq_name := pg_get_serial_sequence('public.hairdresser_appointments', 'id');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 1) INTO max_id FROM public.hairdresser_appointments;
    PERFORM setval(seq_name::regclass, GREATEST(max_id, 1));
  END IF;
  seq_name := pg_get_serial_sequence('public.market_items', 'id');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 1) INTO max_id FROM public.market_items;
    PERFORM setval(seq_name::regclass, GREATEST(max_id, 1));
  END IF;
END $$;

-- Giriş (öğrenci): 20241001 / Password1!
