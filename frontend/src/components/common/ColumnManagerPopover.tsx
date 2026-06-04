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
} from '../../store/settingsStore';
import type { CardField } from '../../store/settingsStore';

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
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Label */}
      <span className={`flex-1 text-xs font-medium ${visible ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </span>

      {/* Toggle */}
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

interface ColumnManagerPopoverProps {
  className?: string;
}

export function ColumnManagerPopover({ className = '' }: ColumnManagerPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cardFields    = useSettingsStore((s) => s.cardFields);
  const setCardField  = useSettingsStore((s) => s.setCardField);
  const columnOrder   = useSettingsStore((s) => s.myIssuesColumnOrder);
  const setColumnOrder = useSettingsStore((s) => s.setMyIssuesColumnOrder);

  // Close on outside click
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
    const def = MY_ISSUES_COLUMN_DEFS[id];
    if (!def?.cardField) return;
    setCardField(def.cardField as CardField, !cardFields[def.cardField as CardField]);
  };

  const resetToDefault = () => {
    setColumnOrder(DEFAULT_MY_ISSUES_COLUMN_ORDER);
  };

  const visibleCount = columnOrder.filter((id) => {
    const def = MY_ISSUES_COLUMN_DEFS[id];
    if (!def) return false;
    return def.alwaysVisible ?? (def.cardField ? cardFields[def.cardField as CardField] : true);
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
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Quản lý cột</span>
            <button
              onClick={resetToDefault}
              title="Đặt lại mặc định"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sortable list */}
          <div className="px-1 py-1.5 max-h-72 overflow-y-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                {columnOrder.map((id) => {
                  const def = MY_ISSUES_COLUMN_DEFS[id];
                  if (!def) return null;
                  const visible = def.alwaysVisible ?? (def.cardField ? cardFields[def.cardField as CardField] : true);
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

          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500">
            Kéo <GripVertical className="w-3 h-3 inline" /> để sắp xếp · <Eye className="w-3 h-3 inline" /> để ẩn/hiện
          </div>
        </div>
      )}
    </div>
  );
}
