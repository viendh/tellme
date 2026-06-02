import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachmentApi } from '../api/attachments';
import toast from 'react-hot-toast';

export function useAttachments(issueId: number) {
  return useQuery({
    queryKey: ['attachments', issueId],
    queryFn: () => attachmentApi.list(issueId),
    enabled: issueId > 0,
  });
}

export function useUploadAttachments(issueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => attachmentApi.upload(issueId, files),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['attachments', issueId] });
      toast.success(`Đã tải lên ${data.length} file`);
    },
    onError: () => toast.error('Tải file thất bại'),
  });
}

export function useDeleteAttachment(issueId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) => attachmentApi.delete(attachmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', issueId] });
      toast.success('Đã xóa file');
    },
    onError: () => toast.error('Xóa file thất bại'),
  });
}
