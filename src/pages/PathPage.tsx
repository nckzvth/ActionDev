import { Check, ChevronDown, Circle, Filter, Flag, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LessonCard } from "../components/LessonCard";
import { course, getLessonsForModule } from "../content/course";
import { milestones } from "../content/milestones";
import { useProgress } from "../progress/ProgressContext";

export function PathPage() {
  const { progress } = useProgress();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStage = searchParams.get("stage");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const selectedStage = requestedStage === null ? "all" : requestedStage;

  const stages = useMemo(
    () => selectedStage === "all" ? course.stages : course.stages.filter((stage) => String(stage.number) === selectedStage),
    [selectedStage],
  );

  const isLocked = (lessonId: string) => {
    const index = course.lessons.findIndex((lesson) => lesson.id === lessonId);
    return index > 0 && progress[course.lessons[index - 1].id]?.status !== "completed";
  };

  return (
    <div className="route-page path-page">
      <section className="route-hero compact-route-hero"><div className="content"><p className="eyebrow">The complete dependency path</p><h1>From first compile to Early Access.</h1><p>Every stage produces permanent project artifacts. Optional depth is never used to conceal required teaching.</p><div className="path-summary"><span><strong>{course.lessons.length}</strong> lessons</span><span><strong>{course.modules.length}</strong> modules</span><span><strong>{milestones.length}</strong> gates</span></div></div></section>
      <div className="path-toolbar"><div className="content"><div className="filter-label"><Filter size={16} />Filter stage</div><div className="filter-pills"><button className={selectedStage === "all" ? "active" : undefined} onClick={() => setSearchParams({})}>All stages</button>{course.stages.map((stage) => <button className={selectedStage === String(stage.number) ? "active" : undefined} key={stage.id} onClick={() => setSearchParams({ stage: String(stage.number) })}>0{stage.number}</button>)}</div></div></div>
      <section className="page-band"><div className="content path-layout">
        <aside className="path-legend" aria-label="Curriculum legend"><h2>Path legend</h2><span><Circle size={13} />Available</span><span><Check size={13} />Completed</span><span><Flag size={13} />Project gate</span><p>Complete lessons in order. Each locked item names its prerequisite in the lesson contract.</p></aside>
        <div className="path-stages">
          {stages.map((stage) => {
            const stageModules = course.modules.filter((module) => module.stageId === stage.id);
            const gate = milestones.find((item) => item.stage === stage.number);
            return (
              <section className="path-stage" key={stage.id}>
                <header><span className="stage-number">0{stage.number}</span><div><p>Stage {stage.number}</p><h2>{stage.title}</h2></div></header>
                {stageModules.map((module) => {
                  const lessons = getLessonsForModule(module.id);
                  const complete = lessons.filter((lesson) => progress[lesson.id]?.status === "completed").length;
                  const isOpen = expanded[module.id] ?? stage.number === 0;
                  return (
                    <div className="path-module" key={module.id}>
                      <button className="module-toggle" onClick={() => setExpanded((current) => ({ ...current, [module.id]: !isOpen }))} aria-expanded={isOpen}>
                        <Layers3 size={18} /><span><small>{module.id} · {complete}/{lessons.length} complete</small><strong>{module.title}</strong></span><ChevronDown size={18} className={isOpen ? "rotate" : undefined} />
                      </button>
                      {isOpen && <div className="lesson-list module-lessons">{lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} progress={progress[lesson.id]} locked={isLocked(lesson.id)} compact />)}</div>}
                    </div>
                  );
                })}
                {gate && <div className={`inline-gate ${gate.accent}`}><Flag size={18} /><div><small>{gate.id} · {gate.label}</small><strong>{gate.title}</strong><p>{gate.summary}</p></div></div>}
              </section>
            );
          })}
        </div>
      </div></section>
    </div>
  );
}

