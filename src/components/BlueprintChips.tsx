import type { LessonMeta } from '../content/curriculum';
import { EXAM_VERSIONS, lessonDomain } from '../content/curriculum';
import { useExamVersion } from '../store/version';

export function BlueprintChips({ lesson }: { lesson: LessonMeta }) {
  const version = useExamVersion();
  const inV11 = !!lesson.v11?.length;
  const inV20 = lesson.v20 !== undefined;
  const dom = lessonDomain(lesson, version);
  const domTitle = dom ? EXAM_VERSIONS[version].domains.find((d) => d.num === dom)?.title : undefined;
  return (
    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
      {domTitle && (
        <span className="chip" title={`${EXAM_VERSIONS[version].name} domain ${dom}`}>
          {version} · D{dom} {domTitle}
        </span>
      )}
      {inV11 && version === 'v1.1' && (
        <span className="chip" title="CCNA v1.1 exam topics">
          Topics {lesson.v11!.filter((c) => !c.includes('.') || c.split('.').length === 2).slice(0, 3).join(', ')}
        </span>
      )}
      {!inV11 && <span className="chip accent">New in v2.0</span>}
      {!inV20 && <span className="chip warn">v1.1 only</span>}
    </div>
  );
}
