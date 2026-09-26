import { useParams } from 'react-router';
export function LabWorkspace() {
  const { labId } = useParams();
  return (
    <div className="page">
      <div className="empty">The lab workspace for “{labId}” is being built.</div>
    </div>
  );
}
