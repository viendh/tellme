import type { IssueType, IssuePriority, IssueSeverity, IssueEnvironment } from '../types';

export interface IssueTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;       // Tailwind border-color class
  accentBg: string;     // Tailwind bg class
  accentText: string;   // Tailwind text class
  fields: {
    type: IssueType;
    priority: IssuePriority;
    severity?: IssueSeverity;
    environment?: IssueEnvironment;
    slaHours?: number;
    originalEstimateHours?: number;
    descriptionTemplate: string;
  };
}

export const ISSUE_TEMPLATES: IssueTemplate[] = [
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Báo cáo lỗi với đầy đủ thông tin tái hiện',
    icon: '🐛',
    accent: 'border-red-300',
    accentBg: 'bg-red-50 dark:bg-red-900/20',
    accentText: 'text-red-700 dark:text-red-400',
    fields: {
      type: 'BUG',
      priority: 'HIGH',
      severity: 'MAJOR',
      descriptionTemplate: `## Mô tả lỗi
Mô tả ngắn gọn về lỗi gặp phải.

## Các bước tái hiện
1. Vào trang...
2. Thực hiện...
3. Quan sát...

## Kết quả mong đợi
Hệ thống nên hoạt động như thế nào.

## Kết quả thực tế
Hệ thống đang hoạt động như thế nào.

## Thông tin môi trường
- OS / Browser:
- Phiên bản:
- URL:

## Screenshot / Log
(Đính kèm ảnh chụp màn hình hoặc log lỗi nếu có)`,
    },
  },
  {
    id: 'prod-incident',
    name: 'Sự cố Production',
    description: 'Lỗi nghiêm trọng ảnh hưởng môi trường PROD',
    icon: '🚨',
    accent: 'border-red-500',
    accentBg: 'bg-red-100 dark:bg-red-900/30',
    accentText: 'text-red-800 dark:text-red-300',
    fields: {
      type: 'BUG',
      priority: 'CRITICAL',
      severity: 'CRITICAL',
      environment: 'PROD',
      slaHours: 4,
      descriptionTemplate: `## Mô tả sự cố
Tóm tắt ngắn gọn sự cố đang xảy ra trên Production.

## Thời điểm phát hiện
- Phát hiện lúc:
- Người báo cáo:

## Phạm vi ảnh hưởng
- Số lượng người dùng bị ảnh hưởng:
- Chức năng bị ảnh hưởng:

## Triệu chứng
Mô tả những gì đang xảy ra...

## Hành động đã thực hiện
- [ ] Thông báo team
- [ ] Kiểm tra logs
- [ ] Rollback (nếu cần)

## Root Cause (cập nhật sau)
Nguyên nhân gốc rễ sẽ được điều tra và cập nhật.`,
    },
  },
  {
    id: 'feature-request',
    name: 'Feature Request',
    description: 'Đề xuất tính năng mới theo chuẩn User Story',
    icon: '📖',
    accent: 'border-blue-300',
    accentBg: 'bg-blue-50 dark:bg-blue-900/20',
    accentText: 'text-blue-700 dark:text-blue-400',
    fields: {
      type: 'STORY',
      priority: 'MEDIUM',
      severity: 'MINOR',
      descriptionTemplate: `## User Story
**Là** [vai trò người dùng],
**Tôi muốn** [tính năng / hành động],
**Để** [mục tiêu / lợi ích].

## Tiêu chí chấp nhận (Acceptance Criteria)
- [ ] AC1: ...
- [ ] AC2: ...
- [ ] AC3: ...

## Mô tả chi tiết
Thông tin bổ sung, wireframe, hoặc ghi chú thiết kế.

## Phụ thuộc
Các task / tính năng cần hoàn thành trước.`,
    },
  },
  {
    id: 'task',
    name: 'Task thông thường',
    description: 'Task triển khai kỹ thuật hoặc công việc thường ngày',
    icon: '✅',
    accent: 'border-gray-300',
    accentBg: 'bg-gray-50 dark:bg-gray-800',
    accentText: 'text-gray-700 dark:text-gray-300',
    fields: {
      type: 'TASK',
      priority: 'MEDIUM',
      severity: 'MINOR',
      descriptionTemplate: `## Mục tiêu
Mô tả mục tiêu của task này.

## Các việc cần làm
- [ ] Bước 1:
- [ ] Bước 2:
- [ ] Bước 3:

## Định nghĩa hoàn thành (Definition of Done)
- [ ] Code đã được review
- [ ] Test đã pass
- [ ] Documentation đã cập nhật`,
    },
  },
  {
    id: 'epic',
    name: 'Epic',
    description: 'Nhóm tính năng lớn với mục tiêu và phạm vi rõ ràng',
    icon: '⚡',
    accent: 'border-purple-300',
    accentBg: 'bg-purple-50 dark:bg-purple-900/20',
    accentText: 'text-purple-700 dark:text-purple-400',
    fields: {
      type: 'EPIC',
      priority: 'HIGH',
      severity: 'MINOR',
      descriptionTemplate: `## Mục tiêu Epic
Mô tả mục tiêu kinh doanh / kỹ thuật của Epic này.

## Phạm vi
**Bao gồm:**
- Tính năng / module A
- Tính năng / module B

**Không bao gồm:**
- ...

## User Stories liên quan
- [ ] Story 1:
- [ ] Story 2:
- [ ] Story 3:

## Tiêu chí thành công
- KPI / Metric đo lường:
- Deadline dự kiến:

## Rủi ro
- Rủi ro 1:
- Phương án xử lý:`,
    },
  },
  {
    id: 'uat-bug',
    name: 'UAT Bug',
    description: 'Lỗi phát hiện trong quá trình kiểm thử UAT',
    icon: '🔍',
    accent: 'border-amber-300',
    accentBg: 'bg-amber-50 dark:bg-amber-900/20',
    accentText: 'text-amber-700 dark:text-amber-400',
    fields: {
      type: 'BUG',
      priority: 'HIGH',
      severity: 'MAJOR',
      environment: 'UAT',
      descriptionTemplate: `## Mô tả lỗi UAT
Mô tả lỗi phát hiện trong quá trình kiểm thử.

## Test Case liên quan
Test case ID / tên:

## Các bước tái hiện
1.
2.
3.

## Kết quả mong đợi (theo spec)
...

## Kết quả thực tế
...

## Mức độ ảnh hưởng
- Chặn luồng nghiệp vụ: Có / Không
- Workaround: Có / Không — Mô tả:

## Screenshot
(Đính kèm)`,
    },
  },
];
