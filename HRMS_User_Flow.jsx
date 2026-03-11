import { useState, useEffect, useRef } from "react";

const ROLES = [
  { id: "super_admin", label: "Super Admin", color: "#6366f1", bg: "#1e1b4b", icon: "⚡", desc: "Full platform control" },
  { id: "hr_admin",    label: "HR Admin",    color: "#0ea5e9", bg: "#082f49", icon: "🏢", desc: "Full HR operations" },
  { id: "manager",     label: "Manager",     color: "#10b981", bg: "#052e16", icon: "👥", desc: "Team lead access" },
  { id: "employee",    label: "Employee",    color: "#f59e0b", bg: "#1c1400", icon: "👤", desc: "Self-service portal" },
  { id: "recruiter",   label: "Recruiter",   color: "#ec4899", bg: "#2d0a1a", icon: "🎯", desc: "ATS & hiring" },
  { id: "finance",     label: "Finance",     color: "#14b8a6", bg: "#022c22", icon: "💰", desc: "Payroll & expenses" },
  { id: "auditor",     label: "Auditor",     color: "#a78bfa", bg: "#1a0535", icon: "🔍", desc: "Read-only audit" },
];

const FLOWS = {
  super_admin: [
    {
      phase: "Platform Setup",
      color: "#6366f1",
      steps: [
        { action: "Login to admin portal", detail: "JWT auth + TOTP MFA required", type: "auth" },
        { action: "Create Tenant", detail: "Name, subdomain, plan, region, currency", type: "create" },
        { action: "Configure Global Settings", detail: "Feature flags, rate limits, email templates", type: "config" },
        { action: "Set Billing & Plan Limits", detail: "Max employees, storage quotas", type: "config" },
        { action: "Monitor All Tenants", detail: "Dashboard: health, usage, billing status", type: "view" },
      ]
    },
    {
      phase: "Tenant Management",
      color: "#818cf8",
      steps: [
        { action: "View All Tenant List", detail: "Filter by plan, region, status", type: "view" },
        { action: "Suspend / Reactivate Tenant", detail: "Immediate access block + email", type: "action" },
        { action: "Impersonate HR Admin", detail: "Scoped session for support", type: "action" },
        { action: "View System Audit Logs", detail: "Cross-tenant action history", type: "view" },
        { action: "Manage Integrations", detail: "Slack, Zoom, SSO providers globally", type: "config" },
        { action: "Review Background Jobs", detail: "Celery queue: retry failed tasks", type: "action" },
      ]
    },
    {
      phase: "RBAC & Security",
      color: "#a5b4fc",
      steps: [
        { action: "Create Custom Roles", detail: "Module + action + scope assignments", type: "create" },
        { action: "Assign Permissions", detail: "Granular: view | create | update | delete | approve", type: "config" },
        { action: "IP Allowlist Config", detail: "Per-tenant geo-restriction", type: "config" },
        { action: "Force MFA Policy", detail: "Mandate MFA for sensitive roles", type: "config" },
        { action: "Review Security Events", detail: "Failed logins, lockouts, anomalies", type: "view" },
      ]
    }
  ],

  hr_admin: [
    {
      phase: "Employee Lifecycle",
      color: "#0ea5e9",
      steps: [
        { action: "Receive Hire Signal", detail: "From Recruiter: offer accepted → trigger", type: "trigger" },
        { action: "Create Employee Profile", detail: "Personal, contact, employment details", type: "create" },
        { action: "Auto-generate Emp Code", detail: "EMP-XXXX sequential per tenant", type: "auto" },
        { action: "Assign Department & Designation", detail: "Set manager, work location, shift", type: "config" },
        { action: "Set Salary Structure", detail: "Grade → components → monthly breakdown", type: "create" },
        { action: "Create User Account", detail: "Auto: email sent with temp password", type: "auto" },
        { action: "Initiate Onboarding", detail: "Select template → assign tasks by role", type: "create" },
      ]
    },
    {
      phase: "Daily HR Operations",
      color: "#38bdf8",
      steps: [
        { action: "Approve Leave Requests", detail: "View calendar conflicts → approve/reject with note", type: "action" },
        { action: "Review Attendance Anomalies", detail: "Late, absent, regularisation queue", type: "review" },
        { action: "Handle Regularisation", detail: "Verify geo-stamp → approve correction", type: "action" },
        { action: "Manage Leave Policies", detail: "Annual, sick, maternity allocations", type: "config" },
        { action: "Generate Documents", detail: "Appointment, experience, warning letters", type: "create" },
        { action: "Upload Employee Documents", detail: "Contract, ID proof, certificates (S3)", type: "create" },
        { action: "Monitor Expiring Documents", detail: "Visa, ID — alert 30 days prior", type: "alert" },
      ]
    },
    {
      phase: "Payroll Cycle",
      color: "#7dd3fc",
      steps: [
        { action: "Initiate Payroll Run", detail: "Select period: month start → end", type: "create" },
        { action: "System Calculates Components", detail: "Async Celery: basic, HRA, PF, TDS…", type: "auto" },
        { action: "Review Anomalies", detail: "Flag: new joins, exits, LOP, arrears", type: "review" },
        { action: "Override If Needed", detail: "Manual component override per employee", type: "action" },
        { action: "Send to Finance for Approval", detail: "Finance reviews → approve / reject", type: "action" },
        { action: "Generate & Email Payslips", detail: "PDF generated → employee email + portal", type: "auto" },
        { action: "Export Bank Transfer File", detail: "NEFT/bank-specific format", type: "export" },
        { action: "File Statutory Returns", detail: "PF/ESI/TDS challans logged", type: "action" },
      ]
    },
    {
      phase: "Offboarding",
      color: "#bae6fd",
      steps: [
        { action: "Initiate Exit Process", detail: "Set last working day, exit type", type: "create" },
        { action: "Assign Offboarding Tasks", detail: "IT asset return, access revoke, handover", type: "create" },
        { action: "Conduct Exit Interview", detail: "Schedule with HR, record responses", type: "action" },
        { action: "Full & Final Clearance", detail: "All tasks done → FnF calculation", type: "action" },
        { action: "Generate Relieving Letter", detail: "Auto from template → email candidate", type: "auto" },
        { action: "Revoke System Access", detail: "User deactivated, sessions invalidated", type: "auto" },
      ]
    }
  ],

  manager: [
    {
      phase: "Team Oversight",
      color: "#10b981",
      steps: [
        { action: "View Team Dashboard", detail: "Who's present / on leave / WFH today", type: "view" },
        { action: "Browse Team Directory", detail: "Direct reports: profiles, contact, docs", type: "view" },
        { action: "View Org Chart", detail: "Hierarchy under their node", type: "view" },
        { action: "Check Attendance Reports", detail: "Team month-view: late, absent, OT", type: "view" },
      ]
    },
    {
      phase: "Leave & Attendance",
      color: "#34d399",
      steps: [
        { action: "Receive Leave Request Notification", detail: "Email + in-app push", type: "trigger" },
        { action: "Check Team Calendar", detail: "Conflicts with other leaves / holidays", type: "view" },
        { action: "Approve or Reject with Note", detail: "Employee notified immediately", type: "action" },
        { action: "Review Regularisation Requests", detail: "Verify reason → approve attendance fix", type: "action" },
        { action: "Approve Overtime Claims", detail: "Validate hours → forward to Finance", type: "action" },
      ]
    },
    {
      phase: "Performance",
      color: "#6ee7b7",
      steps: [
        { action: "Set Team Goals / OKRs", detail: "Linked to review cycle, weighted", type: "create" },
        { action: "Conduct Performance Review", detail: "Manager rating + qualitative feedback", type: "action" },
        { action: "Rate Each Competency", detail: "Technical, communication, leadership (1-5)", type: "action" },
        { action: "Calibration Meeting", detail: "Bell-curve review with HR Admin", type: "view" },
        { action: "Publish Final Ratings", detail: "Employees notified, ratings locked", type: "action" },
        { action: "Assign Training Courses", detail: "Based on skill gaps from review", type: "create" },
      ]
    },
    {
      phase: "Expense Approvals",
      color: "#a7f3d0",
      steps: [
        { action: "Receive Expense Claim Alert", detail: "Employee submits → manager notified", type: "trigger" },
        { action: "Review Receipt & Amount", detail: "Check against policy limits", type: "review" },
        { action: "Approve or Reject", detail: "Rejection requires reason; employee notified", type: "action" },
        { action: "Approved Claims → Finance", detail: "Second approval if amount > threshold", type: "action" },
      ]
    }
  ],

  employee: [
    {
      phase: "Onboarding (Day 1)",
      color: "#f59e0b",
      steps: [
        { action: "Receive Welcome Email", detail: "Login credentials + onboarding guide", type: "trigger" },
        { action: "First Login & Password Change", detail: "Forced change + optional MFA setup", type: "auth" },
        { action: "Complete Profile", detail: "Photo, personal info, bank details, emergency contact", type: "create" },
        { action: "View Onboarding Checklist", detail: "Task list: IT setup, policy reads, training", type: "view" },
        { action: "Sign Digital Documents", detail: "Appointment letter, NDA, policies", type: "action" },
        { action: "Enroll in Mandatory Training", detail: "POSH, Security, Compliance courses", type: "action" },
      ]
    },
    {
      phase: "Daily Self-Service",
      color: "#fbbf24",
      steps: [
        { action: "Check-in (Web / Mobile)", detail: "Geo-verified or biometric; logs timestamp", type: "action" },
        { action: "View Own Attendance", detail: "Monthly log: check-in/out, hours, OT", type: "view" },
        { action: "Apply for Leave", detail: "Select type, dates, reason → manager notified", type: "create" },
        { action: "Track Leave Balance", detail: "Real-time: allocated / used / pending / remaining", type: "view" },
        { action: "Request Regularisation", detail: "Forgot check-in? Submit with reason", type: "create" },
        { action: "Submit Expense Claim", detail: "Category, amount, receipt photo → manager", type: "create" },
        { action: "Check-out", detail: "End-of-day; overtime auto-calculated", type: "action" },
      ]
    },
    {
      phase: "Payroll & Documents",
      color: "#fcd34d",
      steps: [
        { action: "View Monthly Payslip", detail: "Component breakdown: earnings, deductions, net", type: "view" },
        { action: "Download Payslip PDF", detail: "Password-protected PDF from S3", type: "export" },
        { action: "View Form 16 / Tax Summary", detail: "Annual tax computation", type: "view" },
        { action: "Update Bank Details", detail: "Salary credit account (HR approval needed)", type: "action" },
        { action: "View & Download Documents", detail: "Contract, experience, offer letter", type: "view" },
      ]
    },
    {
      phase: "Performance & Growth",
      color: "#fde68a",
      steps: [
        { action: "Receive Review Invite", detail: "Notification: cycle started, due date", type: "trigger" },
        { action: "Complete Self-Assessment", detail: "Rate own performance, comment on goals", type: "action" },
        { action: "Update Goal Progress", detail: "Drag progress bar 0→100%", type: "action" },
        { action: "View Final Rating", detail: "After manager submits and HR publishes", type: "view" },
        { action: "Browse & Enroll in Courses", detail: "Catalogue: filter by category / duration", type: "action" },
        { action: "Track Course Progress", detail: "Resume video, take quiz, earn certificate", type: "action" },
      ]
    }
  ],

  recruiter: [
    {
      phase: "Job Posting",
      color: "#ec4899",
      steps: [
        { action: "Receive Hiring Request", detail: "HR Admin / Manager raises manpower requisition", type: "trigger" },
        { action: "Create Job Posting", detail: "Title, dept, JD, salary range, openings", type: "create" },
        { action: "Set Sourcing Channels", detail: "LinkedIn, Naukri, Indeed, internal referral", type: "config" },
        { action: "Publish Job", detail: "Status: draft → open; public URL generated", type: "action" },
        { action: "Share Job Link", detail: "Copy link for social / email distribution", type: "action" },
      ]
    },
    {
      phase: "Application Screening",
      color: "#f472b6",
      steps: [
        { action: "Applications Flow In", detail: "Auto-captured from all channels", type: "trigger" },
        { action: "AI Resume Scoring", detail: "NLP: match JD vs resume → 0-100 score", type: "auto" },
        { action: "Review Applications", detail: "Kanban: Applied → Screened → Interview", type: "review" },
        { action: "Shortlist Candidates", detail: "Move to pipeline; rejection email auto-sent", type: "action" },
        { action: "Parse & Enrich Resume", detail: "Auto-extract skills, experience, education", type: "auto" },
      ]
    },
    {
      phase: "Interview Process",
      color: "#fb7185",
      steps: [
        { action: "Schedule HR Round", detail: "Pick interviewer, date/time, video link", type: "create" },
        { action: "Send Invite to Candidate", detail: "Email with meet link + calendar ICS", type: "auto" },
        { action: "Conduct & Record Feedback", detail: "Interviewer rates: 1-5, outcome, comments", type: "action" },
        { action: "Schedule Tech / Final Round", detail: "Based on HR outcome → next round", type: "create" },
        { action: "Pipeline Status Updates", detail: "Candidate notified at each stage", type: "auto" },
        { action: "Reject with Reason", detail: "Rejection email sent; candidate archived", type: "action" },
      ]
    },
    {
      phase: "Offer & Hire",
      color: "#fda4af",
      steps: [
        { action: "Generate Offer Letter", detail: "Select template + fill salary/role/date", type: "create" },
        { action: "Send Offer to Candidate", detail: "Email with secure link; 7-day expiry", type: "action" },
        { action: "Candidate Accepts / Rejects", detail: "Digital signature captured; HR notified", type: "trigger" },
        { action: "On Accept → Notify HR Admin", detail: "Trigger: create employee profile flow", type: "auto" },
        { action: "Close Job Posting", detail: "Status → filled; analytics captured", type: "action" },
        { action: "Track Hiring Metrics", detail: "Time-to-hire, funnel conversion, source ROI", type: "view" },
      ]
    }
  ],

  finance: [
    {
      phase: "Payroll Approval",
      color: "#14b8a6",
      steps: [
        { action: "Receive Payroll Review Alert", detail: "HR Admin computed run → Finance notified", type: "trigger" },
        { action: "Review Payroll Summary", detail: "Total gross, deductions, net, headcount", type: "review" },
        { action: "Drill Into Employee Payslips", detail: "Spot-check outliers: high OT, new joins", type: "review" },
        { action: "Verify Statutory Deductions", detail: "PF, ESI, TDS, PT correctness", type: "review" },
        { action: "Approve or Reject Run", detail: "Rejection sends back to HR with notes", type: "action" },
        { action: "Disburse Payroll", detail: "Export bank transfer file (NEFT format)", type: "export" },
        { action: "File Challans", detail: "Log PF/ESI/TDS filing reference numbers", type: "action" },
      ]
    },
    {
      phase: "Expense Management",
      color: "#2dd4bf",
      steps: [
        { action: "Review High-Value Claims", detail: "Claims above policy threshold land here", type: "trigger" },
        { action: "Validate Receipt vs Policy", detail: "Category limit check, duplicate detection", type: "review" },
        { action: "Approve or Reject", detail: "Employee notified; approval chain logged", type: "action" },
        { action: "Mark Claims Reimbursed", detail: "Paid via payroll or direct bank transfer", type: "action" },
        { action: "Expense Analytics", detail: "By category, dept, month; budget vs actual", type: "view" },
      ]
    },
    {
      phase: "Reporting & Compliance",
      color: "#5eead4",
      steps: [
        { action: "Monthly Payroll Cost Report", detail: "Dept-wise, grade-wise cost breakdown", type: "view" },
        { action: "Year-to-Date Tax Summary", detail: "Per employee TDS computation", type: "view" },
        { action: "Headcount Cost Analysis", detail: "Hiring cost vs attrition cost model", type: "view" },
        { action: "Export Reports", detail: "XLSX/PDF async export → email link", type: "export" },
        { action: "Statutory Compliance Tracker", detail: "PF/ESI filing calendar, overdue alerts", type: "view" },
      ]
    }
  ],

  auditor: [
    {
      phase: "Audit Access",
      color: "#a78bfa",
      steps: [
        { action: "Login (MFA Mandatory)", detail: "TOTP enforced for all auditor logins", type: "auth" },
        { action: "View Audit Log Dashboard", detail: "Action frequency: CREATE / UPDATE / DELETE", type: "view" },
        { action: "Filter Audit Trail", detail: "By actor, model, action, date range, IP", type: "view" },
        { action: "Inspect Change Diffs", detail: "old_value → new_value JSON comparison", type: "view" },
        { action: "Export Audit Log", detail: "CSV export for compliance filing", type: "export" },
      ]
    },
    {
      phase: "Read-Only Data Access",
      color: "#c4b5fd",
      steps: [
        { action: "Browse All Employees", detail: "View-only; no edit actions available", type: "view" },
        { action: "View Payroll Runs", detail: "All historical runs, payslips, statutory filings", type: "view" },
        { action: "Review Leave Records", detail: "Approvals, balances, policy compliance", type: "view" },
        { action: "Inspect Attendance Logs", detail: "Check-in/out, regularisations, overtime", type: "view" },
        { action: "View Recruitment History", detail: "Job postings, applications, offers", type: "view" },
        { action: "Read Asset Register", detail: "Assignments, condition, disposal history", type: "view" },
        { action: "Generate Compliance Report", detail: "Headcount, payroll, attendance summary", type: "view" },
      ]
    }
  ]
};

