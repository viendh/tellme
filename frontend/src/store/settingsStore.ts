import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'MMM D, YYYY';
export type ItemsPerPage = 10 | 20 | 50;
export type Theme = 'light' | 'dark' | 'system';

/** All optional fields that can be toggled on/off on task cards & backlog rows */
export type CardField =
  | 'issueKey'    // PROJ-42 key
  | 'type'        // Story / Bug / Task / Epic icon
  | 'priority'    // Priority icon
  | 'severity'    // Severity dot (MAJOR/CRITICAL)
  | 'dueDate'     // Due date
  | 'assignee'    // Assignee avatar
  | 'progress'    // Progress bar
  | 'issueId'     // Numeric #id
  | 'lastComment' // Snippet of most recent comment
  | 'labels'      // Label tags
  | 'estimate'    // Original estimate (hours)
  | 'module'      // Module name
  | 'environment' // DEV / UAT / PROD
  | 'workflowStep'; // Current workflow step badge

export type CardFieldsConfig = Record<CardField, boolean>;

export const DEFAULT_CARD_FIELDS: CardFieldsConfig = {
  issueKey:     true,
  type:         true,
  priority:     true,
  severity:     true,
  dueDate:      true,
  assignee:     true,
  progress:     true,
  issueId:      false,
  lastComment:  false,
  labels:       false,
  estimate:     false,
  module:       false,
  environment:  false,
  workflowStep: false,
};

/** Ordered list of configurable column IDs for My Issues table */
export const MY_ISSUES_COLUMN_DEFS: Record<string, { label: string; width: string; cardField?: CardField; alwaysVisible?: boolean }> = {
  workflow:    { label: 'Workflow',         cardField: 'workflowStep', width: '120px' },
  environment: { label: 'ENV',              cardField: 'environment',  width: '72px'  },
  status:      { label: 'Trạng thái',       alwaysVisible: true,       width: '120px' },
  priority:    { label: 'Độ ưu tiên',       cardField: 'priority',     width: '100px' },
  type:        { label: 'Loại',             cardField: 'type',         width: '80px'  },
  dueDate:     { label: 'Hạn hoàn thành',   cardField: 'dueDate',      width: '130px' },
  estimate:    { label: 'Ước tính',         cardField: 'estimate',     width: '110px' },
  assignee:    { label: 'Người T.H.',       cardField: 'assignee',     width: '120px' },
  updated:     { label: 'Cập nhật',         alwaysVisible: true,       width: '110px' },
};

export const DEFAULT_MY_ISSUES_COLUMN_ORDER = Object.keys(MY_ISSUES_COLUMN_DEFS);

/** Configurable right-side column IDs for the Backlog row */
export const BACKLOG_COLUMN_DEFS: Record<string, { label: string; width: string; cardField?: CardField; alwaysVisible?: boolean }> = {
  workflow:    { label: 'Workflow',       cardField: 'workflowStep', width: '100px' },
  environment: { label: 'ENV',            cardField: 'environment',  width: '60px'  },
  module:      { label: 'Module',         cardField: 'module',       width: '80px'  },
  estimate:    { label: 'Ước tính',       cardField: 'estimate',     width: '64px'  },
  labels:      { label: 'Nhãn',           cardField: 'labels',       width: '80px'  },
  progress:    { label: 'Tiến độ',        cardField: 'progress',     width: '72px'  },
  dueDate:     { label: 'Hạn',            cardField: 'dueDate',      width: '56px'  },
  severity:    { label: 'Mức độ',         cardField: 'severity',     width: '40px'  },
  priority:    { label: 'Ưu tiên',        cardField: 'priority',     width: '40px'  },
  status:      { label: 'Trạng thái',     alwaysVisible: true,       width: '120px' },
  issueId:     { label: '#ID',            cardField: 'issueId',      width: '52px'  },
  assignee:    { label: 'Người T.H.',     alwaysVisible: true,       width: '40px'  },
};

export const DEFAULT_BACKLOG_COLUMN_ORDER = Object.keys(BACKLOG_COLUMN_DEFS);

export interface DisplaySettings {
  theme: Theme;
  dateFormat: DateFormat;
  itemsPerPage: ItemsPerPage;
  compactMode: boolean;
  cardFields: CardFieldsConfig;
  myIssuesColumnOrder: string[];
  backlogColumnOrder: string[];
}

interface SettingsState extends DisplaySettings {
  setTheme: (t: Theme) => void;
  setDateFormat: (fmt: DateFormat) => void;
  setItemsPerPage: (n: ItemsPerPage) => void;
  setCompactMode: (v: boolean) => void;
  setCardField: (field: CardField, value: boolean) => void;
  setMyIssuesColumnOrder: (order: string[]) => void;
  setBacklogColumnOrder: (order: string[]) => void;
  reset: () => void;
}

const DEFAULTS: DisplaySettings = {
  theme: 'light',
  dateFormat: 'DD/MM/YYYY',
  itemsPerPage: 20,
  compactMode: false,
  cardFields: DEFAULT_CARD_FIELDS,
  myIssuesColumnOrder: DEFAULT_MY_ISSUES_COLUMN_ORDER,
  backlogColumnOrder: DEFAULT_BACKLOG_COLUMN_ORDER,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setTheme:        (theme)        => set({ theme }),
      setDateFormat:   (dateFormat)   => set({ dateFormat }),
      setItemsPerPage: (itemsPerPage) => set({ itemsPerPage }),
      setCompactMode:  (compactMode)  => set({ compactMode }),
      setCardField: (field, value) =>
        set((s) => ({ cardFields: { ...s.cardFields, [field]: value } })),
      setMyIssuesColumnOrder: (myIssuesColumnOrder) => set({ myIssuesColumnOrder }),
      setBacklogColumnOrder:  (backlogColumnOrder)  => set({ backlogColumnOrder }),

      reset: () => set({ ...DEFAULTS }),
    }),
    { name: 'display-settings' }
  )
);
