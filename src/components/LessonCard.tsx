import { ArrowRight, Check, Clock3, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import type { CourseLesson, LessonProgress } from "../content/types";

interface LessonCardProps {
  lesson: CourseLesson;
  progress?: LessonProgress;
  locked?: boolean;
  compact?: boolean;
}

export function LessonCard({ lesson, progress, locked = false, compact = false }: LessonCardProps) {
  const complete = progress?.status === "completed";
  return (
    <article className={`lesson-row ${compact ? "compact" : ""} ${complete ? "complete" : ""}`}>
      <div className="lesson-state" aria-label={complete ? "Completed" : locked ? "Locked" : "Available"}>
        {complete ? <Check size={16} /> : locked ? <LockKeyhole size={15} /> : <span />}
      </div>
      <div className="lesson-row-main">
        <div className="lesson-row-meta">
          <span>{lesson.id}</span>
          <span><Clock3 size={13} />{lesson.effort}</span>
        </div>
        <h3>{lesson.title}</h3>
        {!compact && <p>{lesson.instruction}</p>}
      </div>
      {locked ? (
        <span className="locked-label">Prerequisite</span>
      ) : (
        <Link to={`/lesson/${lesson.slug}`} className="row-link" aria-label={`Open ${lesson.title}`}>
          <ArrowRight size={18} />
        </Link>
      )}
    </article>
  );
}