const TYPE_STYLES = {
  auth:    { bg: "#312e81", border: "#818cf8", dot: "#818cf8", label: "AUTH" },
  create:  { bg: "#052e16", border: "#22c55e", dot: "#22c55e", label: "CREATE" },
  config:  { bg: "#1c1917", border: "#d97706", dot: "#d97706", label: "CONFIG" },
  view:    { bg: "#082f49", border: "#38bdf8", dot: "#38bdf8", label: "VIEW" },
  action:  { bg: "#2d0a1a", border: "#f43f5e", dot: "#f43f5e", label: "ACTION" },
  auto:    { bg: "#1a0535", border: "#a78bfa", dot: "#a78bfa", label: "AUTO" },
  trigger: { bg: "#451a03", border: "#fb923c", dot: "#fb923c", label: "TRIGGER" },
  review:  { bg: "#022c22", border: "#34d399", dot: "#34d399", label: "REVIEW" },
  export:  { bg: "#0c4a6e", border: "#38bdf8", dot: "#38bdf8", label: "EXPORT" },
  alert:   { bg: "#450a0a", border: "#f87171", dot: "#f87171", label: "ALERT" },
};

export default function HRMSUserFlow() {
  const [activeRole, setActiveRole] = useState("hr_admin");
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [filter, setFilter] = useState("all");
  const flowRef = useRef(null);

  const role = ROLES.find(r => r.id === activeRole);
  const phases = FLOWS[activeRole] || [];

  const allTypes = ["all", ...new Set(phases.flatMap(p => p.steps.map(s => s.type)))];

  const handleRoleChange = (id) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveRole(id);
      setExpandedPhase(null);
      setActiveStep(null);
      setFilter("all");
      setAnimating(false);
    }, 200);
  };

  const totalSteps = phases.reduce((a, p) => a + p.steps.length, 0);
  const filteredCount = filter === "all"
    ? totalSteps
    : phases.reduce((a, p) => a + p.steps.filter(s => s.type === filter).length, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090b",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      color: "#e4e4e7",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #18181b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        @keyframes pulse-ring { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes slide-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-role { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes connector-grow { from{height:0} to{height:100%} }
        .step-card { transition: all .15s ease; }
        .step-card:hover { transform: translateX(6px); }
        .phase-header { cursor: pointer; transition: all .15s ease; }
        .phase-header:hover { opacity: .85; }
        .role-btn { transition: all .18s ease; cursor: pointer; }
        .role-btn:hover { transform: translateY(-2px); }
        .type-chip { transition: all .15s ease; cursor: pointer; }
        .type-chip:hover { transform: scale(1.05); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: "1px solid #27272a",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
        background: "rgba(9,9,11,.95)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 32, height: 32, background: role.color,
            borderRadius: 8, display: "grid", placeItems: "center",
            fontSize: 16, animation: "pulse-ring 2s infinite",
          }}>{role.icon}</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: ".5px" }}>
              HRMS User Behavior Flow
            </div>
            <div style={{ fontSize: 10, color: "#71717a", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Enterprise Edition · All Roles · All Modules
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 10, color: "#52525b", letterSpacing: "1px", textTransform: "uppercase" }}>
            {filteredCount} steps · {phases.length} phases
          </div>
          <div style={{
            padding: "4px 12px", borderRadius: 999,
            background: role.color + "22", border: `1px solid ${role.color}55`,
            fontSize: 11, color: role.color, fontWeight: 500,
          }}>{role.label}</div>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* ── ROLE SIDEBAR ── */}
        <div style={{
          width: 200, flexShrink: 0,
          borderRight: "1px solid #27272a",
          background: "#0c0c0e",
          padding: "24px 0",
          position: "sticky", top: 60,
          height: "calc(100vh - 60px)",
          overflowY: "auto",
        }}>
          <div style={{ padding: "0 16px 12px", fontSize: 9, color: "#52525b", letterSpacing: "2px", textTransform: "uppercase" }}>
            Select Role
          </div>
          {ROLES.map(r => (
            <div key={r.id}
              className="role-btn"
              onClick={() => handleRoleChange(r.id)}
              style={{
                padding: "10px 16px",
                margin: "2px 8px",
                borderRadius: 8,
                background: activeRole === r.id ? r.color + "18" : "transparent",
                border: `1px solid ${activeRole === r.id ? r.color + "55" : "transparent"}`,
                cursor: "pointer",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 500,
                    color: activeRole === r.id ? r.color : "#a1a1aa",
                  }}>{r.label}</div>
                  <div style={{ fontSize: 9, color: "#52525b", marginTop: 1 }}>{r.desc}</div>
                </div>
              </div>
              {activeRole === r.id && (
                <div style={{
                  height: 2, background: r.color,
                  borderRadius: 1, marginTop: 8, marginLeft: 22,
                  width: "60%", opacity: .6,
                }} />
              )}
            </div>
          ))}

          {/* ── Type legend ── */}
          <div style={{ padding: "20px 16px 8px", fontSize: 9, color: "#52525b", letterSpacing: "2px", textTransform: "uppercase" }}>
            Step Types
          </div>
          {Object.entries(TYPE_STYLES).map(([type, s]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 16px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: "#71717a", textTransform: "uppercase", letterSpacing: "1px" }}>{type}</span>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto" }} ref={flowRef}>

          {/* Role hero */}
          <div style={{
            padding: "32px 40px 24px",
            borderBottom: "1px solid #27272a",
            background: `linear-gradient(135deg, ${role.bg} 0%, #09090b 60%)`,
            animation: "fade-role .3s ease",
            opacity: animating ? 0 : 1,
            transition: "opacity .2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{
                width: 56, height: 56, background: role.color + "22",
                border: `2px solid ${role.color}44`,
                borderRadius: 14, display: "grid", placeItems: "center",
                fontSize: 26, flexShrink: 0,
              }}>{role.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: 28, color: role.color, letterSpacing: "-0.5px", lineHeight: 1,
                }}>{role.label}</div>
                <div style={{ fontSize: 12, color: "#71717a", marginTop: 6 }}>
                  {role.desc} · {totalSteps} total interactions · {phases.length} workflow phases
                </div>

                {/* Phase quick-nav */}
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  {phases.map((ph, i) => (
                    <div key={i}
                      onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                      style={{
                        padding: "4px 12px", borderRadius: 999, cursor: "pointer",
                        background: expandedPhase === i ? ph.color + "33" : "#18181b",
                        border: `1px solid ${expandedPhase === i ? ph.color : "#3f3f46"}`,
                        fontSize: 11, color: expandedPhase === i ? ph.color : "#71717a",
                        transition: "all .15s ease",
                      }}>{ph.phase}</div>
                  ))}
                </div>
              </div>

              {/* Stats mini-panel */}
              <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                {[
                  { label: "Phases", value: phases.length },
                  { label: "Steps", value: totalSteps },
                  { label: "Auto", value: phases.reduce((a,p) => a + p.steps.filter(s => s.type === "auto").length, 0) },
                ].map(s => (
                  <div key={s.label} style={{
                    textAlign: "center", padding: "10px 16px",
                    background: "#18181b", border: "1px solid #27272a",
                    borderRadius: 10,
                  }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: role.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{
            padding: "14px 40px",
            borderBottom: "1px solid #27272a",
            display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            background: "#0c0c0e",
            position: "sticky", top: 60, zIndex: 50,
          }}>
            <span style={{ fontSize: 10, color: "#52525b", letterSpacing: "1px", textTransform: "uppercase", marginRight: 4 }}>
              Filter:
            </span>
            {allTypes.map(t => {
              const s = TYPE_STYLES[t];
              const active = filter === t;
              return (
                <div key={t}
                  className="type-chip"
                  onClick={() => setFilter(t)}
                  style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: 10,
                    background: active ? (s ? s.bg : "#27272a") : "transparent",
                    border: `1px solid ${active ? (s ? s.border : "#52525b") : "#3f3f46"}`,
                    color: active ? (s ? s.dot : "#e4e4e7") : "#71717a",
                    fontWeight: active ? 500 : 400,
                    textTransform: "uppercase", letterSpacing: "1px",
                  }}>{t}</div>
              );
            })}
            <div style={{ marginLeft: "auto", fontSize: 10, color: "#52525b" }}>
              {filteredCount} steps shown
            </div>
          </div>

          {/* Phases & Steps */}
          <div style={{ padding: "32px 40px", animation: "slide-in .3s ease" }}>
            {phases.map((phase, phaseIdx) => {
              const visibleSteps = filter === "all"
                ? phase.steps
                : phase.steps.filter(s => s.type === filter);
              if (visibleSteps.length === 0) return null;
              const isOpen = expandedPhase === null || expandedPhase === phaseIdx;

              return (
                <div key={phaseIdx} style={{ marginBottom: 32 }}>
                  {/* Phase header */}
                  <div
                    className="phase-header"
                    onClick={() => setExpandedPhase(expandedPhase === phaseIdx ? null : phaseIdx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      marginBottom: isOpen ? 20 : 0,
                      padding: "12px 20px",
                      background: `linear-gradient(90deg, ${phase.color}18 0%, transparent 100%)`,
                      border: `1px solid ${phase.color}33`,
                      borderRadius: 10,
                    }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: phase.color,
                      boxShadow: `0 0 8px ${phase.color}`,
                    }} />
                    <div style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 800,
                      fontSize: 14, color: phase.color, letterSpacing: ".3px",
                    }}>{phase.phase}</div>
                    <div style={{
                      fontSize: 10, color: "#52525b", textTransform: "uppercase", letterSpacing: "1px",
                    }}>Phase {phaseIdx + 1} · {visibleSteps.length} steps</div>
                    <div style={{ marginLeft: "auto", fontSize: 12, color: phase.color + "88" }}>
                      {isOpen ? "▲" : "▼"}
                    </div>
                  </div>

                  {/* Steps */}
                  {isOpen && (
                    <div style={{ paddingLeft: 20, position: "relative" }}>
                      {/* Vertical connector */}
                      <div style={{
                        position: "absolute", left: 35, top: 0, bottom: 0,
                        width: 1, background: `linear-gradient(to bottom, ${phase.color}44, transparent)`,
                      }} />

                      {visibleSteps.map((step, stepIdx) => {
                        const ts = TYPE_STYLES[step.type] || TYPE_STYLES.action;
                        const stepKey = `${phaseIdx}-${stepIdx}`;
                        const isActive = activeStep === stepKey;

                        return (
                          <div key={stepIdx}
                            className="step-card"
                            onClick={() => setActiveStep(isActive ? null : stepKey)}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 16,
                              marginBottom: 10, position: "relative",
                              cursor: "pointer",
                            }}>
                            {/* Step number bubble */}
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                              background: isActive ? phase.color : "#18181b",
                              border: `1px solid ${isActive ? phase.color : "#3f3f46"}`,
                              display: "grid", placeItems: "center",
                              fontSize: 10, fontWeight: 600,
                              color: isActive ? "#fff" : "#71717a",
                              zIndex: 2, position: "relative",
                              transition: "all .15s ease",
                              boxShadow: isActive ? `0 0 10px ${phase.color}66` : "none",
                            }}>{stepIdx + 1}</div>

                            {/* Step content card */}
                            <div style={{
                              flex: 1, padding: "10px 16px",
                              background: isActive ? ts.bg : "#131316",
                              border: `1px solid ${isActive ? ts.border : "#27272a"}`,
                              borderRadius: 8,
                              transition: "all .15s ease",
                              boxShadow: isActive ? `0 0 16px ${ts.dot}22` : "none",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                  width: 6, height: 6, borderRadius: "50%",
                                  background: ts.dot, flexShrink: 0,
                                }} />
                                <span style={{ fontSize: 12, fontWeight: 500, color: "#e4e4e7", flex: 1 }}>
                                  {step.action}
                                </span>
                                <div style={{
                                  padding: "2px 8px", borderRadius: 4,
                                  background: ts.bg, border: `1px solid ${ts.border}55`,
                                  fontSize: 8, color: ts.dot,
                                  textTransform: "uppercase", letterSpacing: "1.5px",
                                  fontWeight: 600,
                                }}>{ts.label}</div>
                              </div>
                              {isActive && (
                                <div style={{
                                  marginTop: 8, paddingTop: 8,
                                  borderTop: `1px solid ${ts.border}33`,
                                  fontSize: 11, color: "#a1a1aa",
                                  lineHeight: 1.6,
                                  animation: "slide-in .2s ease",
                                }}>
                                  <span style={{ color: ts.dot }}>→ </span>{step.detail}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Cross-role interaction map ── */}
            <div style={{
              marginTop: 40, padding: "24px 28px",
              background: "#0c0c0e",
              border: "1px solid #27272a",
              borderRadius: 14,
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 14, color: "#e4e4e7", marginBottom: 16,
                letterSpacing: ".3px",
              }}>↔ Cross-Role Interaction Map</div>
              <div style={{ fontSize: 11, color: "#52525b", marginBottom: 20 }}>
                How the {role.label} interacts with other roles
              </div>

              {[
                { from: "super_admin", to: "hr_admin",   action: "Creates tenant → HR Admin is first user" },
                { from: "hr_admin",    to: "recruiter",  action: "Publishes job requisition → Recruiter activates" },
                { from: "recruiter",   to: "hr_admin",   action: "Offer accepted → HR creates employee profile" },
                { from: "hr_admin",    to: "manager",    action: "Assigns employee to manager's team" },
                { from: "employee",    to: "manager",    action: "Submits leave / expense → Manager approves" },
                { from: "manager",     to: "hr_admin",   action: "Escalates leave / performance issues" },
                { from: "hr_admin",    to: "finance",    action: "Submits computed payroll for approval" },
                { from: "finance",     to: "hr_admin",   action: "Approves payroll / rejects with notes" },
                { from: "employee",    to: "finance",    action: "Expense claim → Manager → Finance → Reimbursed" },
                { from: "hr_admin",    to: "auditor",    action: "Auditor has read-only view of all HR actions" },
                { from: "super_admin", to: "auditor",    action: "Grant auditor access per tenant" },
                { from: "manager",     to: "employee",   action: "Publishes performance review + goals" },
              ].filter(r =>
                r.from === activeRole || r.to === activeRole
              ).map((rel, i) => {
                const fromRole = ROLES.find(r => r.id === rel.from);
                const toRole   = ROLES.find(r => r.id === rel.to);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 12px", marginBottom: 6,
                    background: "#131316", border: "1px solid #27272a",
                    borderRadius: 8, animation: "slide-in .2s ease",
                    animationDelay: `${i * 40}ms`,
                  }}>
                    <div style={{
                      padding: "2px 10px", borderRadius: 6, fontSize: 10,
                      background: fromRole.color + "22",
                      border: `1px solid ${fromRole.color}44`,
                      color: fromRole.color, fontWeight: 500,
                    }}>{fromRole.icon} {fromRole.label}</div>
                    <div style={{ color: "#52525b", fontSize: 12 }}>→</div>
                    <div style={{
                      padding: "2px 10px", borderRadius: 6, fontSize: 10,
                      background: toRole.color + "22",
                      border: `1px solid ${toRole.color}44`,
                      color: toRole.color, fontWeight: 500,
                    }}>{toRole.icon} {toRole.label}</div>
                    <div style={{ flex: 1, fontSize: 11, color: "#71717a" }}>{rel.action}</div>
                  </div>
                );
              })}
            </div>

            {/* ── System automation callout ── */}
            <div style={{
              marginTop: 20, padding: "18px 24px",
              background: "#1a0535",
              border: "1px solid #a78bfa44",
              borderRadius: 12,
              display: "flex", alignItems: "flex-start", gap: 16,
            }}>
              <div style={{ fontSize: 22 }}>⚡</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 6 }}>
                  System Automations (zero human clicks)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    "JWT access token refresh every 15 min",
                    "Celery: payroll computed async",
                    "Payslip PDFs generated on approval",
                    "Welcome email on employee create",
                    "Leave balance reset on Jan 1",
                    "Document expiry alerts 30 days prior",
                    "Audit log written on every API mutation",
                    "Biometric sync every 5 min",
                    "Elasticsearch index sync on data change",
                    "Webhook delivery with retry (3×)",
                    "Offer letter expiry at 7 days",
                    "Locked account alert after 5 fails",
                  ].map((a, i) => (
                    <div key={i} style={{
                      padding: "3px 10px", borderRadius: 6,
                      background: "#2d1b69", border: "1px solid #a78bfa33",
                      fontSize: 10, color: "#c4b5fd",
                    }}>⚙ {a}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
