import type { Activity, DemoUser, ModuleDefinition, ModuleKey, TableRow } from './types';

export const users: DemoUser[] = [
  { id: 'admin-01', name: 'Aisha Rahman', initials: 'AR', role: 'administrator', title: 'Registrar & Operations Lead', email: 'admin@campusflow.demo', password: 'admin123', department: 'University Administration' },
  { id: 'staff-01', name: 'Dr. Maya Chen', initials: 'MC', role: 'staff', title: 'Senior Lecturer', email: 'staff@campusflow.demo', password: 'staff123', department: 'School of Computing' },
  { id: 'student-01', name: 'Jordan Davis', initials: 'JD', role: 'student', title: 'BSc Computer Science · Year 2', email: 'student@campusflow.demo', password: 'student123', department: 'School of Computing' },
];

export const modules: ModuleDefinition[] = [
  { key: 'admissions', label: 'Admissions', icon: '◫', description: 'Applications, offers, and enrollment readiness.', group: 'Academic', roles: ['administrator'] },
  { key: 'students', label: 'Student records', icon: '◉', description: 'Profiles, enrollment, progression, and clearance.', group: 'Academic', roles: ['administrator', 'staff'] },
  { key: 'academics', label: 'Courses & curriculum', icon: '▤', description: 'Programmes, course units, and section assignments.', group: 'Academic', roles: ['administrator', 'staff', 'student'] },
  { key: 'timetable', label: 'Timetable', icon: '◷', description: 'Teaching schedule, clash detection, and room changes.', group: 'Academic', roles: ['administrator', 'staff', 'student'] },
  { key: 'attendance', label: 'Attendance', icon: '✓', description: 'Class registers and early-support signals.', group: 'Academic', roles: ['administrator', 'staff', 'student'] },
  { key: 'exams', label: 'Exams & grades', icon: '★', description: 'Assessment schedule, marks, and results.', group: 'Academic', roles: ['administrator', 'staff', 'student'] },
  { key: 'staff', label: 'Staff & workload', icon: '♙', description: 'Faculty records, workload, and leave.', group: 'People', roles: ['administrator', 'staff'] },
  { key: 'finance', label: 'Fees & scholarships', icon: '₹', description: 'Invoices, payments, scholarship awards.', group: 'People', roles: ['administrator', 'student'] },
  { key: 'rooms', label: 'Rooms & bookings', icon: '⌖', description: 'Classrooms, labs, equipment, and reservations.', group: 'Operations', roles: ['administrator', 'staff', 'student'] },
  { key: 'maintenance', label: 'Maintenance', icon: '⚒', description: 'Facilities tickets, assignments, and resolutions.', group: 'Operations', roles: ['administrator', 'staff'] },
  { key: 'assets', label: 'Assets & inventory', icon: '▣', description: 'Campus equipment, ownership, and service dates.', group: 'Operations', roles: ['administrator', 'staff'] },
  { key: 'transport', label: 'Transport', icon: '↔', description: 'Routes, service alerts, and student passes.', group: 'Operations', roles: ['administrator', 'student'] },
  { key: 'hostels', label: 'Hostel services', icon: '⌂', description: 'Residence allocation, visitor and repair requests.', group: 'Services', roles: ['administrator', 'student'] },
  { key: 'library', label: 'Library', icon: '▥', description: 'Loans, reservations, and overdue reminders.', group: 'Services', roles: ['administrator', 'staff', 'student'] },
  { key: 'documents', label: 'Documents & approvals', icon: '▱', description: 'Forms, scholarship documents, and clearance.', group: 'Services', roles: ['administrator', 'student'] },
  { key: 'complaints', label: 'Anonymous complaints', icon: '⚐', description: 'Student-reported concerns reviewed without exposing identity.', group: 'Services', roles: ['administrator', 'staff', 'student'] },
  { key: 'requests', label: 'Service desk', icon: '◌', description: 'Student requests routed to the right team.', group: 'Services', roles: ['administrator', 'staff', 'student'] },
  { key: 'announcements', label: 'Announcements', icon: '⚑', description: 'Targeted notices and read history.', group: 'Services', roles: ['administrator', 'staff', 'student'] },
  { key: 'events', label: 'Events & clubs', icon: '◇', description: 'Event approval, registrations, and room requests.', group: 'Services', roles: ['administrator', 'staff', 'student'] },
  { key: 'analytics', label: 'Reports & analytics', icon: '◫', description: 'Enrollment, risk, facilities, and finance insights.', group: 'Insights', roles: ['administrator'] },
];

