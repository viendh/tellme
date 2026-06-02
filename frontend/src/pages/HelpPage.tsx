import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Copy, Check, BookOpen, Key, ClipboardList, Layers, ChevronRight,
  ExternalLink, Rocket, FolderKanban, LayoutGrid, Search,
  BarChart2, Puzzle, Users, Settings, MousePointerClick,
  ArrowRight, Eye, ThumbsUp, Clock, Filter,
  Info, Lightbulb, AlertTriangle, CheckCircle2, Tag,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Shared primitives
═══════════════════════════════════════════════════════════════ */

function CodeBlock({ code, language = 'bash', copied: _c, onCopy: _o }:
  { code: string; language?: string; copied?: boolean; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-gray-900 text-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="px-4 py-4 overflow-x-auto text-gray-100 leading-relaxed text-xs"><code>{code.trim()}</code></pre>
    </div>
  );
}

function MethodBadge({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }) {
  const colors = { GET: 'bg-blue-100 text-blue-700', POST: 'bg-green-100 text-green-700', PUT: 'bg-yellow-100 text-yellow-700', PATCH: 'bg-orange-100 text-orange-700', DELETE: 'bg-red-100 text-red-700' };
  return <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${colors[method]}`}>{method}</span>;
}

function Endpoint({ method, path, desc }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; path: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <MethodBadge method={method} />
      <code className="text-sm text-gray-800 font-mono flex-1">{path}</code>
      <span className="text-sm text-gray-500 shrink-0">{desc}</span>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-100">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-8 scroll-mt-6">
      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <ChevronRight className="w-4 h-4 text-blue-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

type CalloutType = 'info' | 'tip' | 'warning' | 'success';
function Callout({ type = 'info', children }: { type?: CalloutType; children: React.ReactNode }) {
  const cfg = {
    info:    { bg: 'bg-blue-50 border-blue-200 text-blue-800',       icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> },
    tip:     { bg: 'bg-green-50 border-green-200 text-green-800',     icon: <Lightbulb className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800',     icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> },
    success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> },
  }[type];
  return (
    <div className={`flex gap-2.5 border rounded-xl p-4 text-sm my-4 ${cfg.bg}`}>
      {cfg.icon}<div className="leading-relaxed">{children}</div>
    </div>
  );
}

function Steps({ items }: { items: { title: string; desc?: string }[] }) {
  return (
    <ol className="space-y-3 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{item.title}</p>
            {item.desc && <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   NAV builders
═══════════════════════════════════════════════════════════════ */

function getUserNav(isVi: boolean) {
  const L = (vi: string, en: string) => (isVi ? vi : en);
  return [
    {
      id: 'ug-start', label: L('Bắt đầu nhanh', 'Quick Start'), icon: Rocket,
      children: [
        { id: 'ug-register',    label: L('Đăng ký & Đăng nhập', 'Sign Up & Login') },
        { id: 'ug-ui-overview', label: L('Tổng quan giao diện', 'Interface Overview') },
      ],
    },
    {
      id: 'ug-project', label: L('Dự án', 'Projects'), icon: FolderKanban,
      children: [
        { id: 'ug-project-create',   label: L('Tạo dự án', 'Create Project') },
        { id: 'ug-project-members',  label: L('Thành viên & Vai trò', 'Members & Roles') },
        { id: 'ug-project-settings', label: L('Cài đặt & Lưu trữ', 'Settings & Archive') },
      ],
    },
    {
      id: 'ug-board', label: L('Board & Backlog', 'Board & Backlog'), icon: LayoutGrid,
      children: [
        { id: 'ug-board-kanban', label: L('Board Kanban', 'Kanban Board') },
        { id: 'ug-backlog',      label: L('Backlog & Sprint', 'Backlog & Sprint') },
      ],
    },
    {
      id: 'ug-issue', label: L('Issues & Tasks', 'Issues & Tasks'), icon: ClipboardList,
      children: [
        { id: 'ug-issue-create',    label: L('Tạo & Chỉnh sửa', 'Create & Edit') },
        { id: 'ug-issue-hierarchy', label: L('Phân cấp cha-con', 'Parent-Child') },
        { id: 'ug-issue-labels',    label: L('Nhãn, Clone, Move', 'Labels, Clone, Move') },
        { id: 'ug-issue-social',    label: L('Watch, Vote, Worklog', 'Watch, Vote, Worklog') },
        { id: 'ug-issue-links',     label: L('Liên kết Issue', 'Issue Links') },
      ],
    },
    {
      id: 'ug-search', label: L('Tìm kiếm & Lọc', 'Search & Filters'), icon: Search,
      children: [
        { id: 'ug-adv-search',    label: L('Tìm kiếm nâng cao', 'Advanced Search') },
        { id: 'ug-saved-filters', label: L('Bộ lọc đã lưu', 'Saved Filters') },
      ],
    },
    {
      id: 'ug-reports', label: L('Báo cáo', 'Reports'), icon: BarChart2,
      children: [
        { id: 'ug-report-overdue',    label: L('Quá hạn', 'Overdue') },
        { id: 'ug-report-workload',   label: L('Khối lượng', 'Workload') },
        { id: 'ug-report-cvr',        label: L('Tạo vs Giải quyết', 'Created vs Resolved') },
        { id: 'ug-report-resolution', label: L('Thời gian xử lý', 'Resolution Time') },
      ],
    },
    {
      id: 'ug-comp-ver', label: L('Components & Versions', 'Components & Versions'), icon: Puzzle,
      children: [
        { id: 'ug-components', label: L('Thành phần dự án', 'Components') },
        { id: 'ug-versions',   label: L('Phiên bản release', 'Release Versions') },
      ],
    },
    { id: 'ug-tips', label: L('Mẹo & Phím tắt', 'Tips & Shortcuts'), icon: Lightbulb, children: [] as { id: string; label: string }[] },
  ];
}

function getApiNav(isVi: boolean) {
  const L = (vi: string, en: string) => (isVi ? vi : en);
  return [
    { id: 'overview', label: L('Tổng quan', 'Overview'),     icon: BookOpen,     children: [] as { id: string; label: string }[] },
    { id: 'auth',     label: L('Xác thực', 'Authentication'), icon: Key,          children: [] as { id: string; label: string }[] },
    {
      id: 'task', label: 'Task API', icon: ClipboardList,
      children: [
        { id: 'task-list',     label: L('Lấy danh sách', 'List tasks') },
        { id: 'task-get',      label: L('Lấy theo ID', 'Get by ID') },
        { id: 'task-create',   label: L('Tạo mới', 'Create') },
        { id: 'task-update',   label: L('Cập nhật', 'Update') },
        { id: 'task-delete',   label: L('Xóa', 'Delete') },
        { id: 'task-status',   label: L('Đổi trạng thái', 'Change status') },
        { id: 'task-subtask',  label: L('Tạo Sub-task', 'Create sub-task') },
        { id: 'task-subtasks', label: L('Lấy Sub-tasks', 'List sub-tasks') },
      ],
    },
    { id: 'project', label: 'Project API', icon: Layers, children: [] as { id: string; label: string }[] },
  ];
}

/* ═══════════════════════════════════════════════════════════════
   Left Nav
═══════════════════════════════════════════════════════════════ */

type NavItem = { id: string; label: string; icon: React.FC<{ className?: string }>; children: { id: string; label: string }[] };

function LeftNav({ nav, activeId, onScroll }: { nav: NavItem[]; activeId: string; onScroll: (id: string) => void }) {
  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const Icon = item.icon;
        const isParentActive = activeId === item.id || item.children?.some((c) => c.id === activeId);
        return (
          <div key={item.id}>
            <button
              onClick={() => onScroll(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                activeId === item.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
            {item.children && item.children.length > 0 && isParentActive && (
              <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                {item.children.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onScroll(c.id)}
                    className={`block w-full text-left text-xs py-1.5 px-2 rounded transition-colors ${
                      activeId === c.id ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   User Guide Content  — fully bilingual
═══════════════════════════════════════════════════════════════ */

function UserGuideContent({ isVi }: { isVi: boolean }) {
  const L = (vi: string, en: string) => (isVi ? vi : en);

  /* ── Steps data ── */
  const stepsRegister = [
    { title: L('Truy cập trang đăng ký', 'Go to the registration page'), desc: L('Nhấn "Sign up" ở trang đăng nhập hoặc vào /register.', 'Click "Sign up" on the login page or navigate to /register.') },
    { title: L('Điền thông tin', 'Fill in your details'), desc: L('Họ tên, email, mật khẩu (tối thiểu 6 ký tự), xác nhận mật khẩu.', 'Full name, email, password (min. 6 characters), confirm password.') },
    { title: L('Chờ quản trị viên phê duyệt', 'Wait for admin approval'), desc: L('Tài khoản ở trạng thái "Chờ duyệt" cho đến khi admin xác nhận.', 'Your account stays "Pending" until an admin approves it.') },
    { title: L('Nhận email thông báo & đăng nhập', 'Receive notification email & log in'), desc: L('Hệ thống gửi email khi tài khoản được kích hoạt.', 'The system sends an email when your account is activated.') },
  ];

  const stepsLogin = [
    { title: L('Nhập email và mật khẩu đã đăng ký.', 'Enter your registered email and password.') },
    { title: L('Nhấn "Sign in" hoặc phím Enter.', 'Click "Sign in" or press Enter.') },
    { title: L('Hệ thống chuyển đến Dashboard cá nhân.', 'The system redirects you to your personal Dashboard.') },
  ];

  const stepsCreateProject = [
    { title: L('Vào trang Dự án', 'Go to Projects'), desc: L('Nhấn "Projects" trên sidebar → "New Project" ở góc trên phải.', 'Click "Projects" in the sidebar → "New Project" at the top right.') },
    { title: L('Tab Cơ bản', 'Basic tab'), desc: L('Điền Tên dự án, Mã dự án (VD: ERP, TM), Mô tả, Trạng thái, Ngày bắt đầu/kết thúc.', 'Enter Project Name, Project Key (e.g. ERP, TM), Description, Status, Start/End dates.') },
    { title: L('Tab Agile (tùy chọn)', 'Agile tab (optional)'), desc: L('Chọn loại Board (Scrum/Kanban), đơn vị ước tính (Giờ/Story Point), thời lượng Sprint.', 'Choose Board type (Scrum/Kanban), estimation unit (Hours/Story Points), Sprint duration.') },
    { title: L('Tab Tài chính & DevOps (tùy chọn)', 'Finance & DevOps tab (optional)'), desc: L('Nhập ngân sách, Git URL, CI/CD Pipeline URL nếu cần.', 'Enter budget, Git URL, CI/CD Pipeline URL if needed.') },
    { title: L('Nhấn "Create Project"', 'Click "Create Project"'), desc: L('Dự án được tạo, hệ thống tự chuyển vào Board.', 'The project is created and you are redirected to the Board.') },
  ];

  const stepsAddMember = [
    { title: L('Nhấn "Add Member"', 'Click "Add Member"'), desc: L('Chọn người dùng từ danh sách dropdown → nhấn "Add".', 'Select a user from the dropdown → click "Add".') },
    { title: L('Xóa thành viên', 'Remove a member'), desc: L('Nhấn nút "Remove" bên cạnh tên thành viên → xác nhận.', 'Click "Remove" next to the member\'s name → confirm.') },
  ];

  const stepsCreateSprint = [
    { title: L('Vào tab Backlog → nhấn "Create Sprint".', 'Go to the Backlog tab → click "Create Sprint".') },
    { title: L('Điền tên sprint, mục tiêu, ngày bắt đầu và ngày kết thúc.', 'Enter sprint name, goal, start and end dates.') },
    { title: L('Sprint được tạo với trạng thái PLANNING.', 'Sprint is created with PLANNING status.') },
  ];

  const stepsStartSprint = [
    { title: L('Nhấn nút "Start" ▶ trên header của sprint.', 'Click "Start" ▶ on the sprint header.') },
    { title: L('Sprint chuyển sang ACTIVE — task trong sprint xuất hiện trên Board.', 'Sprint changes to ACTIVE — tasks in the sprint appear on the Board.') },
  ];

  const stepsCompleteSprint = [
    { title: L('Nhấn "Complete" ✓ trên sprint đang ACTIVE.', 'Click "Complete" ✓ on the ACTIVE sprint.') },
    { title: L('Các task chưa DONE tự động chuyển về Backlog.', 'Unfinished tasks automatically move back to the Backlog.') },
    { title: L('Sprint được đánh dấu COMPLETED và ẩn khỏi Board.', 'Sprint is marked COMPLETED and hidden from the Board.') },
  ];

  const stepsAddSubtask = [
    { title: L('Mở chi tiết issue cha.', 'Open the parent issue detail.') },
    { title: L('Cuộn xuống mục "Child Issues" → nhấn "+ Add child issue".', 'Scroll to "Child Issues" → click "+ Add child issue".') },
    { title: L('Nhập tiêu đề → Enter để tạo nhanh.', 'Enter a title → press Enter to create quickly.') },
  ];

  const stepsLabels = [
    { title: L('Mở chi tiết issue → tìm mục "Labels".', 'Open issue detail → find the "Labels" section.') },
    { title: L('Click vào vùng nhãn để chỉnh sửa.', 'Click the label area to edit.') },
    { title: L('Nhập nhãn phân cách bằng dấu phẩy (VD: frontend, urgent, phase-2).', 'Enter labels separated by commas (e.g. frontend, urgent, phase-2).') },
    { title: L('Nhấn "Save" hoặc Enter.', 'Click "Save" or press Enter.') },
  ];

  const stepsClone = [
    { title: L('Mở chi tiết issue → nhấn icon "Clone" (biểu tượng copy) ở góc trên.', 'Open issue detail → click the "Clone" icon (copy symbol) at the top.') },
    { title: L('Hệ thống tạo issue mới với tiêu đề "[CLONE] ...".', 'The system creates a new issue with title "[CLONE] ...".') },
    { title: L('Issue clone vào cùng sprint và dự án với issue gốc.', 'The clone is placed in the same sprint and project as the original.') },
  ];

  const stepsMove = [
    { title: L('Mở chi tiết issue → nhấn icon "Move" (mũi tên sang phải).', 'Open issue detail → click the "Move" icon (right arrow).') },
    { title: L('Chọn dự án đích từ danh sách.', 'Select the target project from the list.') },
    { title: L('Nhấn "Move" — issue được chuyển vào Backlog của dự án đích.', 'Click "Move" — the issue is placed in the target project\'s Backlog.') },
  ];

  const stepsWorklog = [
    { title: L('Mở chi tiết issue → cuộn đến mục "Work Log".', 'Open issue detail → scroll to "Work Log".') },
    { title: L('Nhấn "+ Log work".', 'Click "+ Log work".') },
    { title: L('Nhập số giờ (bắt buộc), ngày làm việc, mô tả công việc.', 'Enter hours (required), work date, description.') },
    { title: L('Nhấn "Save".', 'Click "Save".') },
  ];

  const stepsAddLink = [
    { title: L('Mở chi tiết issue → mục "Issue Links" → nhấn "+ Add link".', 'Open issue detail → "Issue Links" section → click "+ Add link".') },
    { title: L('Chọn loại liên kết (BLOCKS, RELATES_TO, ...).', 'Select the link type (BLOCKS, RELATES_TO, ...).') },
    { title: L('Nhập ID của issue đích (số ID).', 'Enter the target issue ID (numeric ID).') },
    { title: L('Nhấn "Save".', 'Click "Save".') },
  ];

  const stepsSearch = [
    { title: L('Nhập từ khóa và/hoặc chọn các bộ lọc.', 'Enter a keyword and/or select filters.') },
    { title: L('Nhấn "Search" hoặc Enter.', 'Click "Search" or press Enter.') },
    { title: L('Kết quả hiển thị bên dưới — nhấn vào dòng để mở issue.', 'Results appear below — click a row to open the issue.') },
    { title: L('Nhấn "Clear filters" để xóa toàn bộ bộ lọc.', 'Click "Clear filters" to reset all filters.') },
  ];

  const stepsSavedFilter = [
    { title: L('Nhấn "Create Filter".', 'Click "Create Filter".') },
    { title: L('Đặt tên mô tả rõ ràng (VD: "Bug HIGH đang mở").', 'Give it a clear name (e.g. "Open HIGH bugs").') },
    { title: L('Nhập tiêu chí lọc dưới dạng JSON.', 'Enter filter criteria in JSON format.') },
    { title: L('Tích "Shared" nếu muốn chia sẻ với toàn bộ thành viên.', 'Check "Shared" to share with all team members.') },
    { title: L('Tích "Favorite" để ghim lên đầu danh sách.', 'Check "Favorite" to pin it at the top.') },
  ];

  const stepsCreateComponent = [
    { title: L('Nhấn "Create Component".', 'Click "Create Component".') },
    { title: L('Đặt tên (VD: Authentication, Payment Gateway).', 'Enter a name (e.g. Authentication, Payment Gateway).') },
    { title: L('Thêm mô tả và chọn người phụ trách (Lead).', 'Add a description and select the Lead.') },
    { title: L('Nhấn "Create".', 'Click "Create".') },
  ];

  const stepsCreateVersion = [
    { title: L('Nhấn "Create Version" → đặt tên phiên bản.', 'Click "Create Version" → enter the version name.') },
    { title: L('Điền ngày bắt đầu và ngày phát hành dự kiến.', 'Fill in the start date and planned release date.') },
    { title: L('Khi phát hành xong, chỉnh trạng thái thành RELEASED.', 'When released, change the status to RELEASED.') },
    { title: L('Lưu trữ phiên bản cũ bằng trạng thái ARCHIVED.', 'Archive old versions by setting status to ARCHIVED.') },
  ];

  const roles = [
    { role: 'OWNER',     color: 'bg-red-100 text-red-700',       desc: L('Toàn quyền, kể cả xóa dự án. Không thể xóa.', 'Full control including project deletion. Cannot be removed.') },
    { role: 'MANAGER',   color: 'bg-purple-100 text-purple-700', desc: L('Quản lý sprint, thành viên, cài đặt dự án.', 'Manages sprints, members, project settings.') },
    { role: 'DEVELOPER', color: 'bg-blue-100 text-blue-700',     desc: L('Tạo, cập nhật, chuyển trạng thái issue.', 'Creates, updates, and transitions issues.') },
    { role: 'TESTER',    color: 'bg-green-100 text-green-700',   desc: L('Tập trung vào các issue loại BUG, testing.', 'Focused on BUG-type issues and testing.') },
    { role: 'VIEWER',    color: 'bg-gray-100 text-gray-700',     desc: L('Chỉ xem, không thể sửa.', 'Read-only access, cannot edit.') },
  ];

  const issueTypes = [
    { type: 'TASK',  color: 'bg-blue-100 text-blue-800',    desc: L('Công việc thông thường cần thực hiện.', 'A standard piece of work to be done.') },
    { type: 'STORY', color: 'bg-green-100 text-green-800',  desc: L('Yêu cầu nghiệp vụ từ góc nhìn người dùng.', 'A business requirement from the user\'s perspective.') },
    { type: 'BUG',   color: 'bg-red-100 text-red-800',      desc: L('Lỗi phần mềm cần sửa.', 'A software defect that needs fixing.') },
    { type: 'EPIC',  color: 'bg-purple-100 text-purple-800', desc: L('Nhóm các story/task lớn cùng mục tiêu.', 'A large body of work grouping multiple stories/tasks.') },
  ];

  const linkTypes = [
    { type: 'BLOCKS',        desc: L('Issue này chặn issue kia không thể tiến hành.', 'This issue blocks another from progressing.') },
    { type: 'IS_BLOCKED_BY', desc: L('Issue này bị chặn bởi issue kia.', 'This issue is blocked by another.') },
    { type: 'RELATES_TO',    desc: L('Hai issue có liên quan nhưng không phụ thuộc.', 'Two issues are related but not dependent.') },
    { type: 'DUPLICATES',    desc: L('Issue này là bản trùng của issue kia.', 'This issue is a duplicate of another.') },
  ];

  const boardCols = [
    { label: 'To Do',       color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { label: 'Testing',     color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { label: 'UAT',         color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { label: 'Done',        color: 'bg-green-100 text-green-700 border-green-300' },
  ];

  const stepsCreateIssue = [
    { title: L('Nhấn "+ Create Issue" ở Board hoặc Backlog.', 'Click "+ Create Issue" on the Board or Backlog.') },
    { title: L('Điền tiêu đề (bắt buộc), chọn Loại và Độ ưu tiên.', 'Enter a title (required), select Type and Priority.') },
    { title: L('Chọn Sprint (để trống = vào Backlog) và Người thực hiện.', 'Choose Sprint (leave empty = Backlog) and Assignee.') },
    { title: L('Thêm Hạn hoàn thành, Giờ ước tính, Module nếu cần.', 'Add Due Date, Estimate Hours, Module if needed.') },
    { title: L('Nhấn "Create Task".', 'Click "Create Task".') },
  ];

  const scrum = [
    L('Tạo dự án → thêm thành viên → tạo Components/Versions.', 'Create project → add members → set up Components/Versions.'),
    L('Tạo issue vào Backlog → ưu tiên (priority) và ước tính (estimate hours).', 'Create issues in Backlog → set priority and estimate hours.'),
    L('Tạo Sprint → kéo issue phù hợp vào sprint → đặt mục tiêu.', 'Create a Sprint → drag fitting issues into it → set a goal.'),
    L('Start Sprint → nhóm làm việc trên Board → kéo thả card.', 'Start Sprint → team works on the Board → drag cards to update status.'),
    L('Stand-up hàng ngày: xem Board, cập nhật tiến độ, ghi worklog.', 'Daily stand-up: check Board, update progress, log work.'),
    L('Cuối sprint: Complete Sprint → issue chưa xong về Backlog → xem Reports.', 'End of sprint: Complete Sprint → unfinished issues go to Backlog → review Reports.'),
  ];

  return (
    <>
      {/* ── Quick Start ── */}
      <Section id="ug-start" title={L('🚀 Bắt đầu nhanh', '🚀 Quick Start')}>
        <p className="text-gray-600 leading-relaxed mb-4">
          {isVi
            ? <><strong>Tellme</strong> là hệ thống quản lý dự án theo phong cách Jira, hỗ trợ làm việc theo phương pháp Agile/Scrum. Phần này giúp bạn bắt đầu sử dụng trong vài phút.</>
            : <><strong>Tellme</strong> is a Jira-style project management system supporting Agile/Scrum workflows. This section gets you up and running in minutes.</>}
        </p>

        <SubSection id="ug-register" title={L('Đăng ký & Đăng nhập', 'Sign Up & Login')}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{L('Đăng ký tài khoản mới', 'Create a new account')}</h4>
          <Steps items={stepsRegister} />
          <Callout type="warning">
            {isVi
              ? <>{L('Tài khoản phải được', 'Account must be')} <strong>{L('quản trị viên phê duyệt', 'approved by an admin')}</strong> {L('trước khi đăng nhập được. Liên hệ admin nếu chờ quá lâu.', 'before you can log in. Contact your admin if the wait is too long.')}</>
              : <>Account must be <strong>approved by an admin</strong> before you can log in. Contact your admin if the wait is too long.</>}
          </Callout>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-6">{L('Đăng nhập', 'Login')}</h4>
          <Steps items={stepsLogin} />
          <Callout type="info">
            {L('Phiên đăng nhập được lưu trong ', 'Session is valid for ')}
            <strong>{L('7 ngày', '7 days')}</strong>
            {L('. Sau đó cần đăng nhập lại.', '. After that you will need to log in again.')}
          </Callout>
        </SubSection>

        <SubSection id="ug-ui-overview" title={L('Tổng quan giao diện', 'Interface Overview')}>
          <div className="grid grid-cols-1 gap-4 my-4">
            {[
              {
                icon: <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0"><LayoutGrid className="w-4 h-4 text-white" /></div>,
                title: L('Thanh sidebar trái', 'Left Sidebar'),
                desc: L('Điều hướng chính: Dashboard, Dự án, Tìm kiếm nâng cao, Bộ lọc đã lưu, Hướng dẫn. Có thể thu gọn để mở rộng không gian làm việc.', 'Main navigation: Dashboard, Projects, Advanced Search, Saved Filters, User Guide. Can be collapsed to expand the workspace.'),
              },
              {
                icon: <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><BarChart2 className="w-4 h-4 text-white" /></div>,
                title: L('Dashboard cá nhân', 'Personal Dashboard'),
                desc: L('Tổng quan: số task được giao, đang thực hiện, quá hạn. Danh sách task gần nhất.', 'Overview: tasks assigned, in progress, overdue. List of recent tasks.'),
              },
              {
                icon: <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><FolderKanban className="w-4 h-4 text-white" /></div>,
                title: L('Thanh điều hướng dự án', 'Project Navigation'),
                desc: L('Bên trong mỗi dự án: Dashboard · Board · Backlog · Members · Components · Versions · Reports · Settings.', 'Inside each project: Dashboard · Board · Backlog · Members · Components · Versions · Reports · Settings.'),
              },
            ].map((card, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
                {card.icon}
                <div><p className="text-sm font-semibold text-gray-800">{card.title}</p><p className="text-sm text-gray-600 mt-1">{card.desc}</p></div>
              </div>
            ))}
          </div>
          <Callout type="tip">
            {L('Chuyển ngôn ngữ (Tiếng Việt / English) bằng nút ', 'Switch language (Vietnamese / English) using the ')}
            <strong>🌐</strong>
            {L(' ở cuối sidebar trái.', ' button at the bottom of the left sidebar.')}
          </Callout>
        </SubSection>
      </Section>

      {/* ── Projects ── */}
      <Section id="ug-project" title={L('📁 Quản lý dự án', '📁 Project Management')}>

        <SubSection id="ug-project-create" title={L('Tạo dự án mới', 'Create a New Project')}>
          <Steps items={stepsCreateProject} />
          <div className="bg-white border border-gray-200 rounded-xl p-4 my-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{L('Các trường quan trọng', 'Key Fields')}</p>
            <div className="space-y-2 text-sm">
              {[
                { key: L('Mã dự án', 'Project Key'), desc: L('Chỉ chữ hoa và số, tối thiểu 2 ký tự (VD: ERP). Dùng làm tiền tố cho mã issue: ERP-1, ERP-2...', 'Uppercase letters and numbers only, min. 2 chars (e.g. ERP). Used as issue key prefix: ERP-1, ERP-2...') },
                { key: L('Loại dự án', 'Project Type'), desc: L('Software / Business / Infrastructure — ảnh hưởng phân loại trong báo cáo.', 'Software / Business / Infrastructure — affects reporting categories.') },
                { key: L('Phạm vi', 'Visibility'), desc: L('Private (chỉ thành viên) / Internal (mọi người trong hệ thống) / Public.', 'Private (members only) / Internal (all users) / Public.') },
              ].map((row) => (
                <div key={row.key} className="flex gap-3">
                  <span className="font-mono text-blue-600 w-28 flex-shrink-0">{row.key}</span>
                  <span className="text-gray-600">{row.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <Callout type="warning">
            {L('Mã dự án ', 'The project key ')}
            <strong>{L('không thể thay đổi', 'cannot be changed')}</strong>
            {L(' sau khi tạo. Hãy chọn cẩn thận.', ' after creation. Choose it carefully.')}
          </Callout>
        </SubSection>

        <SubSection id="ug-project-members" title={L('Thành viên & Vai trò', 'Members & Roles')}>
          <p className="text-sm text-gray-600 mb-4">{L('Vào dự án → tab ', 'Go to the project → ')} <strong>{L('Members', 'Members')}</strong>{L(' để quản lý thành viên.', ' tab to manage members.')}</p>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">{L('Các vai trò', 'Roles')}</div>
            <div className="divide-y divide-gray-100">
              {roles.map((r) => (
                <div key={r.role} className="flex items-center gap-3 px-4 py-2.5">
                  <Badge color={r.color} label={r.role} />
                  <span className="text-sm text-gray-600">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <Steps items={stepsAddMember} />
          <Callout type="info">{L('Chủ sở hữu (OWNER) không thể bị xóa khỏi dự án.', 'The project OWNER cannot be removed from the project.')}</Callout>
        </SubSection>

        <SubSection id="ug-project-settings" title={L('Cài đặt & Lưu trữ', 'Settings & Archive')}>
          <p className="text-sm text-gray-600 mb-3">{L('Vào dự án → tab ', 'Go to the project → ')} <strong>Settings</strong>{L(' để quản lý.', ' tab.')}</p>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3 flex gap-3">
              <Settings className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">{L('Chỉnh sửa thông tin', 'Edit project info')}</p>
                <p className="text-sm text-gray-500">{L('Thay đổi tên, mô tả, trạng thái, ngày tháng và các trường mở rộng.', 'Change name, description, status, dates, and extended fields.')}</p>
              </div>
            </div>
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">{L('Lưu trữ (Archive)', 'Archive')}</p>
                <p className="text-sm text-amber-700">{L('Ẩn dự án khỏi danh sách hoạt động. Dữ liệu vẫn giữ nguyên. Có thể khôi phục.', 'Hides the project from active lists. Data is preserved. Can be restored.')}</p>
              </div>
            </div>
            <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{L('Xóa dự án', 'Delete Project')}</p>
                <p className="text-sm text-red-700">{L('Xóa vĩnh viễn toàn bộ dự án và dữ liệu. Chỉ OWNER mới thực hiện được.', 'Permanently deletes the project and all data. Only the OWNER can do this.')}</p>
              </div>
            </div>
          </div>
        </SubSection>
      </Section>

      {/* ── Board & Backlog ── */}
      <Section id="ug-board" title={L('📋 Board & Backlog', '📋 Board & Backlog')}>

        <SubSection id="ug-board-kanban" title={L('Board Kanban', 'Kanban Board')}>
          <p className="text-sm text-gray-600 mb-4">{L('Board hiển thị các task của sprint đang chạy chia thành 5 cột theo trạng thái.', 'The Board shows tasks in the active sprint divided into 5 status columns.')}</p>
          <div className="grid grid-cols-5 gap-2 my-4">
            {boardCols.map((col) => (<div key={col.label} className={`border rounded-lg p-2 text-center text-xs font-semibold ${col.color}`}>{col.label}</div>))}
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p className="flex items-center gap-2"><MousePointerClick className="w-4 h-4 text-blue-500 flex-shrink-0" /> <strong>{L('Click vào card', 'Click a card')}</strong> → {L('mở panel chi tiết bên phải.', 'opens the detail panel on the right.')}</p>
            <p className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0" /> <strong>{L('Kéo thả card', 'Drag & drop a card')}</strong> {L('sang cột khác để thay đổi trạng thái ngay lập tức.', 'to another column to instantly change its status.')}</p>
          </div>
          <Callout type="tip">{L('Dùng bộ lọc ở góc trên Board để chỉ xem task của một thành viên hoặc một sprint cụ thể.', 'Use the filter at the top of the Board to view tasks for a specific member or sprint.')}</Callout>
        </SubSection>

        <SubSection id="ug-backlog" title={L('Backlog & Sprint', 'Backlog & Sprint')}>
          <p className="text-sm text-gray-600 mb-4">{L('Backlog là danh sách tất cả task chưa có sprint. Sprint là một khoảng thời gian cố định để hoàn thành một nhóm task.', 'The Backlog is the list of all tasks not in a sprint. A Sprint is a fixed time-box for completing a set of tasks.')}</p>

          <h4 className="text-sm font-semibold text-gray-700 mb-2">{L('Tạo Sprint', 'Create a Sprint')}</h4>
          <Steps items={stepsCreateSprint} />

          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Thêm task vào Sprint', 'Add Tasks to a Sprint')}</h4>
          <p className="text-sm text-gray-600 mb-2">{L('Kéo task từ khu vực Backlog vào sprint section, hoặc tạo issue mới trực tiếp trong sprint bằng nút "+ Issue" trên header sprint.', 'Drag tasks from the Backlog into a sprint section, or create new issues directly in a sprint using the "+ Issue" button on the sprint header.')}</p>

          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Bắt đầu Sprint', 'Start a Sprint')}</h4>
          <Steps items={stepsStartSprint} />
          <Callout type="warning">{L('Chỉ có thể có 1 sprint ACTIVE tại một thời điểm.', 'Only 1 sprint can be ACTIVE at a time.')}</Callout>

          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Hoàn thành Sprint', 'Complete a Sprint')}</h4>
          <Steps items={stepsCompleteSprint} />

          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Cấu trúc cha-con trong Backlog', 'Parent-Child Structure in Backlog')}</h4>
          <p className="text-sm text-gray-600 mb-2">{L('Task con được hiển thị thụt vào với ký hiệu ↳. Task cha luôn xuất hiện trước, con xếp ngay bên dưới.', 'Subtasks are displayed indented with a ↳ symbol. Parent tasks always appear first, with children listed immediately below.')}</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-xs space-y-1">
            <div className="flex items-center gap-2"><span className="text-blue-400">■</span><span className="text-gray-500">ERP-5</span><span className="text-gray-800">{L('Thiết kế API đăng nhập', 'Design Login API')}</span></div>
            <div className="flex items-center gap-2 pl-6"><span className="text-gray-300">↳</span><span className="text-gray-400">■</span><span className="text-gray-400">ERP-5.1</span><span className="text-gray-600">{L('Viết unit test', 'Write unit tests')}</span></div>
            <div className="flex items-center gap-2 pl-6"><span className="text-gray-300">↳</span><span className="text-gray-400">■</span><span className="text-gray-400">ERP-5.2</span><span className="text-gray-600">{L('Review code', 'Code review')}</span></div>
            <div className="flex items-center gap-2"><span className="text-blue-400">■</span><span className="text-gray-500">ERP-6</span><span className="text-gray-800">{L('Thiết kế UI màn hình login', 'Design Login UI')}</span></div>
          </div>
        </SubSection>
      </Section>

      {/* ── Issues & Tasks ── */}
      <Section id="ug-issue" title={L('✅ Issues & Tasks', '✅ Issues & Tasks')}>

        <SubSection id="ug-issue-create" title={L('Tạo & Chỉnh sửa Issue', 'Create & Edit Issues')}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{L('Các loại Issue', 'Issue Types')}</h4>
          <div className="grid grid-cols-2 gap-3 my-3">
            {issueTypes.map((t) => (
              <div key={t.type} className="border border-gray-200 rounded-lg p-3">
                <Badge color={t.color} label={t.type} />
                <p className="text-xs text-gray-600 mt-1.5">{t.desc}</p>
              </div>
            ))}
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Độ ưu tiên', 'Priority Levels')}</h4>
          <div className="flex gap-2 flex-wrap my-2">
            <Badge color="bg-gray-100 text-gray-600" label="LOW" />
            <Badge color="bg-blue-100 text-blue-700" label="MEDIUM" />
            <Badge color="bg-orange-100 text-orange-700" label="HIGH" />
            <Badge color="bg-red-100 text-red-700" label="CRITICAL" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Tạo issue mới', 'Create a new issue')}</h4>
          <Steps items={stepsCreateIssue} />
          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Xem & chỉnh sửa chi tiết', 'View & Edit Details')}</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>{L('Click vào tiêu đề', 'Click the title')}</strong> → {L('chỉnh sửa trực tiếp (inline edit).', 'edit inline.')}</p>
            <p>• <strong>{L('Click vào mô tả', 'Click the description')}</strong> → {L('mở vùng soạn thảo.', 'open the editor.')}</p>
            <p>• {L('Thay đổi Trạng thái, Độ ưu tiên, Sprint ngay trên panel.', 'Change Status, Priority, Sprint directly in the panel.')}</p>
            <p>• {L('Tab ', 'The ')} <strong>Comments</strong> {L('→ thêm bình luận, sửa/xóa bình luận của mình.', 'tab → add, edit, or delete your own comments.')}</p>
            <p>• {L('Tab ', 'The ')} <strong>Activity</strong> {L('→ xem toàn bộ lịch sử thay đổi.', 'tab → view the full change history.')}</p>
            <p>• {L('Nhấn ', 'Click ')} <strong>"{L('Open full page', 'Open full page')}"</strong> {L('để mở trang đầy đủ.', 'to open the full-page view.')}</p>
          </div>
        </SubSection>

        <SubSection id="ug-issue-hierarchy" title={L('Phân cấp Issue cha-con', 'Parent-Child Hierarchy')}>
          <p className="text-sm text-gray-600 mb-3">{L('Mỗi issue có thể có nhiều subtask. Mã tự sinh: ERP-5 → ERP-5.1, ERP-5.2,...', 'Each issue can have multiple subtasks. Keys are auto-generated: ERP-5 → ERP-5.1, ERP-5.2,...')}</p>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{L('Thêm subtask', 'Add a Subtask')}</h4>
          <Steps items={stepsAddSubtask} />
          <Callout type="info">{L('Subtask kế thừa Sprint và Dự án từ task cha. Có thể gán người thực hiện khác nhau cho mỗi subtask.', 'Subtasks inherit the Sprint and Project from their parent. Each subtask can have a different assignee.')}</Callout>
        </SubSection>

        <SubSection id="ug-issue-labels" title={L('Nhãn, Clone & Move', 'Labels, Clone & Move')}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{L('Nhãn (Labels)', 'Labels')}</h4>
          <p className="text-sm text-gray-600 mb-2">{L('Nhãn là các tag tự do để phân loại issue. Nhiều nhãn phân cách bằng dấu phẩy.', 'Labels are free-form tags for classifying issues. Multiple labels are separated by commas.')}</p>
          <Steps items={stepsLabels} />
          <Callout type="tip">{L('Nhãn có thể dùng để lọc trong Tìm kiếm nâng cao.', 'Labels can be used as filters in Advanced Search.')}</Callout>

          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Clone Issue', 'Clone an Issue')}</h4>
          <Steps items={stepsClone} />

          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-5">{L('Move Issue sang dự án khác', 'Move Issue to Another Project')}</h4>
          <Steps items={stepsMove} />
          <Callout type="warning">{L('Sau khi Move, issue sẽ có mã mới theo dự án đích. Link cũ sẽ không còn hiệu lực.', 'After moving, the issue gets a new key in the target project. Old links will no longer be valid.')}</Callout>
        </SubSection>

        <SubSection id="ug-issue-social" title={L('Watch, Vote & Worklog', 'Watch, Vote & Worklog')}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            <Eye className="w-4 h-4 inline mr-1 text-blue-500" /> {L('Watch — Theo dõi issue', 'Watch — Follow an Issue')}
          </h4>
          <p className="text-sm text-gray-600 mb-3">{L('Nhấn nút Watch (icon mắt) ở header chi tiết issue để nhận thông báo khi issue được cập nhật. Số người đang theo dõi hiển thị bên cạnh icon.', 'Click the Watch button (eye icon) in the issue detail header to get notified when the issue is updated. The watcher count is shown next to the icon.')}</p>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">
            <ThumbsUp className="w-4 h-4 inline mr-1 text-amber-500" /> {L('Vote — Bình chọn', 'Vote')}
          </h4>
          <p className="text-sm text-gray-600 mb-3">{L('Nhấn nút Vote (icon ngón cái) để thể hiện mức độ quan trọng. Issues có nhiều vote thường được ưu tiên xử lý. Mỗi người chỉ vote được 1 lần.', 'Click the Vote button (thumbs-up icon) to signal importance. Issues with more votes are often prioritized. Each user can only vote once.')}</p>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-4">
            <Clock className="w-4 h-4 inline mr-1 text-green-500" /> {L('Worklog — Ghi giờ làm việc', 'Worklog — Log Work Hours')}
          </h4>
          <Steps items={stepsWorklog} />
          <Callout type="info">{L('Tổng giờ worklog được dùng trong báo cáo Khối lượng công việc của từng thành viên.', 'Total worklog hours are used in the Team Workload report for each member.')}</Callout>
        </SubSection>

        <SubSection id="ug-issue-links" title={L('Liên kết giữa các Issue', 'Issue Links')}>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">{L('Các loại liên kết', 'Link Types')}</div>
            <div className="divide-y divide-gray-100">
              {linkTypes.map((l) => (
                <div key={l.type} className="flex items-center gap-3 px-4 py-2.5">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700 w-36 flex-shrink-0">{l.type}</code>
                  <span className="text-sm text-gray-600">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <Steps items={stepsAddLink} />
        </SubSection>
      </Section>

      {/* ── Search ── */}
      <Section id="ug-search" title={L('🔍 Tìm kiếm & Bộ lọc', '🔍 Search & Filters')}>

        <SubSection id="ug-adv-search" title={L('Tìm kiếm nâng cao', 'Advanced Search')}>
          <p className="text-sm text-gray-600 mb-3">{L('Tìm kiếm issue trên toàn bộ dự án bạn tham gia. Truy cập từ sidebar: Advanced Search.', 'Search issues across all projects you belong to. Access from sidebar: Advanced Search.')}</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{L('Các bộ lọc hỗ trợ', 'Available Filters')}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: <Search className="w-3.5 h-3.5 text-blue-400" />,       label: L('Từ khóa', 'Keyword'),   desc: L('tiêu đề, mã, nhãn', 'title, key, labels') },
                { icon: <FolderKanban className="w-3.5 h-3.5 text-purple-400" />, label: L('Dự án', 'Project'),   desc: L('giới hạn 1 dự án', 'limit to 1 project') },
                { icon: <Filter className="w-3.5 h-3.5 text-green-400" />,       label: L('Trạng thái', 'Status'), desc: 'TODO → DONE' },
                { icon: <ArrowRight className="w-3.5 h-3.5 text-orange-400" />,  label: L('Độ ưu tiên', 'Priority'), desc: 'LOW → CRITICAL' },
                { icon: <Tag className="w-3.5 h-3.5 text-pink-400" />,           label: L('Loại', 'Type'),         desc: 'Task / Bug / Story / Epic' },
                { icon: <Users className="w-3.5 h-3.5 text-blue-400" />,         label: L('Người thực hiện', 'Assignee'), desc: L('lọc theo thành viên', 'filter by member') },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">{f.icon}<strong>{f.label}</strong> — {f.desc}</div>
              ))}
            </div>
          </div>
          <Steps items={stepsSearch} />
          <Callout type="tip">{L('Kết quả sắp xếp theo ngày cập nhật mới nhất. Kết hợp nhiều bộ lọc để thu hẹp kết quả.', 'Results are sorted by most recently updated. Combine multiple filters to narrow results.')}</Callout>
        </SubSection>

        <SubSection id="ug-saved-filters" title={L('Bộ lọc đã lưu', 'Saved Filters')}>
          <Steps items={stepsSavedFilter} />
          <div className="grid grid-cols-3 gap-3 my-4 text-sm">
            {[
              { icon: '⭐', title: L('Yêu thích', 'Favorite'), desc: L('Ghim bộ lọc hay dùng lên đầu', 'Pin frequently used filters to the top'), cls: 'border-amber-200 bg-amber-50 text-amber-800' },
              { icon: '🌐', title: L('Chia sẻ', 'Shared'),    desc: L('Cho phép người khác dùng bộ lọc', 'Let others use your filters'), cls: 'border-blue-200 bg-blue-50 text-blue-800' },
              { icon: '🔒', title: L('Riêng tư', 'Private'),  desc: L('Chỉ bạn nhìn thấy', 'Only visible to you'), cls: 'border-gray-200 bg-gray-50 text-gray-800' },
            ].map((card) => (
              <div key={card.title} className={`border rounded-lg p-3 text-center ${card.cls}`}>
                <div className="text-lg mb-1">{card.icon}</div>
                <p className="font-medium text-sm">{card.title}</p>
                <p className="text-xs mt-0.5">{card.desc}</p>
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* ── Reports ── */}
      <Section id="ug-reports" title={L('📊 Báo cáo dự án', '📊 Project Reports')}>
        <p className="text-sm text-gray-600 mb-5">{L('Vào dự án → tab ', 'Go to the project → ')} <strong>Reports</strong>{L('. Có 4 loại báo cáo:', '. There are 4 report types:')}</p>

        <SubSection id="ug-report-overdue" title={L('Quá hạn — Overdue Issues', 'Overdue Issues')}>
          <p className="text-sm text-gray-600 mb-2">{L('Liệt kê tất cả issue có Hạn hoàn thành đã qua mà chưa DONE. Hiển thị: Mã, Tiêu đề, Loại, Độ ưu tiên, Trạng thái, Hạn, Người thực hiện.', 'Lists all issues whose Due Date has passed and are not DONE yet. Shows: Key, Title, Type, Priority, Status, Due Date, Assignee.')}</p>
          <Callout type="tip">{L('Nhấn vào dòng issue để mở chi tiết và xử lý ngay.', 'Click an issue row to open its details and take action immediately.')}</Callout>
        </SubSection>

        <SubSection id="ug-report-workload" title={L('Khối lượng công việc — Team Workload', 'Team Workload')}>
          <p className="text-sm text-gray-600">{L('Biểu đồ cột ngang thể hiện số issue được giao cho mỗi thành viên. Giúp nhận ra ai đang bị quá tải hoặc thiếu việc để phân công lại.', 'A horizontal bar chart showing the number of issues assigned to each member. Helps identify who is overloaded or under-assigned for rebalancing.')}</p>
        </SubSection>

        <SubSection id="ug-report-cvr" title={L('Tạo vs Giải quyết', 'Created vs Resolved')}>
          <p className="text-sm text-gray-600 mb-2">{L('So sánh số issue được tạo mới và giải quyết theo thời gian. Chọn khoảng: 7 / 14 / 30 / 90 ngày.', 'Compares issues created vs. resolved over time. Choose range: 7 / 14 / 30 / 90 days.')}</p>
          <p className="text-sm text-gray-600">{L('Nếu cột Tạo mới liên tục cao hơn Giải quyết → dự án đang tích lũy nợ kỹ thuật.', 'If the Created bar is consistently higher than Resolved → the project is accumulating technical debt.')}</p>
        </SubSection>

        <SubSection id="ug-report-resolution" title={L('Thời gian xử lý — Resolution Time', 'Resolution Time')}>
          <p className="text-sm text-gray-600 mb-2">{L('Thời gian trung bình từ lúc tạo đến DONE. Hiển thị theo từng loại issue để đánh giá hiệu quả nhóm.', 'Average time from creation to DONE. Broken down by issue type to assess team performance.')}</p>
          <Callout type="info">{L('Chỉ tính các issue có Ngày giải quyết (Resolution Date) được điền. Nhớ cập nhật trường này khi hoàn thành.', 'Only counts issues with a Resolution Date filled in. Remember to update this field when an issue is done.')}</Callout>
        </SubSection>
      </Section>

      {/* ── Components & Versions ── */}
      <Section id="ug-comp-ver" title={L('🧩 Components & Versions', '🧩 Components & Versions')}>

        <SubSection id="ug-components" title={L('Thành phần dự án (Components)', 'Project Components')}>
          <p className="text-sm text-gray-600 mb-3">{L('Components là các phần/module của dự án (VD: Frontend, Backend, API). Vào dự án → Components.', 'Components are modules/parts of the project (e.g. Frontend, Backend, API). Go to project → Components.')}</p>
          <Steps items={stepsCreateComponent} />
          <Callout type="tip">{L('Sau khi tạo, gán issue vào component qua trường Component trong form tạo/sửa issue.', 'After creating a component, assign issues to it using the Component field in the create/edit issue form.')}</Callout>
        </SubSection>

        <SubSection id="ug-versions" title={L('Phiên bản release (Versions)', 'Release Versions')}>
          <p className="text-sm text-gray-600 mb-3">{L('Versions quản lý các mốc phát hành (VD: v1.0.0, 2024.Q4). Vào dự án → Versions.', 'Versions track release milestones (e.g. v1.0.0, 2024.Q4). Go to project → Versions.')}</p>
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge color="bg-blue-100 text-blue-700" label="UNRELEASED" />
            <Badge color="bg-green-100 text-green-700" label="RELEASED" />
            <Badge color="bg-gray-100 text-gray-600" label="ARCHIVED" />
          </div>
          <Steps items={stepsCreateVersion} />
        </SubSection>
      </Section>

      {/* ── Tips ── */}
      <Section id="ug-tips" title={L('💡 Mẹo & Phím tắt', '💡 Tips & Shortcuts')}>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-blue-500" /> {L('Thao tác nhanh', 'Quick Actions')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">Enter</kbd> — {L('Tìm kiếm nhanh khi đang nhập từ khóa.', 'Trigger search while typing a keyword.')}</p>
              <p>• <strong>{L('Kéo thả', 'Drag & drop')}</strong> {L('card trên Board hoặc Backlog để thay đổi trạng thái/sprint.', 'cards on the Board or Backlog to change status/sprint.')}</p>
              <p>• <strong>{L('Click vào avatar', 'Click an avatar')}</strong> {L('trong bảng task để lọc nhanh theo người thực hiện.', 'in the task table to quickly filter by assignee.')}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> {L('Mẹo sử dụng hiệu quả', 'Best Practices')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              {[
                L('Dùng Labels nhất quán trong nhóm (VD: hotfix, tech-debt, blocked) để dễ lọc.', 'Use Labels consistently across the team (e.g. hotfix, tech-debt, blocked) for easy filtering.'),
                L('Ghi Worklog hàng ngày thay vì để cuối sprint — số liệu sẽ chính xác hơn.', 'Log work daily rather than at the end of the sprint — data will be more accurate.'),
                L('Lưu các bộ lọc hay dùng vào Saved Filters để tiết kiệm thời gian.', 'Save frequently used filters in Saved Filters to save time.'),
                L('Dùng EPIC để nhóm các story liên quan, giúp theo dõi tiến độ tổng thể.', 'Use EPICs to group related stories for high-level progress tracking.'),
                L('Điền Hạn hoàn thành và Ngày giải quyết đầy đủ để báo cáo chính xác.', 'Always fill in Due Date and Resolution Date for accurate reports.'),
                L('Dùng Watch để nhận thông báo về issue quan trọng dù không phải người thực hiện.', 'Use Watch to stay notified about important issues even if you\'re not the assignee.'),
              ].map((tip, i) => <p key={i}>• {tip}</p>)}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-500" /> {L('Luồng làm việc Scrum điển hình', 'Typical Scrum Workflow')}
            </p>
            <div className="space-y-2">
              {scrum.map((step, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="border-t border-gray-200 pt-8 text-center mb-8">
        <p className="text-sm text-gray-400">{L('Cần hỗ trợ thêm? Liên hệ quản trị viên hệ thống.', 'Need more help? Contact your system administrator.')}</p>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   API Docs Content
═══════════════════════════════════════════════════════════════ */
function ApiDocsContent({ isVi }: { isVi: boolean }) {
  const L = (vi: string, en: string) => (isVi ? vi : en);
  const BASE = 'http://localhost:8080';
  return (
    <>
      <Section id="overview" title={L('📖 Tổng quan', '📖 Overview')}>
        <p className="text-gray-600 leading-relaxed mb-4">
          {L('Hệ thống Tellme cung cấp REST API để tích hợp và tự động hóa quản lý dự án, task, sprint và thành viên. Tất cả API yêu cầu xác thực JWT.', 'Tellme provides a REST API for integrating and automating project management, tasks, sprints, and members. All endpoints require JWT authentication.')}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">Base URL</p>
          <code className="text-blue-700 font-mono text-sm">{BASE}</code>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">{L('Danh sách endpoint', 'Endpoint List')}</div>
          <div className="p-4 space-y-1">
            <Endpoint method="POST"   path="/api/auth/login"                desc={L('Đăng nhập', 'Login')} />
            <Endpoint method="GET"    path="/api/projects/{id}/issues"       desc={L('Danh sách task', 'List tasks')} />
            <Endpoint method="POST"   path="/api/projects/{id}/issues"       desc={L('Tạo task mới', 'Create task')} />
            <Endpoint method="GET"    path="/api/issues/{id}"                desc={L('Lấy task theo ID', 'Get task by ID')} />
            <Endpoint method="PUT"    path="/api/issues/{id}"                desc={L('Cập nhật task', 'Update task')} />
            <Endpoint method="DELETE" path="/api/issues/{id}"                desc={L('Xóa task', 'Delete task')} />
            <Endpoint method="PATCH"  path="/api/issues/{id}/status"         desc={L('Cập nhật trạng thái', 'Update status')} />
            <Endpoint method="GET"    path="/api/issues/{id}/subtasks"        desc={L('Danh sách sub-task', 'List sub-tasks')} />
            <Endpoint method="GET"    path="/api/issues/search"              desc={L('Tìm kiếm nâng cao', 'Advanced search')} />
            <Endpoint method="GET"    path="/api/issues/my"                  desc={L('Task được giao cho tôi', 'My assigned tasks')} />
          </div>
        </div>
      </Section>

      <Section id="auth" title={L('🔑 Xác thực', '🔑 Authentication')}>
        <p className="text-gray-600 mb-4">
          {L('Gọi API đăng nhập để nhận JWT token, sau đó đính kèm vào header Authorization của mọi request.', 'Call the login endpoint to receive a JWT token, then attach it to the Authorization header of every request.')}
        </p>
        <SubSection id="auth-login" title={L('Đăng nhập & lấy token', 'Login & get token')}>
          <CodeBlock language="bash" code={`
curl -X POST ${BASE}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "password": "yourpassword" }'`} />
          <CodeBlock language="json" code={`
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "user@example.com", "fullName": "Nguyen Van A", "role": "USER" }
}`} />
          <Callout type="warning">{L('Token có hiệu lực trong 7 ngày.', 'Token is valid for 7 days.')}</Callout>
        </SubSection>
        <SubSection id="auth-header" title={L('Cách đính kèm token', 'How to attach the token')}>
          <CodeBlock language="bash" code={`
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" ${BASE}/api/...`} />
          <CodeBlock language="javascript" code={`
const res = await fetch('${BASE}/api/...', {
  headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
});`} />
        </SubSection>
      </Section>

      <Section id="task" title="📋 Task API">
        <SubSection id="task-list" title={L('Lấy danh sách task', 'List tasks')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="GET" /><code className="font-mono text-sm text-gray-700">/api/projects/{'{projectId}'}/issues</code></div>
          <CodeBlock language="bash" code={`
curl -H "Authorization: Bearer $TOKEN" "${BASE}/api/projects/1/issues"
curl -H "Authorization: Bearer $TOKEN" "${BASE}/api/projects/1/issues?sprintId=backlog"
curl -H "Authorization: Bearer $TOKEN" "${BASE}/api/projects/1/issues?status=IN_PROGRESS"`} />
        </SubSection>
        <SubSection id="task-get" title={L('Lấy task theo ID', 'Get task by ID')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="GET" /><code className="font-mono text-sm text-gray-700">/api/issues/{'{id}'}</code></div>
          <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" "${BASE}/api/issues/5"`} />
        </SubSection>
        <SubSection id="task-create" title={L('Tạo task mới', 'Create a task')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="POST" /><code className="font-mono text-sm text-gray-700">/api/projects/{'{projectId}'}/issues</code></div>
          <CodeBlock language="bash" code={`
curl -X POST ${BASE}/api/projects/1/issues \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Design login API",
    "type": "TASK", "priority": "HIGH", "status": "TODO",
    "assigneeId": 2, "sprintId": 3, "dueDate": "2026-06-15",
    "originalEstimateHours": 8, "severity": "MAJOR"
  }'`} />
        </SubSection>
        <SubSection id="task-update" title={L('Cập nhật task', 'Update a task')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="PUT" /><code className="font-mono text-sm text-gray-700">/api/issues/{'{id}'}</code></div>
          <CodeBlock language="bash" code={`
curl -X PUT ${BASE}/api/issues/12 \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "status": "IN_PROGRESS", "progressPercent": 30 }'`} />
        </SubSection>
        <SubSection id="task-delete" title={L('Xóa task', 'Delete a task')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="DELETE" /><code className="font-mono text-sm text-gray-700">/api/issues/{'{id}'}</code></div>
          <Callout type="warning">{L('Hành động này không thể hoàn tác. Tất cả sub-task cũng bị xóa theo.', 'This action cannot be undone. All sub-tasks will be deleted too.')}</Callout>
          <CodeBlock language="bash" code={`curl -X DELETE ${BASE}/api/issues/12 -H "Authorization: Bearer $TOKEN"
# Response: HTTP 204 No Content`} />
        </SubSection>
        <SubSection id="task-status" title={L('Cập nhật trạng thái nhanh', 'Quick status update')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="PATCH" /><code className="font-mono text-sm text-gray-700">/api/issues/{'{id}'}/status</code></div>
          <CodeBlock language="bash" code={`
curl -X PATCH ${BASE}/api/issues/12/status \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "status": "DONE", "position": 0 }'`} />
        </SubSection>
        <SubSection id="task-subtask" title={L('Tạo Sub-task', 'Create a sub-task')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="POST" /><code className="font-mono text-sm text-gray-700">/api/projects/{'{projectId}'}/issues</code></div>
          <p className="text-sm text-gray-600 mb-3">{L('Thêm parentIssueId để tạo sub-task. Mã tự sinh: ERP-5.1, ERP-5.2,...', 'Add parentIssueId to create a sub-task. Key auto-generated: ERP-5.1, ERP-5.2,...')}</p>
          <CodeBlock language="bash" code={`
curl -X POST ${BASE}/api/projects/1/issues \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "title": "Write unit tests for login API", "parentIssueId": 5 }'`} />
        </SubSection>
        <SubSection id="task-subtasks" title={L('Lấy danh sách Sub-tasks', 'List sub-tasks')}>
          <div className="flex items-center gap-3 mb-3"><MethodBadge method="GET" /><code className="font-mono text-sm text-gray-700">/api/issues/{'{id}'}/subtasks</code></div>
          <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" "${BASE}/api/issues/5/subtasks"`} />
        </SubSection>
      </Section>

      <Section id="project" title="🗂 Project API">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="p-4 space-y-1">
            <Endpoint method="GET"    path="/api/projects"                     desc={L('Danh sách dự án', 'List my projects')} />
            <Endpoint method="POST"   path="/api/projects"                     desc={L('Tạo dự án mới', 'Create project')} />
            <Endpoint method="GET"    path="/api/projects/{id}"                desc={L('Chi tiết dự án', 'Get project')} />
            <Endpoint method="PUT"    path="/api/projects/{id}"                desc={L('Cập nhật dự án', 'Update project')} />
            <Endpoint method="DELETE" path="/api/projects/{id}"                desc={L('Xóa dự án', 'Delete project')} />
            <Endpoint method="GET"    path="/api/projects/{id}/members"        desc={L('Danh sách thành viên', 'List members')} />
            <Endpoint method="POST"   path="/api/projects/{id}/members"        desc={L('Thêm thành viên', 'Add member')} />
            <Endpoint method="DELETE" path="/api/projects/{id}/members/{uid}"  desc={L('Xóa thành viên', 'Remove member')} />
            <Endpoint method="GET"    path="/api/projects/{id}/components"     desc={L('Danh sách components', 'List components')} />
            <Endpoint method="GET"    path="/api/projects/{id}/versions"       desc={L('Danh sách versions', 'List versions')} />
            <Endpoint method="GET"    path="/api/projects/{id}/reports/overdue" desc={L('Báo cáo quá hạn', 'Overdue report')} />
            <Endpoint method="GET"    path="/api/projects/{id}/reports/workload" desc={L('Báo cáo khối lượng', 'Workload report')} />
          </div>
        </div>
        <SubSection id="project-create" title={L('Tạo dự án mới', 'Create a project')}>
          <CodeBlock language="bash" code={`
curl -X POST ${BASE}/api/projects \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ERP System 2026", "key": "ERP",
    "description": "Internal ERP system",
    "status": "PLANNING", "projectType": "SOFTWARE"
  }'`} />
          <Callout type="info">{L('key phải là duy nhất, chỉ chữ hoa và số (VD: ERP). Không thể thay đổi sau khi tạo.', '"key" must be unique, uppercase letters and numbers only (e.g. ERP). Cannot be changed after creation.')}</Callout>
        </SubSection>
        <SubSection id="project-members" title={L('Thêm thành viên', 'Add a member')}>
          <CodeBlock language="bash" code={`
curl -X POST ${BASE}/api/projects/1/members \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "userId": 5, "role": "DEVELOPER" }
# Roles: OWNER | MANAGER | DEVELOPER | TESTER | VIEWER'`} />
        </SubSection>
      </Section>

      <div className="border-t border-gray-200 pt-8 text-center mb-8">
        <p className="text-sm text-gray-400 mb-3">{L('Cần hỗ trợ thêm? Liên hệ quản trị viên.', 'Need more help? Contact your administrator.')}</p>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
          <ExternalLink className="w-3.5 h-3.5" />
          {L('Báo lỗi / Đề xuất tính năng', 'Report a bug / Request a feature')}
        </a>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════════ */
type TabType = 'guide' | 'api';

export function HelpPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.language.startsWith('vi');

  const [tab, setTab] = useState<TabType>('guide');
  const [activeId, setActiveId] = useState('ug-start');
  const contentRef = useRef<HTMLDivElement>(null);

  const currentNav = tab === 'guide' ? getUserNav(isVi) : getApiNav(isVi);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveId(id); }
  };

  const switchTab = (t: TabType) => {
    setTab(t);
    setActiveId(t === 'guide' ? 'ug-start' : 'overview');
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = () => {
      const sections = el.querySelectorAll('[id]');
      let current = activeId;
      sections.forEach((s) => { if (s.getBoundingClientRect().top < 120) current = s.id; });
      setActiveId(current);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => switchTab('guide')}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              tab === 'guide' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isVi ? '📖 Hướng dẫn' : '📖 User Guide'}
          </button>
          <button
            onClick={() => switchTab('api')}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              tab === 'api' ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isVi ? '🔧 Tài liệu API' : '🔧 API Docs'}
          </button>
        </div>
        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <LeftNav nav={currentNav} activeId={activeId} onScroll={scrollTo} />
        </div>
      </aside>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {tab === 'guide'
            ? <UserGuideContent isVi={isVi} />
            : <ApiDocsContent isVi={isVi} />
          }
        </div>
      </div>
    </div>
  );
}
