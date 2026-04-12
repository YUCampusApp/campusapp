-- =============================================================================
-- CampusApp – kullanıcı tablolarını sıfırla + demo seed (PostgreSQL / DBeaver)
--
-- UYARI: students, instructors, admins, users + kütüphane rezervasyonları/bölümleri sıfırlanır.
--        (DROP SCHEMA kullanmıyoruz; public şemadaki diğer tablolar kalır.)
--
-- Şifre: Password1!  |  Kütüphane admin: demo.admin.library@yeditepe.local
-- Execute SQL Script (Ctrl+Alt+X).
-- =============================================================================

TRUNCATE TABLE public.library_reservations RESTART IDENTITY CASCADE;
TRUNCATE TABLE
  public.students,
  public.instructors,
  public.admins,
  public.users
RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.library_sections RESTART IDENTITY CASCADE;

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

INSERT INTO public.library_sections (total_seats, section_type) VALUES
  (30, 'COMP'),
  (80, 'GENERAL');

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
END $$;
