import api from './axios';
import type { Attachment } from '../types';

export const attachmentApi = {
  list: (issueId: number): Promise<Attachment[]> =>
    api.get(`/api/issues/${issueId}/attachments`).then((r) => r.data),

  upload: (issueId: number, files: File[]): Promise<Attachment[]> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post(`/api/issues/${issueId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  delete: (attachmentId: number): Promise<void> =>
    api.delete(`/api/attachments/${attachmentId}`).then(() => undefined),

  downloadUrl: (attachmentId: number): string =>
    `/api/attachments/${attachmentId}/download`,
};
