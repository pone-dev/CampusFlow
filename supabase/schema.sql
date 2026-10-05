-- CampusFlow database schema. Run this in the Supabase SQL editor before adding .env values.
create extension if not exists pgcrypto;

create type public.user_role as enum ('administrator', 'staff', 'student');
create type public.workflow_status as enum ('new', 'submitted', 'under_review', 'assigned', 'in_progress', 'approved', 'completed', 'resolved');
create type public.payment_status as enum ('due', 'paid', 'overdue');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  department text,
  programme text,
  created_at timestamptz not null default now()
);
create table public.departments (id uuid primary key default gen_random_uuid(), name text not null unique, code text not null unique, head_id uuid references public.profiles(id));
create table public.admissions (id uuid primary key default gen_random_uuid(), applicant_name text not null, programme text not null, stage text not null, decision text not null default 'pending', created_at timestamptz default now());
create table public.courses (id uuid primary key default gen_random_uuid(), department_id uuid references public.departments(id), code text not null unique, name text not null, credits integer not null check (credits > 0));
create table public.sections (id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade, faculty_id uuid references public.profiles(id), term text not null, capacity integer not null check (capacity > 0));
create table public.enrollments (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id), section_id uuid not null references public.sections(id), status text not null default 'active', unique(student_id, section_id));
create table public.rooms (id uuid primary key default gen_random_uuid(), building text not null, room_number text not null, capacity integer not null, equipment text[] default '{}', accessible boolean not null default true, unique(building, room_number));
create table public.timetable_slots (id uuid primary key default gen_random_uuid(), section_id uuid not null references public.sections(id), room_id uuid not null references public.rooms(id), faculty_id uuid references public.profiles(id), weekday smallint not null check (weekday between 1 and 7), starts_at time not null, ends_at time not null, check (ends_at > starts_at));
create table public.attendance (id uuid primary key default gen_random_uuid(), enrollment_id uuid not null references public.enrollments(id), class_date date not null, present boolean not null, recorded_by uuid references public.profiles(id), unique(enrollment_id, class_date));
create table public.assessments (id uuid primary key default gen_random_uuid(), section_id uuid not null references public.sections(id), title text not null, assessment_date date not null, weight numeric(5,2) not null check (weight > 0 and weight <= 100));
create table public.grades (id uuid primary key default gen_random_uuid(), assessment_id uuid not null references public.assessments(id), enrollment_id uuid not null references public.enrollments(id), score numeric(5,2), published boolean not null default false, unique(assessment_id, enrollment_id));
create table public.staff_records (id uuid primary key default gen_random_uuid(), staff_id uuid not null unique references public.profiles(id), workload_hours numeric(5,1) default 0, leave_start date, leave_end date, substitute_id uuid references public.profiles(id));
create table public.bookings (id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id), requested_by uuid not null references public.profiles(id), starts_at timestamptz not null, ends_at timestamptz not null, purpose text not null, status public.workflow_status not null default 'submitted', check (ends_at > starts_at));
create table public.maintenance_tickets (id uuid primary key default gen_random_uuid(), room_id uuid references public.rooms(id), title text not null, details text, priority text not null check (priority in ('low','medium','high','critical')), status public.workflow_status not null default 'new', reported_by uuid not null references public.profiles(id), assigned_to uuid references public.profiles(id), created_at timestamptz default now());
create table public.assets (id uuid primary key default gen_random_uuid(), asset_tag text not null unique, name text not null, room_id uuid references public.rooms(id), owner_department text, service_due date, status text not null default 'healthy');
create table public.invoices (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id), reference text not null unique, amount numeric(12,2) not null check (amount >= 0), due_date date not null, status public.payment_status not null default 'due');
create table public.payments (id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id), amount numeric(12,2) not null check (amount > 0), payment_reference text not null, paid_at timestamptz default now());
create table public.documents (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id), document_type text not null, storage_path text, status public.workflow_status not null default 'submitted', reviewed_by uuid references public.profiles(id));
create table public.announcements (id uuid primary key default gen_random_uuid(), title text not null, body text not null, audience text not null, published_by uuid not null references public.profiles(id), published_at timestamptz default now());
create table public.events (id uuid primary key default gen_random_uuid(), title text not null, starts_at timestamptz not null, ends_at timestamptz not null, room_id uuid references public.rooms(id), owner_id uuid references public.profiles(id), status public.workflow_status not null default 'submitted');
create table public.service_requests (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id), team text not null, summary text not null, status public.workflow_status not null default 'submitted', assigned_to uuid references public.profiles(id), created_at timestamptz default now());
create table public.library_loans (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id), item_title text not null, due_date date not null, status text not null default 'on_loan');
create table public.transport_routes (id uuid primary key default gen_random_uuid(), name text not null unique, stops text[] not null default '{}', alert text, next_arrival_minutes integer);
create table public.hostel_services (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id), residence text not null, summary text not null, status public.workflow_status not null default 'submitted');
create table public.lost_and_found (id uuid primary key default gen_random_uuid(), item_name text not null, location text, reported_by uuid references public.profiles(id), status public.workflow_status not null default 'new');

