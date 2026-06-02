import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/* ── Excel ────────────────────────────────────────────────────── */
export function exportToExcel(
  filename: string,
  sheetName: string,
  columns: ExportColumn[],
  rows: Row[],
) {
  const headers = columns.map((c) => c.header);
  const data = rows.map((row) => columns.map((c) => row[c.key] ?? ''));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Column widths
  ws['!cols'] = columns.map((c) => ({ wch: c.width ?? 20 }));

  // Header style (bold)
  headers.forEach((_, i) => {
    const cell = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[cell]) {
      ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'EFF6FF' } } };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ── PDF ──────────────────────────────────────────────────────── */
export function exportToPdf(
  filename: string,
  title: string,
  subtitle: string,
  columns: ExportColumn[],
  rows: Row[],
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('Tellme', 14, 14);

  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39); // gray-900
  doc.text(title, 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(subtitle, 14, 28);
  doc.text(`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`, 14, 33);

  // Table
  autoTable(doc, {
    startY: 38,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? '—'))),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    columnStyles: columns.reduce((acc, c, i) => {
      if (c.width) acc[i] = { cellWidth: c.width };
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Trang ${data.pageNumber} / ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' },
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

/* ── Issue-specific helpers ───────────────────────────────────── */
export const ISSUE_EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Issue Key',        key: 'issueKey',    width: 14 },
  { header: 'Tiêu đề',          key: 'title',       width: 40 },
  { header: 'Dự án',            key: 'projectName', width: 18 },
  { header: 'Loại',             key: 'type',        width: 12 },
  { header: 'Trạng thái',       key: 'status',      width: 16 },
  { header: 'Ưu tiên',          key: 'priority',    width: 12 },
  { header: 'Severity',         key: 'severity',    width: 12 },
  { header: 'Người thực hiện',  key: 'assignee',    width: 22 },
  { header: 'Hạn hoàn thành',   key: 'dueDate',     width: 18 },
  { header: 'Môi trường',       key: 'environment', width: 14 },
  { header: 'Cập nhật',         key: 'updatedAt',   width: 20 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapIssuesToRows(issues: any[]): Row[] {
  return issues.map((i) => ({
    issueKey:    i.issueKey ?? `#${i.id}`,
    title:       i.title,
    projectName: i.projectName ?? i.project?.name ?? '',
    type:        i.type,
    status:      i.status?.replace(/_/g, ' ') ?? '',
    priority:    i.priority,
    severity:    i.severity ?? '',
    assignee:    i.assignee?.fullName ?? 'Chưa giao',
    dueDate:     i.dueDate ? new Date(i.dueDate).toLocaleDateString('vi-VN') : '',
    environment: i.environment ?? '',
    updatedAt:   i.updatedAt ? new Date(i.updatedAt).toLocaleDateString('vi-VN') : '',
  }));
}