export const starterTables: Record<ModuleKey, TableRow[]> = {
  admissions: [
    { id: 'a1', Applicant: 'Nina Patel', Programme: 'BSc Data Science', Stage: 'Document review', Decision: 'Pending' },
    { id: 'a2', Applicant: 'Ethan Moore', Programme: 'BBA Finance', Stage: 'Offer sent', Decision: 'Accepted' },
    { id: 'a3', Applicant: 'Samira Khan', Programme: 'BSc Computer Science', Stage: 'Interview', Decision: 'Pending' },
  ],
  students: [
    { id: 's1', Student: 'Jordan Davis', Programme: 'BSc Computer Science', Year: '2', Attendance: '87%', Status: 'Active' },
    { id: 's2', Student: 'Leah Martin', Programme: 'BSc Computer Science', Year: '2', Attendance: '68%', Status: 'Early support' },
    { id: 's3', Student: 'Omar Hassan', Programme: 'BBA Finance', Year: '3', Attendance: '93%', Status: 'Active' },
  ],
  academics: [
    { id: 'c1', Code: 'CS210', Course: 'Data Structures', Faculty: 'Dr. Maya Chen', Enrolled: '84', Credits: '4' },
    { id: 'c2', Code: 'CS240', Course: 'Computer Networks', Faculty: 'Prof. I. Brooks', Enrolled: '77', Credits: '4' },
    { id: 'c3', Code: 'MATH181', Course: 'Calculus II', Faculty: 'Dr. Ana Silva', Enrolled: '102', Credits: '3' },
  ],
  timetable: [
    { id: 't1', Course: 'CS210 · Data Structures', Day: 'Mon', Time: '09:00–10:30', Room: 'Science 104', Faculty: 'Dr. Maya Chen', Status: 'Confirmed' },
    { id: 't2', Course: 'CS240 · Computer Networks', Day: 'Mon', Time: '09:00–10:30', Room: 'Science 104', Faculty: 'Prof. I. Brooks', Status: 'Room conflict' },
    { id: 't3', Course: 'CS210 · Project Lab', Day: 'Wed', Time: '13:00–15:00', Room: 'Innovation Lab', Faculty: 'Dr. Maya Chen', Status: 'Confirmed' },
  ],
  attendance: [
    { id: 'at1', Student: 'Jordan Davis', Course: 'CS210', Present: '26 / 30', Percentage: '87%', Signal: 'On track' },
    { id: 'at2', Student: 'Leah Martin', Course: 'CS210', Present: '20 / 30', Percentage: '67%', Signal: 'Follow up' },
    { id: 'at3', Student: 'Jordan Davis', Course: 'CS240', Present: '24 / 26', Percentage: '92%', Signal: 'On track' },
  ],
  exams: [
    { id: 'e1', Assessment: 'CS210 Midterm', Date: '16 Oct', Room: 'Engineering Hall', Status: 'Scheduled' },
    { id: 'e2', Assessment: 'CS240 Networks Lab', Date: '20 Oct', Room: 'Network Lab', Status: 'Marks pending' },
    { id: 'e3', Assessment: 'MATH181 Quiz 2', Date: '08 Oct', Room: 'Science 201', Status: 'Published' },
  ],
  staff: [
    { id: 'st1', Faculty: 'Dr. Maya Chen', Department: 'Computing', 'Teaching load': '14 hrs', Leave: 'None', Status: 'Available' },
    { id: 'st2', Faculty: 'Prof. I. Brooks', Department: 'Computing', 'Teaching load': '16 hrs', Leave: '14 Oct', Status: 'Substitute needed' },
    { id: 'st3', Faculty: 'Dr. Ana Silva', Department: 'Mathematics', 'Teaching load': '12 hrs', Leave: 'None', Status: 'Available' },
  ],
  finance: [
    { id: 'f1', Student: 'Jordan Davis', Invoice: 'FALL-24018', Amount: '$1,250', Due: '18 Oct', Status: 'Due' },
    { id: 'f2', Student: 'Leah Martin', Invoice: 'FALL-24019', Amount: '$1,250', Due: '18 Oct', Status: 'Overdue' },
    { id: 'f3', Student: 'Omar Hassan', Invoice: 'FALL-24020', Amount: '$980', Due: '18 Oct', Status: 'Paid' },
  ],
  rooms: [
    { id: 'r1', Room: 'Innovation Lab', Capacity: '42', Equipment: 'PCs · projector', Availability: 'Available', Status: 'Available' },
    { id: 'r2', Room: 'Science 104', Capacity: '60', Equipment: 'Projector', Availability: 'Booked 09:00–10:30', Status: 'Booked' },
    { id: 'r3', Room: 'Library 2F', Capacity: '8', Equipment: 'Screen · whiteboard', Availability: 'Available', Status: 'Available' },
  ],
  maintenance: [
    { id: 'm1', Issue: 'Projector not powering on', Location: 'Science 104', 'Reported by': 'Dr. Maya Chen', Priority: 'High', Status: 'Assigned' },
    { id: 'm2', Issue: 'Air conditioning noise', Location: 'Library 2F', 'Reported by': 'Library team', Priority: 'Medium', Status: 'In progress' },
    { id: 'm3', Issue: 'Broken chair', Location: 'Hostel Cedar 12', 'Reported by': 'Jordan Davis', Priority: 'Low', Status: 'New' },
  ],
  assets: [
    { id: 'as1', Asset: 'EPSON projector #41', Location: 'Science 104', Owner: 'Facilities', Service: 'Overdue', Status: 'Needs service' },
    { id: 'as2', Asset: 'Network switch #12', Location: 'Network Lab', Owner: 'IT', Service: '03 Nov', Status: 'Healthy' },
    { id: 'as3', Asset: '3D printer #03', Location: 'Innovation Lab', Owner: 'Engineering', Service: '21 Oct', Status: 'Healthy' },
  ],
  transport: [
    { id: 'tr1', Route: 'North Loop', 'Next arrival': '8 min', Stop: 'Main Gate', Status: 'On time' },
    { id: 'tr2', Route: 'East Loop', 'Next arrival': '14 min', Stop: 'Library', Status: 'Stop relocated' },
    { id: 'tr3', Route: 'City Express', 'Next arrival': '22 min', Stop: 'Transit Hub', Status: 'On time' },
  ],
  hostels: [
    { id: 'h1', Student: 'Jordan Davis', Residence: 'Cedar Hall · 312', Request: 'Laundry card replacement', Status: 'Under review' },
    { id: 'h2', Student: 'Mina Reyes', Residence: 'Maple Hall · 118', Request: 'Room change', Status: 'Approved' },
    { id: 'h3', Student: 'Sam Ortiz', Residence: 'Cedar Hall · 105', Request: 'Visitor pass', Status: 'Completed' },
  ],
  library: [
    { id: 'l1', Item: 'Clean Code', Borrower: 'Jordan Davis', Due: '09 Oct', Status: 'On loan' },
    { id: 'l2', Item: 'Designing Data-Intensive Applications', Borrower: 'Leah Martin', Due: '04 Oct', Status: 'Overdue' },
    { id: 'l3', Item: 'IEEE Access #42', Borrower: 'Reserved by Jordan', Due: 'Pickup by 5 PM', Status: 'Reserved' },
  ],
  documents: [
    { id: 'd1', Student: 'Jordan Davis', Document: 'Scholarship income statement', Submitted: '02 Oct', Status: 'Under review' },
    { id: 'd2', Student: 'Leah Martin', Document: 'Programme transfer form', Submitted: '30 Sep', Status: 'Approved' },
    { id: 'd3', Student: 'Omar Hassan', Document: 'Graduation clearance', Submitted: '28 Sep', Status: 'Pending' },
  ],
  complaints: [
    { id: 'cp1', 'Case reference': 'CF-7K2Q9A', Category: 'Safety', Summary: 'Poor lighting near Cedar Hall entrance after 8 PM.', Priority: 'High', Status: 'Submitted' },
    { id: 'cp2', 'Case reference': 'CF-4M8R1B', Category: 'Facilities', Summary: 'Repeated air conditioning issues in a residence common area.', Priority: 'Medium', Status: 'Under review' },
    { id: 'cp3', 'Case reference': 'CF-9D3P6C', Category: 'Academic', Summary: 'A lab access accommodation needs review.', Priority: 'Low', Status: 'Resolved' },
  ],
  requests: [
    { id: 'q1', Request: 'Transcript for internship', 'Submitted by': 'Jordan Davis', Team: 'Registrar', Status: 'Under review' },
    { id: 'q2', Request: 'Laptop access card', 'Submitted by': 'Leah Martin', Team: 'IT Services', Status: 'Approved' },
    { id: 'q3', Request: 'Academic advising', 'Submitted by': 'Omar Hassan', Team: 'Student Success', Status: 'Completed' },
  ],
  announcements: [
    { id: 'n1', Title: 'Science 104 moved to Innovation Lab', Audience: 'CS210 students', Published: 'Today · 08:42', Status: 'Unread' },
    { id: 'n2', Title: 'Library hours extended during midterms', Audience: 'All campus', Published: 'Yesterday', Status: 'Read' },
    { id: 'n3', Title: 'Scholarship documents due October 18', Audience: 'Students', Published: 'Yesterday', Status: 'Unread' },
  ],
  events: [
    { id: 'ev1', Event: 'Hack Northbridge', Owner: 'Computing Society', Date: '04 Oct · 09:00', Status: 'Approved' },
    { id: 'ev2', Event: 'Fall clubs fair', Owner: 'Student Union', Date: '02 Oct · 12:00', Status: 'Live' },
    { id: 'ev3', Event: 'Research poster day', Owner: 'Research Office', Date: '11 Oct · 10:00', Status: 'Room requested' },
  ],
  analytics: [
    { id: 'an1', Metric: 'Enrollment this term', Value: '6,842', Change: '+4.8%', Status: 'Healthy' },
    { id: 'an2', Metric: 'Students needing attendance support', Value: '73', Change: '12 new', Status: 'Attention' },
    { id: 'an3', Metric: 'Open high-priority maintenance', Value: '4', Change: '-2 this week', Status: 'Attention' },
  ],
};

export const startingActivity: Activity[] = [
  { id: 'act1', title: 'Science 104 equipment issue assigned', detail: 'Facilities technician scheduled before the next CS210 class.', time: '8 min ago', tone: 'amber' },
  { id: 'act2', title: 'CS210 timetable conflict detected', detail: 'A replacement room is available in Innovation Lab.', time: '18 min ago', tone: 'red' },
  { id: 'act3', title: 'Two student requests are awaiting review', detail: 'Registrar and IT Services queues need attention.', time: '35 min ago', tone: 'blue' },
];

export function cloneTables(): Record<ModuleKey, TableRow[]> {
  return JSON.parse(JSON.stringify(starterTables)) as Record<ModuleKey, TableRow[]>;
}
