export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  notifyOnAssigned?: boolean;
  notifyOnStatusChange?: boolean;
  notifyOnComment?: boolean;
}

export type ProjectStatus =
  | 'ACTIVE' | 'DRAFT' | 'PLANNING' | 'IN_PROGRESS'
  | 'UAT' | 'GO_LIVE' | 'CLOSED' | 'ARCHIVED';

export type ProjectType = 'SOFTWARE' | 'BUSINESS' | 'INFRASTRUCTURE';
export type ProjectVisibility = 'PRIVATE' | 'PUBLIC' | 'INTERNAL';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectPhase = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSING';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BoardType = 'SCRUM' | 'KANBAN';
export type EstimationType = 'STORY_POINT' | 'HOURS';
export type CapexOpexType = 'CAPEX' | 'OPEX';

export interface Project {
  id: number;
  name: string;
  key: string;
  description?: string;
  owner: User;
  createdAt: string;
  // Basic
  status?: ProjectStatus;
  projectType?: ProjectType;
  visibility?: ProjectVisibility;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  progressPercent?: number;
  // Progress
  releaseVersion?: string;
  milestone?: string;
  velocity?: number;
  roadmapEnabled?: boolean;
  burndownEnabled?: boolean;
  // Agile
  boardType?: BoardType;
  estimationType?: EstimationType;
  sprintDurationDays?: number;
  wipLimit?: number;
  backlogEnabled?: boolean;
  // Financial
  budgetAmount?: number;
  plannedCost?: number;
  actualCost?: number;
  currencyCode?: string;
  capexOpexType?: CapexOpexType;
  contractNo?: string;
  // Governance
  phase?: ProjectPhase;
  riskLevel?: RiskLevel;
  approvalStatus?: ApprovalStatus;
  // DevOps
  gitRepositoryUrl?: string;
  ciPipelineUrl?: string;
  deploymentEnv?: 'DEV' | 'UAT' | 'PROD';
  releaseTag?: string;
  testCoverage?: number;
  // Workflow
  workflowId?: number;
  workflowName?: string;
}

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
  id: number;
  projectId: number;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export type IssueType = 'STORY' | 'BUG' | 'TASK' | 'EPIC';
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'UAT' | 'DONE';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type IssueEnvironment = 'DEV' | 'UAT' | 'PROD';

export interface Attachment {
  id: number;
  issueId: number;
  originalName: string;
  fileSize: number;
  contentType: string;
  downloadUrl: string;
  uploader: User;
  createdAt: string;
}

export interface Issue {
  id: number;
  projectId: number;
  projectName?: string;
  projectKey?: string;
  sprint?: Sprint;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: User;
  reporter: User;
  position: number;
  createdAt: string;
  updatedAt: string;
  issueKey?: string;
  severity?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  parentIssueId?: number;
  parentIssueTitle?: string;
  module?: string;
  environment?: 'DEV' | 'UAT' | 'PROD';
  businessImpact?: string;
  rootCause?: string;
  dueDate?: string;
  startDate?: string;
  resolutionDate?: string;
  originalEstimateHours?: number;
  remainingEstimateHours?: number;
  timeSpentHours?: number;
  progressPercent?: number;
  slaHours?: number;
  attachments?: Attachment[];
  labels?: string;
  componentId?: number;
  componentName?: string;
  fixVersionId?: number;
  fixVersionName?: string;
  affectsVersionId?: number;
  affectsVersionName?: string;
  watchCount?: number;
  voteCount?: number;
  watching?: boolean;
  voted?: boolean;
  // Workflow
  currentStepId?: number;
  currentStepName?: string;
  currentStepColor?: string;
  // Last comment snapshot (populated in list responses)
  lastCommentContent?: string;
  lastCommentAuthor?: string;
  lastCommentAt?: string;
}

export interface Comment {
  id: number;
  issueId: number;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  issueId: number;
  user: User;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ProjectRole = 'OWNER' | 'MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER';

export interface ProjectMember {
  id: number;
  user: User;
  role: ProjectRole;
}

export interface AddMemberInput {
  userId: number;
  role: ProjectRole;
}

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  members?: AddMemberInput[];
  // Basic
  status?: ProjectStatus;
  projectType?: ProjectType;
  visibility?: ProjectVisibility;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  progressPercent?: number;
  // Progress
  releaseVersion?: string;
  milestone?: string;
  velocity?: number;
  roadmapEnabled?: boolean;
  burndownEnabled?: boolean;
  // Agile
  boardType?: BoardType;
  estimationType?: EstimationType;
  sprintDurationDays?: number;
  wipLimit?: number;
  backlogEnabled?: boolean;
  // Financial
  budgetAmount?: number;
  plannedCost?: number;
  actualCost?: number;
  currencyCode?: string;
  capexOpexType?: CapexOpexType;
  contractNo?: string;
  // Governance
  phase?: ProjectPhase;
  riskLevel?: RiskLevel;
  approvalStatus?: ApprovalStatus;
  // DevOps
  gitRepositoryUrl?: string;
  ciPipelineUrl?: string;
  deploymentEnv?: 'DEV' | 'UAT' | 'PROD';
  releaseTag?: string;
  testCoverage?: number;
  // Workflow
  workflowId?: number;
  workflowName?: string;
}

