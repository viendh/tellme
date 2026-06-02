import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { commentsApi } from '../../api/comments';
import { Avatar } from '../common/Avatar';
import { formatRelative } from '../../utils/formatters';

interface ActivityFeedProps {
  issueId: number;
}

export function ActivityFeed({ issueId }: ActivityFeedProps) {
  const { t } = useTranslation();
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity', issueId],
    queryFn: () => commentsApi.getActivity(issueId),
    enabled: !!issueId,
  });

  if (isLoading) {
    return <div className="py-4 text-center text-sm text-gray-500">{t('common.loading')}</div>;
  }

  if (activities.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">{t('activity.empty')}</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{t('activity.title')}</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <Avatar user={activity.user} size="xs" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{activity.user.fullName}</span>{' '}
                <span className="text-gray-500">{activity.action}</span>
                {activity.fieldName && (
                  <span className="text-gray-500"> {activity.fieldName}</span>
                )}
                {activity.oldValue && activity.newValue && (
                  <span className="text-gray-500">
                    {' '}{t('activity.from')}{' '}
                    <span className="font-medium text-gray-700">{activity.oldValue}</span>
                    {' '}{t('activity.to')}{' '}
                    <span className="font-medium text-gray-700">{activity.newValue}</span>
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatRelative(activity.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
