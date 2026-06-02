import { useRef, useState, useCallback } from 'react';
import { Paperclip, Upload, Trash2, Download, Image, FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAttachments, useUploadAttachments, useDeleteAttachment } from '../../hooks/useAttachments';
import { formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useConfirm } from '../../context/ConfirmContext';

interface Props {
  issueId: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
  if (contentType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
  return <File className="w-4 h-4 text-gray-400" />;
}

export function AttachmentSection({ issueId }: Props) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const currentUser = useAuthStore((s) => s.user);
  const { data: attachments = [], isLoading } = useAttachments(issueId);
  const upload = useUploadAttachments(issueId);
  const deleteAttachment = useDeleteAttachment(issueId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    upload.mutate(Array.from(files));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: t('attachment.deleteTitle'),
      description: t('attachment.deleteConfirm', { name }),
      variant: 'danger',
    });
    if (!ok) return;
    deleteAttachment.mutate(id);
  };

  const openPreview = (downloadUrl: string, name: string, contentType: string) => {
    if (contentType.startsWith('image/')) {
      setPreviewUrl(downloadUrl);
      setPreviewName(name);
    } else {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">
          {t('attachment.title')} {attachments.length > 0 && <span className="text-gray-400 font-normal">({attachments.length})</span>}
        </h3>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-colors mb-3 ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
        <p className="text-xs text-gray-500">
          {t('attachment.dropzone')} <span className="text-blue-600 font-medium">{t('attachment.browse')}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{t('attachment.maxSize')}</p>
        {upload.isPending && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
            <span className="text-xs text-blue-600 font-medium">{t('attachment.uploading')}</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Attachment list */}
      {isLoading ? (
        <p className="text-xs text-gray-400 text-center py-2">{t('attachment.loading')}</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-1">{t('attachment.empty')}</p>
      ) : (
        <div className="space-y-1.5">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 group">
              {/* Thumbnail for images, icon for others */}
              {att.contentType.startsWith('image/') ? (
                <img
                  src={att.downloadUrl}
                  alt={att.originalName}
                  className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0 cursor-pointer"
                  onClick={() => openPreview(att.downloadUrl, att.originalName, att.contentType)}
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border border-gray-200 flex-shrink-0">
                  <FileIcon contentType={att.contentType} />
                </div>
              )}

              {/* Name & meta */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => openPreview(att.downloadUrl, att.originalName, att.contentType)}
                  className="text-sm text-gray-800 font-medium truncate block hover:text-blue-600 text-left w-full"
                >
                  {att.originalName}
                </button>
                <p className="text-xs text-gray-400">
                  {formatFileSize(att.fileSize)} · {att.uploader.fullName} · {formatDate(att.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={att.downloadUrl}
                  download={att.originalName}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title={t('attachment.download')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                {currentUser?.id === att.uploader.id && (
                  <button
                    onClick={() => handleDelete(att.id, att.originalName)}
                    disabled={deleteAttachment.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title={t('attachment.delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-8 right-0 text-white text-sm hover:text-gray-300"
            >
              {t('attachment.close')}
            </button>
            <p className="text-white text-xs mb-2 truncate">{previewName}</p>
            <img
              src={previewUrl}
              alt={previewName}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
