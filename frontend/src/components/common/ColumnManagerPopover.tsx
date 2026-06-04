import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Lock, Columns, RotateCcw } from 'lucide-react';
import {
  useSettingsStore,
  MY_ISSUES_COLUMN_DEFS,
  DEFAULT_MY_ISSUES_COLUMN_ORDER,
  BACKLOG_COLUMN_DEFS,
  DEFAULT_BACKLOG_COLUMN_ORDER,
} from '../../store/settingsStore';
import type { CardField, CardFieldsConfig } from '../../store/settingsStore';

type StoreKey = 'myIssues' | 'backlog';

const STORE_CONFIG: Record<StoreKey, {
  defs: Record<string, { label: string; width: string; cardField?: CardField; alwaysVisible?: boolean }>;
  defaultOrder: string[];
}> = {
  myIssues: { defs: MY_ISSUES_COLUMN_DEFS, defaultOrder: DEFAULT_MY_ISSUES_COLUMN_ORDER },
  backlog:  { defs: BACKLOG_COLUMN_DEFS,   defaultOrder: DEFAULT_BACKLOG_COLUMN_ORDER  },
};

// ── Sortable item ────────────────────────────────────────────────────────────

interface SortableColumnItemProps {
  id: string;
  label: string;
  visible: boolean;
  alwaysVisible?: boolean;
  onToggle: () => void;
}

function SortableColumnItem({ id, label, visible, alwaysVisible, onToggle }: SortableColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <span className={`flex-1 text-xs font-medium ${visible ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </span>

      {alwaysVisible ? (
        <span title="Không thể ẩn" className="text-gray-300 dark:text-gray-600 flex-shrink-0">
          <Lock className="w-3.5 h-3.5" />
        </span>
      ) : (
        <button
          onClick={onToggle}
          className={`flex-shrink-0 transition-colors ${visible ? 'text-blue-500 hover:text-blue-700' : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'}`}
          title={visible ? 'Ẩn cột' : 'Hiện cột'}
        >
          {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface ColumnManagerPopoverProps {
  storeKey?: StoreKey;
  className?: string;
}

export function ColumnManagerPopover({ storeKey = 'myIssues', className = '' }: ColumnManagerPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cardFields    = useSettingsStore((s) => s.cardFields);
  const setCardField  = useSettingsStore((s) => s.setCardField);

  const myIssuesColumnOrder   = useSettingsStore((s) => s.myIssuesColumnOrder);
  const setMyIssuesColumnOrder = useSettingsStore((s) => s.setMyIssuesColumnOrder);
  const backlogColumnOrder    = useSettingsStore((s) => s.backlogColumnOrder);
  const setBacklogColumnOrder  = useSettingsStore((s) => s.setBacklogColumnOrder);

  const columnOrder    = storeKey === 'myIssues' ? myIssuesColumnOrder : backlogColumnOrder;
  const setColumnOrder = storeKey === 'myIssues' ? setMyIssuesColumnOrder : setBacklogColumnOrder;

  const { defs, defaultOrder } = STORE_CONFIG[storeKey];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  const toggleColumn = (id: string) => {
    const def = defs[id];
    if (!def?.cardField) return;
    setCardField(def.cardField as CardField, !(cardFields as CardFieldsConfig)[def.cardField as CardField]);
  };

  const visibleCount = columnOrder.filter((id) => {
    const def = defs[id];
    if (!def) return false;
    return def.alwaysVisible ?? (def.cardField ? (cardFields as CardFieldsConfig)[def.cardField as CardField] : true);
  }).length;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          open
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <Columns className="w-3.5 h-3.5" />
        Cột
        <span className="ml-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] px-1 rounded">
          {visibleCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Quản lý cột</span>
            <button
              onClick={() => setColumnOrder(defaultOrder)}
              title="Đặt lại mặc định"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-1 py-1.5 max-h-80 overflow-y-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                {columnOrder.map((id) => {
                  const def = defs[id];
                  if (!def) return null;
                  const visible = def.alwaysVisible ?? (def.cardField ? (cardFields as CardFieldsConfig)[def.cardField as CardField] : true);
                  return (
                    <SortableColumnItem
                      key={id}
                      id={id}
                      label={def.label}
                      visible={visible}
                      alwaysVisible={def.alwaysVisible}
                      onToggle={() => toggleColumn(id)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>

          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            Kéo <GripVertical className="w-3 h-3" /> để sắp xếp
          </div>
        </div>
      )}
    </div>
  );
}
