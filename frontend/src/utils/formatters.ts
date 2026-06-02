import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useSettingsStore } from '../store/settingsStore';
import type { DateFormat } from '../store/settingsStore';

/** Map từ DateFormat enum → date-fns pattern */
const DATE_FNS_MAP: Record<DateFormat, string> = {
  'DD/MM/YYYY':  'dd/MM/yyyy',
  'MM/DD/YYYY':  'MM/dd/yyyy',
  'YYYY-MM-DD':  'yyyy-MM-dd',
  'MMM D, YYYY': 'MMM d, yyyy',
};

/** Lấy pattern date-fns tương ứng với cài đặt hiện tại */
function getDatePattern(): string {
  return DATE_FNS_MAP[useSettingsStore.getState().dateFormat];
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), getDatePattern());
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), `${getDatePattern()} HH:mm`);
  } catch {
    return dateString;
  }
}

export function formatRelative(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatDateInput(dateString?: string): string {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
