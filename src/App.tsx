import { FormEvent, useMemo, useState } from 'react';
import { cloneTables, modules, startingActivity, users } from './data';
import { authenticate, dataMode, endSession } from './supabase';
import type { Activity, DemoUser, ModuleKey, TableRow } from './types';

type Page = 'dashboard' | ModuleKey;
type DraftModal = { module: ModuleKey; title: string; hint: string } | null;

const roleLabel = (role: DemoUser['role']) => role === 'administrator' ? 'Administrator' : role === 'staff' ? 'Faculty & staff' : 'Student';
const pageTitle = (page: Page) => page === 'dashboard' ? 'Overview' : modules.find((item) => item.key === page)?.label ?? 'CampusFlow';
const today = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());

export default function App() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [tables, setTables] = useState(cloneTables);
  const [activity, setActivity] = useState<Activity[]>(startingActivity);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftModal, setDraftModal] = useState<DraftModal>(null);
  const [draftName, setDraftName] = useState('');
  const [draftStatus, setDraftStatus] = useState('Submitted');
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [draftCategory, setDraftCategory] = useState('Safety');
  const [draftPriority, setDraftPriority] = useState('Medium');
  const [ownedComplaintIds, setOwnedComplaintIds] = useState<Record<string, string[]>>({});

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const signIn = async (email: string, password: string) => {
    const account = await authenticate(email, password);
    if (!account) return false;
    setUser(account);
    setPage('dashboard');
    setSearch('');
    notify(`Signed in as ${roleLabel(account.role)}.`);
    return true;
  };

  const updateRow = (module: ModuleKey, id: string, changes: Record<string, string>) => {
    setTables((current) => ({
      ...current,
      [module]: current[module].map((row) => row.id === id ? { ...row, ...changes } : row),
    }));
  };

  const pushActivity = (title: string, detail: string, tone: Activity['tone'] = 'green') => {
    setActivity((current) => [{ id: `act-${Date.now()}`, title, detail, time: 'Just now', tone }, ...current].slice(0, 5));
  };

  const publish = (title: string, audience = 'Students') => {
    setTables((current) => ({
      ...current,
      announcements: [{ id: `n-${Date.now()}`, Title: title, Audience: audience, Published: 'Just now', Status: 'Unread' }, ...current.announcements],
    }));
  };

  const resolveClash = () => {
    updateRow('timetable', 't2', { Room: 'Innovation Lab', Status: 'Rescheduled' });
    publish('CS240 moved to Innovation Lab - Monday 09:00', 'CS240 students');
    pushActivity('Timetable conflict resolved', 'CS240 was moved to Innovation Lab and students were notified.', 'green');
    notify('Conflict resolved. Affected students were notified.');
  };

  const progressTicket = () => {
    const ticket = tables.maintenance.find((row) => row.id === 'm1');
    if (!ticket) return;
    const next = ticket.Status === 'Assigned' ? 'In progress' : 'Resolved';
    updateRow('maintenance', 'm1', { Status: next });
    if (next === 'Resolved') {
      publish('Science 104 projector restored - normal timetable resumes', 'CS210 students');
      pushActivity('Science 104 maintenance resolved', 'The projector is working again and the room is ready for classes.', 'green');
    }
    notify(`Maintenance ticket marked ${next.toLowerCase()}.`);
  };

  const markAttendance = () => {
    updateRow('attendance', 'at1', { Present: '27 / 31', Percentage: '87%', Signal: 'On track' });
    pushActivity('CS210 attendance saved', 'The class register was recorded and student attendance has refreshed.', 'green');
    notify('CS210 attendance saved for today.');
  };

  const payInvoice = () => {
    updateRow('finance', 'f1', { Status: 'Paid' });
    pushActivity('Fee payment recorded', "Jordan Davis' Fall invoice is now marked paid.", 'green');
    notify('Demo payment complete. Receipt is now available.');
  };

  const bookRoom = () => {
    const room = tables.rooms.find((row) => row.id === 'r3');
    if (!room || room.Status !== 'Available') {
      notify('Library 2F is already booked.');
      return;
    }
    updateRow('rooms', 'r3', { Availability: 'Booked 15:00-16:00', Status: 'Booked' });
    pushActivity('Library 2F reservation created', 'The room is held for Jordan Davis from 15:00 to 16:00.', 'green');
    notify('Library 2F is booked for 15:00-16:00.');
  };

  const openDraft = (module: ModuleKey, title: string, hint: string, status = 'Submitted') => {
    setDraftName('');
    setDraftStatus(status);
    setDraftValues(Object.fromEntries(Object.keys(tables[module][0] ?? {}).filter((key) => key !== 'id' && key !== 'Status').map((key) => [key, ''])));
    setDraftCategory('Safety');
    setDraftPriority('Medium');
    setDraftModal({ module, title, hint });
  };

  const addRecord = (event: FormEvent) => {
    event.preventDefault();
    if (!draftModal || !draftName.trim()) return;

    const id = `${draftModal.module}-${Date.now()}`;
    let record: TableRow;

    if (draftModal.module === 'complaints') {
      record = {
        id,
        'Case reference': `CF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        Category: draftCategory,
        Summary: draftName.trim(),
        Priority: draftPriority,
        Status: 'Submitted',
      };
      setOwnedComplaintIds((current) => ({ ...current, [user?.id ?? 'demo']: [...(current[user?.id ?? 'demo'] ?? []), id] }));
    } else {
      const rows = tables[draftModal.module];
      const headers = rows.length ? Object.keys(rows[0]).filter((key) => key !== 'id') : ['Item', 'Status'];
      record = { id };
      headers.forEach((header, index) => {
        record[header] = header === 'Status' ? draftStatus : index === 0 ? draftName.trim() : draftValues[header]?.trim() ?? '';
      });
    }

    setTables((current) => ({
      ...current,
      [draftModal.module]: [record, ...current[draftModal.module]],
    }));

    pushActivity(`${draftModal.title} added`, draftModal.module === 'complaints' ? 'An anonymous report was submitted for confidential review.' : `${draftName.trim()} was saved in ${pageTitle(draftModal.module)}.`, 'blue');
    setDraftModal(null);
    notify(`${draftModal.title} saved.`);
  };

  if (!user) {
    return <Login onSignIn={signIn} />;
  }

  const allowedModules = modules.filter((item) => item.roles.includes(user.role));
  const groups = Array.from(new Set(allowedModules.map((item) => item.group)));
  const selected = page === 'dashboard' ? null : modules.find((item) => item.key === page) ?? null;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">?</span>
          <span>CampusFlow</span>
        </div>

        <div className="university-card">
          <small>UNIVERSITY WORKSPACE</small>
          <b>Northbridge University</b>
          <span>Fall term 2026</span>
        </div>

        <nav className="nav" aria-label="CampusFlow navigation">
          <button className={page === 'dashboard' ? 'active' : ''} onClick={() => { setPage('dashboard'); setSidebarOpen(false); }}>
            <span>?</span> Overview
          </button>

          {groups.map((group) => (
            <div key={group} className="nav-group">
              <p>{group}</p>
              {allowedModules.filter((item) => item.group === group).map((item) => (
                <button key={item.key} className={page === item.key ? 'active' : ''} onClick={() => { setPage(item.key); setSidebarOpen(false); }}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="account">
          <div className="avatar">{user.initials}</div>
          <div>
            <b>{user.name}</b>
            <small>{roleLabel(user.role)}</small>
          </div>
          <button className="signout" onClick={() => { void endSession(); setUser(null); }} title="Sign out">?</button>
        </div>
      </aside>

      <div className="scrim" onClick={() => setSidebarOpen(false)} />

      <main className="main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(true)}>?</button>
          <div className="breadcrumb">Workspace <span>/</span> <b>{pageTitle(page)}</b></div>
          <div className="top-actions">
            <span className="mode"><i />{dataMode}</span>
            <span className="date">{today}</span>
            <button className="notification" onClick={() => notify('Three items need attention: a clash, a ticket, and a service request.')}>?<i /></button>
          </div>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">{roleLabel(user.role)} portal</span>
            <h1>{page === 'dashboard' ? `Good morning, ${user.name.split(' ')[0]}.` : selected?.label}</h1>
            <p>
              {page === 'dashboard'
                ? 'Manage the academic day, campus operations, and student services from one trusted workspace.'
                : selected?.description}
            </p>
          </div>

          {page === 'dashboard' && (
            <button className="primary" onClick={() => setPage(user.role === 'staff' ? 'maintenance' : user.role === 'student' ? 'requests' : 'timetable')}>
              Open priority work <span>?</span>
            </button>
          )}
        </section>

        {page === 'dashboard' ? (
          <Dashboard
            user={user}
            tables={tables}
            activity={activity}
            navigate={setPage}
            resolveClash={resolveClash}
            progressTicket={progressTicket}
          />
        ) : selected && (
          <ModulePage
            user={user}
            module={selected.key}
            tables={tables}
            search={search}
            setSearch={setSearch}
            resolveClash={resolveClash}
            progressTicket={progressTicket}
            markAttendance={markAttendance}
            payInvoice={payInvoice}
            bookRoom={bookRoom}
            openDraft={openDraft}
            updateRow={updateRow}
            notify={notify}
            ownedComplaintIds={ownedComplaintIds[user.id] ?? []}
          />
        )}
      </main>

      {draftModal && (
        <DraftForm
          draft={draftModal}
          name={draftName}
          status={draftStatus}
          setName={setDraftName}
          setStatus={setDraftStatus}
          fields={Object.keys(tables[draftModal.module][0] ?? {}).filter((key) => key !== 'id' && key !== 'Status')}
          values={draftValues}
          setValues={setDraftValues}
          category={draftCategory}
          priority={draftPriority}
          setCategory={setDraftCategory}
          setPriority={setDraftPriority}
          onClose={() => setDraftModal(null)}
          onSubmit={addRecord}
        />
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}

function Login({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<boolean> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const signedIn = await onSignIn(email, password);
    if (!signedIn) setError('Use one of the demo account email and password pairs below.');
  };

  return (
    <div className="login-page">
      <section className="login-copy">
        <div className="brand"><span className="brand-mark">?</span>CampusFlow</div>
        <span className="eyebrow">University management, connected</span>
        <h1>Run campus operations from one reliable place.</h1>
        <p>Admissions, academics, facilities, finance, student support, and communication in one role-aware workspace.</p>
        <div className="login-highlights">
          <span>? Role-based access</span>
          <span>? Conflict-aware scheduling</span>
          <span>? Responsive for mobile</span>
        </div>
      </section>

      <section className="login-panel">
        <div>
          <span className="eyebrow">Demo access</span>
          <h2>Sign in to CampusFlow</h2>
          <p>Use a separate account to see each university role.</p>
        </div>

        <form onSubmit={submit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@campusflow.demo" type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
          </label>

          {error && <div className="form-error">{error}</div>}
          <button className="primary full" type="submit">Sign in</button>
        </form>

        <div className="demo-accounts">
          {users.map((account) => (
            <button key={account.id} onClick={() => { setEmail(account.email); setPassword(account.password); setError(''); }}>
              <span className="avatar">{account.initials}</span>
              <span>
                <b>{roleLabel(account.role)}</b>
                <small>{account.email} | {account.password}</small>
              </span>
              <em>Use</em>
            </button>
          ))}
        </div>

        <small className="demo-note">This app starts in seeded demo mode until Supabase credentials are added.</small>
      </section>
    </div>
  );
}

function Dashboard({ user, tables, activity, navigate, resolveClash, progressTicket }: {
  user: DemoUser;
  tables: Record<ModuleKey, TableRow[]>;
  activity: Activity[];
  navigate: (page: Page) => void;
  resolveClash: () => void;
  progressTicket: () => void;
}) {
  const stats = user.role === 'administrator'
    ? [
        ['Active students', '6,842', '+4.8%'],
        ['Open maintenance', String(tables.maintenance.filter((row) => row.Status !== 'Resolved').length), '4 high priority'],
        ['Timetable clashes', String(tables.timetable.filter((row) => row.Status === 'Room conflict').length), 'Needs action'],
        ['Fees due', '$84.2K', '18 Oct deadline'],
      ]
    : user.role === 'staff'
      ? [
          ['Classes today', '3', 'CS210 at 09:00'],
          ['Registers due', '1', 'Data Structures'],
          ['Open tickets', String(tables.maintenance.filter((row) => row.Status !== 'Resolved').length), 'Science 104 urgent'],
          ['Student requests', '2', 'Awaiting response'],
        ]
      : [
          ['Classes today', '4', 'Next: CS210'],
          ['My attendance', '87%', 'On track'],
          ['Fee balance', tables.finance.find((row) => row.Student === 'Jordan Davis')?.Status === 'Paid' ? '$0' : '$1,250', 'Due 18 Oct'],
          ['Open requests', String(tables.requests.filter((row) => row['Submitted by'] === 'Jordan Davis').length), 'Registrar review'],
        ];

  const quickCards = [
    { title: 'Academic management', copy: 'Track courses, attendance and timetable health in one place.', icon: '?', page: 'academics' as Page },
    { title: 'Room optimization', copy: 'Spot space conflicts early and reassign rooms before classes start.', icon: '?', page: 'rooms' as Page },
    { title: 'Anonymous complaints', copy: 'Students can raise issues privately while admins can resolve them without revealing identity.', icon: '⚐', page: 'complaints' as Page },
    { title: 'Finance pulse', copy: 'Monitor loans, scholarships and payment status across student records.', icon: '?', page: 'finance' as Page },
  ];

  return (
    <>
      <section className="stats">
        {stats.map(([label, value, detail]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <b>{value}</b>
            <small>{detail}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="card priority-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Live operations</span>
              <h2>Priority work center</h2>
            </div>
            <button className="text-button" onClick={() => navigate('analytics')}>View reports ?</button>
          </div>

          <div className="priority-list">
            <div className="priority-item">
              <span className="priority-icon conflict">!</span>
              <section>
                <b>CS240 has a room conflict</b>
                <p>Science 104 is assigned to two Monday 09:00 classes.</p>
              </section>
              {user.role === 'administrator' ? <button className="secondary" onClick={resolveClash}>Resolve clash</button> : <button className="secondary" onClick={() => navigate('timetable')}>View timetable</button>}
            </div>

            <div className="priority-item">
              <span className="priority-icon repair">?</span>
              <section>
                <b>Projector issue in Science 104</b>
                <p>Facilities is assigned before the next teaching block.</p>
              </section>
              {user.role === 'student' ? <button className="secondary" onClick={() => navigate('announcements')}>View update</button> : <button className="secondary" onClick={progressTicket}>Update ticket</button>}
            </div>

            <div className="priority-item">
              <span className="priority-icon request">?</span>
              <section>
                <b>Student support requests need review</b>
                <p>One transcript and one IT service request are in progress.</p>
              </section>
              <button className="secondary" onClick={() => navigate('requests')}>Open desk</button>
            </div>
          </div>
        </article>

        <CampusAssistant user={user} tables={tables} />
      </section>

      <section className="quick-grid">
        {quickCards.map((card) => (
          <QuickCard
            key={card.title}
            title={card.title}
            copy={card.copy}
            icon={card.icon}
            onClick={() => navigate(card.page)}
          />
        ))}
      </section>

      <section className="card activity-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Audit trail</span>
            <h2>Recent activity</h2>
          </div>
        </div>

        <div className="activity-list">
          {activity.map((item) => (
            <div className="activity" key={item.id}>
              <i className={item.tone} />
              <div>
                <b>{item.title}</b>
                <p>{item.detail}</p>
              </div>
              <small>{item.time}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function CampusAssistant({ user, tables }: { user: DemoUser; tables: Record<ModuleKey, TableRow[]> }) {
  const prompts = [
    'Where can the CS240 class be moved?',
    'How is attendance looking in CS210?',
    'Is there anything urgent in facilities?',
    'What is the billing status for Jordan Davis?',
  ];

  const [question, setQuestion] = useState(prompts[0]);
  const [answer, setAnswer] = useState(getAssistantAnswer(prompts[0], tables, user));

  const ask = (value: string) => {
    setQuestion(value);
    setAnswer(getAssistantAnswer(value, tables, user));
  };

  return (
    <article className="card assistant-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Campus AI</span>
          <h2>Smart campus assistant</h2>
        </div>
      </div>

      <div className="assistant-prompt-list">
        {prompts.map((prompt) => (
          <button key={prompt} className={question === prompt ? 'active' : ''} onClick={() => ask(prompt)}>{prompt}</button>
        ))}
      </div>

      <div className="assistant-answer">
        <p className="assistant-label">Question</p>
        <b>{question}</b>
        <p className="assistant-label">Answer</p>
        <p>{answer}</p>
      </div>
    </article>
  );
}

function getAssistantAnswer(question: string, tables: Record<ModuleKey, TableRow[]>, user: DemoUser) {
  const q = question.toLowerCase();

  if (q.includes('cs240') || q.includes('room') || q.includes('move')) {
    return 'The best option is to move CS240 to Innovation Lab on Monday 09:00. That room is free and avoids the conflict with Science 104 while keeping the timetable disruption low.';
  }

  if (q.includes('attendance') || q.includes('cs210')) {
    return 'The current attendance trend for CS210 is healthy: Jordan Davis is at 87%, and the support threshold remains above the 75% campus safety line. Faculty can intervene early if attendance drops below the risk band.';
  }

  if (q.includes('facility') || q.includes('maintenance') || q.includes('urgent')) {
    return 'Science 104 has a high-priority projector issue assigned to facilities. The current fix path is to resolve the ticket, confirm room readiness, and notify teaching staff before the next lecture block.';
  }

  if (q.includes('billing') || q.includes('fee') || q.includes('payment') || q.includes('jordan')) {
    const record = tables.finance.find((row) => row.Student === 'Jordan Davis');
    if (record?.Status === 'Paid') return 'Jordan Davis has already paid the Fall invoice. The account is in good standing and no further action is needed.';
    return 'Jordan Davis currently has a $1,250 fee due on 18 Oct. The payment reminder is active, and the system is tracking a payment follow-up for the student records team.';
  }

  if (user.role === 'student') {
    return 'CampusFlow recommends checking your timetable, attendance, and service requests before the next teaching day so you can act early on any disruptions.';
  }

  return 'CampusFlow is designed to detect scheduling, facilities, and student-service risks early so the university can act before they affect daily operations.';
}

function QuickCard({ title, copy, icon, onClick }: { title: string; copy: string; icon: string; onClick: () => void }) {
  return (
    <button className="quick-card" onClick={onClick}>
      <span>{icon}</span>
      <section>
        <b>{title}</b>
        <p>{copy}</p>
      </section>
      <em>?</em>
    </button>
  );
}

type ModulePageProps = {
  user: DemoUser;
  module: ModuleKey;
  tables: Record<ModuleKey, TableRow[]>;
  search: string;
  setSearch: (value: string) => void;
  resolveClash: () => void;
  progressTicket: () => void;
  markAttendance: () => void;
  payInvoice: () => void;
  bookRoom: () => void;
  openDraft: (module: ModuleKey, title: string, hint: string, status?: string) => void;
  updateRow: (module: ModuleKey, id: string, changes: Record<string, string>) => void;
  notify: (message: string) => void;
  ownedComplaintIds: string[];
};

function ModulePage(props: ModulePageProps) {
  const { user, module, tables, search, setSearch, openDraft, updateRow, notify, ownedComplaintIds } = props;
  const definition = modules.find((item) => item.key === module)!;
  const rows = tables[module];
  const headers = rows.length ? Object.keys(rows[0]).filter((key) => key !== 'id') : [];
  const visibleRows = useMemo(() => rows.filter((row) => {
    const isOwnComplaint = module !== 'complaints' || user.role !== 'student' || ownedComplaintIds.includes(row.id);
    return isOwnComplaint && Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase());
  }), [rows, search, module, user.role, ownedComplaintIds]);

  const action = module === 'timetable' && user.role === 'administrator'
    ? { label: 'Resolve detected clash', run: props.resolveClash }
    : module === 'maintenance'
      ? { label: tables.maintenance.find((row) => row.id === 'm1')?.Status === 'Resolved' ? 'Projector resolved' : 'Progress Science 104 ticket', run: props.progressTicket }
      : module === 'attendance' && user.role === 'staff'
        ? { label: "Save today's register", run: props.markAttendance }
        : module === 'finance' && user.role === 'student'
          ? { label: 'Pay demo invoice', run: props.payInvoice }
          : module === 'rooms' && user.role !== 'administrator' && tables.rooms.find((row) => row.id === 'r3')?.Status === 'Available'
            ? { label: 'Book Library 2F', run: props.bookRoom }
            : null;

  const canCreate = module === 'complaints'
    ? user.role === 'student'
    : module !== 'rooms' && (user.role === 'administrator' || ['maintenance', 'requests', 'events', 'documents'].includes(module)) && !(module === 'finance' && user.role === 'student');
  const createTitle = module === 'maintenance' ? 'Report issue' : module === 'requests' ? 'New service request' : module === 'complaints' ? 'Submit complaint' : module === 'finance' ? 'Create invoice' : module === 'rooms' ? 'New booking' : `Add ${definition.label.slice(0, -1) || 'record'}`;

  const advanceRequest = (row: TableRow) => {
    const current = row.Status;
    const next = current === 'Submitted' ? 'Under review' : current === 'Under review' ? 'Approved' : current === 'Approved' ? 'Completed' : current;
    updateRow(module, row.id, { Status: next });
    notify(`Request moved to ${next.toLowerCase()}.`);
  };

  const advanceComplaint = (row: TableRow) => {
    const next = row.Status === 'Submitted' ? 'Under review' : row.Status === 'Under review' || row.Status === 'Escalated' ? 'Resolved' : row.Status;
    if (next === row.Status) return;

    updateRow(module, row.id, { Status: next });
    notify(next === 'Resolved' ? 'Complaint resolved. The reporter can see the updated status.' : 'Complaint moved to internal review.');
  };

  return (
    <section className="module-page">
      <div className="module-toolbar">
        <label className="search">
          <span>?</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${definition.label.toLowerCase()}...`} />
        </label>

        <div>
          {action && <button className="secondary" onClick={action.run}>{action.label}</button>}
          {canCreate && (
            <button className="primary" onClick={() => openDraft(module, createTitle, `Add a record to ${definition.label}.`, module === 'maintenance' ? 'New' : 'Submitted')}>
              + {createTitle}
            </button>
          )}
        </div>
      </div>

      {module === 'timetable' && <ConflictBanner onResolve={props.resolveClash} resolved={tables.timetable.find((row) => row.id === 't2')?.Status === 'Rescheduled'} />}
      {module === 'attendance' && user.role === 'student' && (
        <div className="insight-banner">
          <span>?</span>
          <div>
            <b>You are on track.</b>
            <p>Your attendance is 87% in CS210. The university support threshold is 75%.</p>
          </div>
        </div>
      )}
      {module === 'analytics' && <Analytics />}
      {module === 'complaints' && (
        <div className="insight-banner">
          <span>i</span>
          <div>
            <b>{user.role === 'student' ? 'Private case tracking' : 'Identity-free review'}</b>
            <p>{user.role === 'student'
              ? 'Your reports appear here by case reference. No student ID or name is included in the report.'
              : 'Reviewers see the report details and case reference only. This seeded demo does not collect reporter identity.'}</p>
          </div>
        </div>
      )}
      {module === 'maintenance' && (
        <div className="insight-banner amber">
          <span>?</span>
          <div>
            <b>High-priority room issue is being handled.</b>
            <p>The Science 104 projector affects scheduled teaching. Facilities updates appear here in real time.</p>
          </div>
        </div>
      )}

      <article className="card table-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{visibleRows.length} {visibleRows.length === 1 ? 'record' : 'records'}</span>
            <h2>{definition.label}</h2>
          </div>
          <small>Use the status controls to demonstrate each workflow.</small>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((header) => <th key={header}>{header}</th>)}
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.length ? (
                visibleRows.map((row) => (
                  <tr key={row.id}>
                    {headers.map((header) => (
                      <td key={header}>
                        {header === 'Status' || header === 'Signal' || header === 'Decision' || header === 'Availability'
                          ? <Status value={row[header]} />
                          : row[header]}
                      </td>
                    ))}

                    <td className="action-cell">
                      {module === 'requests' && user.role !== 'student' && (
                        <button className="secondary tiny" onClick={() => advanceRequest(row)}>Advance</button>
                      )}
                      {module === 'complaints' && user.role !== 'student' && row.Status !== 'Resolved' && (
                        <button className="secondary tiny" onClick={() => advanceComplaint(row)}>{row.Status === 'Submitted' ? 'Start review' : 'Resolve'}</button>
                      )}
                      {module === 'maintenance' && user.role === 'staff' && (
                        <button className="secondary tiny" onClick={props.progressTicket}>Update</button>
                      )}
                      {module === 'finance' && user.role === 'student' && (
                        <button className="secondary tiny" onClick={props.payInvoice}>Pay</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} className="empty-state">No matching records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function Status({ value }: { value: string }) {
  const status = value.toLowerCase().replace(/ /g, '-');
  return <span className={`status ${status}`}>{value}</span>;
}

function ConflictBanner({ onResolve, resolved }: { onResolve: () => void; resolved: boolean }) {
  return resolved ? (
    <div className="insight-banner">
      <span>?</span>
      <div>
        <b>Timetable conflict resolved.</b>
        <p>CS240 now runs in Innovation Lab. Affected students received the updated schedule.</p>
      </div>
    </div>
  ) : (
    <div className="insight-banner danger">
      <span>!</span>
      <div>
        <b>One scheduling conflict needs a decision.</b>
        <p>Science 104 is double-booked Monday at 09:00. Innovation Lab is available.</p>
      </div>
      <button className="secondary" onClick={onResolve}>Move CS240</button>
    </div>
  );
}

function Analytics() {
  return (
    <div className="analytics-strip">
      <div>
        <span>Attendance risk</span>
        <b>73 students</b>
        <small>12 new this week</small>
      </div>
      <div>
        <span>Room utilization</span>
        <b>78%</b>
        <small>? 6% this term</small>
      </div>
      <div>
        <span>Fee collection</span>
        <b>91%</b>
        <small>$84.2K outstanding</small>
      </div>
    </div>
  );
}

function DraftForm({ draft, name, status, setName, setStatus, category, priority, setCategory, setPriority, fields, values, setValues, onClose, onSubmit }: {
  draft: NonNullable<DraftModal>;
  name: string;
  status: string;
  setName: (value: string) => void;
  setStatus: (value: string) => void;
  category: string;
  priority: string;
  setCategory: (value: string) => void;
  setPriority: (value: string) => void;
  fields: string[];
  values: Record<string, string>;
  setValues: (value: Record<string, string>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="Close">x</button>
        <span className="eyebrow">CampusFlow workflow</span>
        <h2>{draft.title}</h2>
        <p>{draft.hint}</p>

        {draft.module === 'complaints' ? (
          <>
            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Safety</option>
                <option>Facilities</option>
                <option>Academic</option>
                <option>Harassment or conduct</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              What happened?
              <textarea required maxLength={500} value={name} onChange={(event) => setName(event.target.value)} placeholder="Describe the concern without including your name or student ID." />
            </label>
            <label>
              Urgency
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <small>Your case reference lets you track the status. Do not include identifying details in the report.</small>
          </>
        ) : (
          <>
            <label>
              {fields[0] ?? 'Name or summary'}
              <input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder={`Enter ${fields[0]?.toLowerCase() ?? 'a clear description'}`} />
            </label>
            {fields.slice(1).map((field) => (
              <label key={field}>
                {field}
                <input required value={values[field] ?? ''} onChange={(event) => setValues({ ...values, [field]: event.target.value })} placeholder={`Enter ${field.toLowerCase()}`} />
              </label>
            ))}
            <label>
              Starting status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>Submitted</option>
                <option>New</option>
                <option>Pending</option>
                <option>Under review</option>
              </select>
            </label>
          </>
        )}

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" type="submit">Save record</button>
        </div>
      </form>
    </div>
  );
}