export interface UpdateProjectInput extends Omit<CreateProjectInput, 'key' | 'members'> {}

export interface CreateSprintInput {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintInput {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  sprintId?: number;
  assigneeId?: number;
  position?: number;
  severity?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  parentIssueId?: number;
  module?: string;
  environment?: 'DEV' | 'UAT' | 'PROD';
  businessImpact?: string;
  rootCause?: string;
  dueDate?: string;
  startDate?: string;
  originalEstimateHours?: number;
  remainingEstimateHours?: number;
  timeSpentHours?: number;
  progressPercent?: number;
  slaHours?: number;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: IssueType;
  priority?: IssuePriority;
  status?: IssueStatus;
  assigneeId?: number | null;
  sprintId?: number | null;
  severity?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  parentIssueId?: number;
  module?: string;
  environment?: 'DEV' | 'UAT' | 'PROD';
  businessImpact?: string;
  rootCause?: string;
  dueDate?: string;
  startDate?: string;
  originalEstimateHours?: number;
  remainingEstimateHours?: number;
  timeSpentHours?: number;
  progressPercent?: number;
  slaHours?: number;
}

export interface PatchIssueStatusInput {
  status: IssueStatus;
  position?: number;
}

export interface PatchIssueSprintInput {
  sprintId: number | null;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export type IssueLinkType =
  | 'BLOCKS' | 'IS_BLOCKED_BY'
  | 'RELATES_TO'
  | 'DUPLICATES' | 'IS_DUPLICATED_BY'
  | 'CLONES' | 'IS_CLONED_BY';

export interface IssueLink {
  id: number;
  linkType: IssueLinkType;
  issueId: number;
  issueKey?: string;
  issueTitle: string;
  issueStatus: IssueStatus;
  issuePriority: IssuePriority;
  createdAt: string;
}

export interface Worklog {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  timeSpentHours: number;
  startedAt: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type VersionStatus = 'UNRELEASED' | 'RELEASED' | 'ARCHIVED';

export interface Component {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  leadId?: number;
  leadName?: string;
  createdAt: string;
}

export interface Version {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  status: VersionStatus;
  releaseDate?: string;
  startDate?: string;
  createdAt: string;
}

export interface SavedFilter {
  id: number;
  name: string;
  filterCriteria: string;
  creatorId: number;
  creatorName: string;
  isShared: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmailLogStatus = 'SENT' | 'FAILED';
export type EmailLogType = 'ISSUE_ASSIGNED' | 'STATUS_CHANGED' | 'COMMENT_ADDED' | 'ISSUE_CREATED';

export interface EmailLog {
  id: number;
  recipient: string;
  subject: string;
  emailType: EmailLogType;
  status: EmailLogStatus;
  errorMessage?: string;
  errorStack?: string;
  issueId?: number;
  issueTitle?: string;
  sentAt: string;
}

// ─── Workflow ───────────────────────────────────────────────────────────────

export type TransitionRole = 'ANY' | 'ASSIGNEE' | 'REPORTER' | 'MANAGER' | 'ADMIN';
export type WorkflowApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WorkflowStep {
  id: number;
  workflowId?: number;
  name: string;
  color: string;
  position: number;
  isInitial: boolean;
  isFinal: boolean;
  mappedStatus?: string;
}

export interface WorkflowTransition {
  id: number;
  workflowId?: number;
  fromStepId?: number;
  fromStepName?: string;
  toStepId: number;
  toStepName: string;
  name: string;
  requiredRole: TransitionRole;
  requiresApproval: boolean;
  approverRole?: TransitionRole;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  createdBy?: string;
  createdAt: string;
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
}

export interface WorkflowApproval {
  id: number;
  issueId: number;
  issueKey: string;
  issueTitle: string;
  projectId: number;
  projectName: string;
  transitionId: number;
  transitionName: string;
  fromStepName: string;
  toStepName: string;
  status: WorkflowApprovalStatus;
  comment?: string;
  requestedBy: User;
  resolvedBy?: User;
  resolvedAt?: string;
  createdAt: string;
}

export interface WorkflowRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
}

export interface WorkflowStepRequest {
  name: string;
  color?: string;
  position?: number;
  isInitial?: boolean;
  isFinal?: boolean;
  mappedStatus?: string;
}

export interface WorkflowTransitionRequest {
  name: string;
  fromStepId?: number;
  toStepId: number;
  requiredRole?: TransitionRole;
  requiresApproval?: boolean;
  approverRole?: TransitionRole;
}

export interface IssueTransitionRequest {
  transitionId: number;
  comment?: string;
}

export interface ApprovalDecisionRequest {
  comment?: string;
}
