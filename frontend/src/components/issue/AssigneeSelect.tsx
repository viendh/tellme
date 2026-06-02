import { useState, useRef, useEffect } from 'react';
import { User, X, ChevronDown } from 'lucide-react';
import { useProjectMembers } from '../../hooks/useProjectMembers';
import { Avatar } from '../common/Avatar';
import type { User as UserType } from '../../types';

interface AssigneeSelectProps {
  projectId: number;
  value: UserType | null | undefined;
  onChange: (user: UserType | null) => void;
  disabled?: boolean;
}

export function AssigneeSelect({ projectId, value, onChange, disabled }: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: members = [] } = useProjectMembers(projectId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white w-full text-left"
      >
        {value ? (
          <>
            <Avatar user={value} size="xs" />
            <span className="flex-1 truncate text-gray-900">{value.fullName}</span>
            <X
              className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-gray-400">Unassigned</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            Unassigned
          </button>
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                onChange(member);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-blue-50 ${
                value?.id === member.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <Avatar user={member} size="xs" />
              <div className="flex-1 text-left">
                <p className="font-medium">{member.fullName}</p>
                <p className="text-xs text-gray-400">{member.email}</p>
              </div>
              {value?.id === member.id && <span className="text-blue-600 text-xs">✓</span>}
            </button>
          ))}
          {members.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">No members found</p>
          )}
        </div>
      )}
    </div>
  );
}
