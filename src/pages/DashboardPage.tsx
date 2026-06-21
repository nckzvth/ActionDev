import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flag, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { LessonCard } from "../components/LessonCard";
import { ProgressRing } from "../components/ProgressRing";
import { course, getResumeLesson } from "../content/course";
import { milestones } from "../content/milestones";
import { useProgress } from "../progress/ProgressContext";
import { useAppStore } from "../state/appStore";

export function DashboardPage() {
  const { user } = useAuth();
  const { progress, completedCount } = useProgress();
  const setAuthOpen = useAppStore((state) => state.setAuthOpen);
  const resume = getResumeLesson(progress);
  const overall = (completedCount / course.lessons.length) * 100;
  const stage = course.stages.find((item) => item.id === resume.stageId)!;
  const stageLessons = course.lessons.filter((lesson) => lesson.stageId === stage.id);
  const stageCompleted = stageLessons.filter((lesson) => progress[lesson.id]?.status === "completed").length;
  const stagePercent = (stageCompleted / stageLessons.length) * 100;

  return (
    <div className="route-page dashboard-page">
      <section className="route-hero dashboard-hero">
        <div className="content">
          <div className="dashboard-greeting">
            <div><p className="eyebrow">{user ? "Your learning workspace" : "Local preview workspace"}</p><h1>{user ? "Keep the architecture moving." : "Start with the permanent foundation."}</h1><p>{user ? `Signed in as ${user.email}. Your authenticated progress is designed to follow you across devices.` : "Sign in when you want this progress to become cross-device state. Local preview progress stays on this browser."}</p></div>
            {!user && <button className="button button-secondary" onClick={() => setAuthOpen(true)}>Sign in to sync</button>}
          </div>
          <div className="resume-panel">
            <div className="resume-main"><span className="resume-index">{resume.id}</span><p>Continue your current path</p><h2>{resume.title}</h2><div className="resume-meta"><span><BookOpen size={15} />{resume.moduleTitle}</span><span><Clock3 size={15} />{resume.effort}</span></div><Link className="button button-primary" to={`/lesson/${resume.slug}`}>Resume lesson <ArrowRight size={16} /></Link></div>
            <div className="resume-progress"><ProgressRing value={stagePercent} label={`Stage ${stage.number}`} size="large" /><div><strong>{stageCompleted} of {stageLessons.length}</strong><span>lessons complete in this stage</span></div></div>
          </div>
        </div>
      </section>

      <section className="page-band dashboard-stats-band"><div className="content dashboard-stats">
        <div className="stat"><Target size={20} /><span>Overall path</span><strong>{Math.round(overall)}%</strong><small>{completedCount} / {course.lessons.length} lessons</small></div>
        <div className="stat"><Flag size={20} /><span>Next project gate</span><strong>{milestones.find((gate) => gate.stage >= stage.number)?.label ?? "Complete"}</strong><small>{milestones.find((gate) => gate.stage >= stage.number)?.title}</small></div>
        <div className="stat"><CheckCircle2 size={20} /><span>Evidence completed</span><strong>0</strong><small>Milestone evidence is learner-verified</small></div>
      </div></section>

      <section className="page-band"><div className="content content-narrow-wide">
        <div className="section-heading"><div><p className="eyebrow">Up next</p><h2>{resume.moduleTitle}</h2></div><Link to="/path">Open full path <ArrowRight size={16} /></Link></div>
        <div className="lesson-list">{course.lessons.slice(Math.max(0, course.lessons.findIndex((lesson) => lesson.id === resume.id)), Math.max(0, course.lessons.findIndex((lesson) => lesson.id === resume.id)) + 4).map((lesson) => <LessonCard key={lesson.id} lesson={lesson} progress={progress[lesson.id]} compact />)}</div>
      </div></section>
    </div>
  );
}