-- A timetable slot may not overlap another slot in the same room or with the same faculty.
create extension if not exists btree_gist;
alter table public.timetable_slots add constraint timetable_room_no_overlap exclude using gist (room_id with =, weekday with =, tsrange(('2000-01-01'::date + starts_at)::timestamp, ('2000-01-01'::date + ends_at)::timestamp) with &&);
alter table public.timetable_slots add constraint timetable_faculty_no_overlap exclude using gist (faculty_id with =, weekday with =, tsrange(('2000-01-01'::date + starts_at)::timestamp, ('2000-01-01'::date + ends_at)::timestamp) with &&) where (faculty_id is not null);
alter table public.bookings add constraint booking_room_no_overlap exclude using gist (room_id with =, tstzrange(starts_at, ends_at) with &&) where (status in ('submitted','approved'));

create or replace function public.current_role() returns public.user_role language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select public.current_role() = 'administrator' $$;
create or replace function public.is_staff_or_admin() returns boolean language sql stable security definer set search_path = public as $$ select public.current_role() in ('administrator','staff') $$;

alter table public.profiles enable row level security;
create policy "profile owner or admin reads" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin manages profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Shared reference data is readable by signed-in university members.
alter table public.departments enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.rooms enable row level security;
alter table public.timetable_slots enable row level security;
alter table public.assessments enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.transport_routes enable row level security;
create policy "members read departments" on public.departments for select to authenticated using (true);
create policy "members read courses" on public.courses for select to authenticated using (true);
create policy "members read sections" on public.sections for select to authenticated using (true);
create policy "members read rooms" on public.rooms for select to authenticated using (true);
create policy "members read timetable" on public.timetable_slots for select to authenticated using (true);
create policy "members read assessments" on public.assessments for select to authenticated using (true);
create policy "members read announcements" on public.announcements for select to authenticated using (true);
create policy "members read events" on public.events for select to authenticated using (true);
create policy "members read transport" on public.transport_routes for select to authenticated using (true);

-- Operational write access is limited to staff and administrators.
create policy "staff manage timetable" on public.timetable_slots for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "staff manage courses" on public.courses for all to authenticated using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "staff manage announcements" on public.announcements for insert to authenticated with check (public.is_staff_or_admin());

-- Private student information is only visible to its owner or authorized staff.
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.grades enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.service_requests enable row level security;
alter table public.library_loans enable row level security;
alter table public.hostel_services enable row level security;
alter table public.bookings enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.assets enable row level security;
alter table public.staff_records enable row level security;
alter table public.admissions enable row level security;
create policy "staff read enrollments" on public.enrollments for select to authenticated using (public.is_staff_or_admin() or student_id = auth.uid());
create policy "staff read attendance" on public.attendance for select to authenticated using (public.is_staff_or_admin() or exists(select 1 from public.enrollments e where e.id = enrollment_id and e.student_id = auth.uid()));
create policy "staff write attendance" on public.attendance for insert to authenticated with check (public.is_staff_or_admin());
create policy "staff read grades" on public.grades for select to authenticated using (public.is_staff_or_admin() or exists(select 1 from public.enrollments e where e.id = enrollment_id and e.student_id = auth.uid()));
create policy "staff read invoices" on public.invoices for select to authenticated using (public.is_staff_or_admin() or student_id = auth.uid());
create policy "admin manage invoices" on public.invoices for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "owner read documents" on public.documents for select to authenticated using (public.is_staff_or_admin() or student_id = auth.uid());
create policy "owner submit documents" on public.documents for insert to authenticated with check (student_id = auth.uid() or public.is_staff_or_admin());
create policy "owner read requests" on public.service_requests for select to authenticated using (public.is_staff_or_admin() or student_id = auth.uid());
create policy "owner create requests" on public.service_requests for insert to authenticated with check (student_id = auth.uid());
create policy "staff update requests" on public.service_requests for update to authenticated using (public.is_staff_or_admin());
create policy "members manage own bookings" on public.bookings for select to authenticated using (public.is_staff_or_admin() or requested_by = auth.uid());
create policy "members create bookings" on public.bookings for insert to authenticated with check (requested_by = auth.uid());
create policy "members read tickets" on public.maintenance_tickets for select to authenticated using (public.is_staff_or_admin() or reported_by = auth.uid());
create policy "members create tickets" on public.maintenance_tickets for insert to authenticated with check (reported_by = auth.uid());
create policy "staff update tickets" on public.maintenance_tickets for update to authenticated using (public.is_staff_or_admin());
create policy "staff read assets" on public.assets for select to authenticated using (public.is_staff_or_admin());
create policy "admin manage assets" on public.assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages admissions" on public.admissions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "staff read staff records" on public.staff_records for select to authenticated using (public.is_staff_or_admin());
create policy "owner read loans" on public.library_loans for select to authenticated using (public.is_staff_or_admin() or student_id = auth.uid());
create policy "owner read hostels" on public.hostel_services for select to authenticated using (public.is_staff_or_admin() or student_id = auth.uid());
