import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useIssue } from '../hooks/useIssues';
import { IssueDetail } from '../components/issue/IssueDetail';

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const id = Number(issueId);
  const { data: issue, isLoading } = useIssue(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <p className="text-gray-500 text-lg">Issue not found</p>
        <Link
          to="/projects"
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200 text-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-gray-300">/</span>
        <Link
          to={`/projects/${issue.projectId}/board`}
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          Board
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Issue #{id}</span>
      </div>

      {/* Detail panel taking full height */}
      <div className="flex-1 overflow-hidden max-w-3xl mx-auto w-full">
        <IssueDetail issueId={id} onClose={() => navigate(-1)} />
      </div>
    </div>
  );
}
