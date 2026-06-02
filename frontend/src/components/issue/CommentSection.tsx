import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Pencil, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { commentsApi } from '../../api/comments';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { formatRelative } from '../../utils/formatters';

interface CommentSectionProps {
  issueId: number;
}

export function CommentSection({ issueId }: CommentSectionProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => commentsApi.getByIssue(issueId),
    enabled: !!issueId,
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(issueId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      queryClient.invalidateQueries({ queryKey: ['activity', issueId] });
      setNewComment('');
      toast.success(t('comment.addedSuccess'));
    },
    onError: () => toast.error(t('comment.addedError')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      commentsApi.update(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      setEditingId(null);
      toast.success(t('comment.updatedSuccess'));
    },
    onError: () => toast.error(t('comment.updatedError')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      queryClient.invalidateQueries({ queryKey: ['activity', issueId] });
      toast.success(t('comment.deletedSuccess'));
    },
    onError: () => toast.error(t('comment.deletedError')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createMutation.mutate(newComment.trim());
  };

  const handleEditSave = (id: number) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ id, content: editContent.trim() });
  };

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-gray-500">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">
        {t('comment.title')} ({comments.length})
      </h3>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar user={user} size="sm" className="flex-shrink-0 mt-1" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('comment.placeholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {newComment.trim() && (
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setNewComment('')}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" size="sm" loading={createMutation.isPending}>
                  <Send className="w-3.5 h-3.5" />
                  {t('comment.submit')}
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar user={comment.author} size="sm" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{comment.author.fullName}</span>
                <span className="text-xs text-gray-400">{formatRelative(comment.createdAt)}</span>
                {comment.createdAt !== comment.updatedAt && (
                  <span className="text-xs text-gray-400">({t('comment.edited')})</span>
                )}
              </div>

              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEditSave(comment.id)} disabled={updateMutation.isPending} className="p-1 text-green-600 hover:text-green-800">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-md px-3 py-2">
                    {comment.content}
                  </p>
                  {user?.id === comment.author.id && (
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(t('comment.deleteConfirm'))) deleteMutation.mutate(comment.id); }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">{t('comment.empty')}</p>
      )}
    </div>
  );
}
