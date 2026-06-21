import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, Clock3, Flag, ListChecks, Play, Wrench } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { KnowledgeCheck } from "../components/KnowledgeCheck";
import { SystemFlow } from "../components/SystemFlow";
import { getAdjacentLessons, getLesson, splitInstruction } from "../content/course";
import { useProgress } from "../progress/ProgressContext";
import { NotFoundPage } from "./NotFoundPage";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";

const CodeWorkbench = lazy(() => import("../components/CodeWorkbench").then((module) => ({ default: module.CodeWorkbench })));

export function LessonPage() {
  const { lessonSlug = "" } = useParams();
  const lesson = getLesson(lessonSlug);
  const { progress, markStarted, markCompleted } = useProgress();
  const { user } = useAuth();
  const [passedLessonId, setPassedLessonId] = useState<string>();
  const [bookmarkedLessonId, setBookmarkedLessonId] = useState<string>();
  const [lessonDatabaseId, setLessonDatabaseId] = useState<string>();
  const [busy, setBusy] = useState(false);

  const concepts = useMemo(() => (lesson ? splitInstruction(lesson.instruction) : []), [lesson]);
  useEffect(() => {
    let active = true;
    const client = supabase;
    if (!lesson || !user || !client) return () => { active = false; };
    void client.from("lessons").select("id").eq("slug", lesson.slug).single().then(async ({ data }) => {
      if (!active || !data) return;
      setLessonDatabaseId(String(data.id));
      const { data: bookmark } = await client.from("bookmarks").select("content_id").eq("user_id", user.id).eq("content_type", "lesson").eq("content_id", data.id).maybeSingle();
      if (active && bookmark) setBookmarkedLessonId(lesson.id);
    });
    return () => { active = false; };
  }, [lesson, user]);

  if (!lesson) return <NotFoundPage />;
  const checkPassed = passedLessonId === lesson.id;
  const bookmarked = bookmarkedLessonId === lesson.id;
  const adjacent = getAdjacentLessons(lesson);
  const current = progress[lesson.id];
  const complete = current?.status === "completed";

  const completeLesson = async () => {
    setBusy(true);
    await markCompleted(lesson.id);
    setBusy(false);
  };

  const toggleBookmark = async () => {
    if (!user || !supabase || !lessonDatabaseId) {
      setBookmarkedLessonId(bookmarked ? undefined : lesson.id);
      return;
    }
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("content_type", "lesson").eq("content_id", lessonDatabaseId);
      setBookmarkedLessonId(undefined);
    } else {
      await supabase.from("bookmarks").upsert({ user_id: user.id, content_type: "lesson", content_id: lessonDatabaseId, anchor: "" });
      setBookmarkedLessonId(lesson.id);
    }
  };

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <div className="content lesson-header-inner">
          <Link to="/path" className="back-link"><ArrowLeft size={15} />Curriculum path</Link>
          <div className="lesson-labels"><span>{lesson.stageTitle}</span><span>{lesson.moduleId}</span><span>{lesson.id}</span></div>
          <h1>{lesson.title}</h1>
          <p>{lesson.instruction}</p>
          <div className="lesson-metadata"><span><Clock3 size={15} />{lesson.effort}</span><span><Flag size={15} />{lesson.milestone}</span><span><ListChecks size={15} />Required lesson</span></div>
          <div className="lesson-header-actions">
            {!current && <button className="button button-secondary" onClick={() => void markStarted(lesson.id, 10)}><Play size={15} />Begin lesson</button>}
            <button className="icon-text-button" aria-pressed={bookmarked} onClick={() => void toggleBookmark()}><Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />{bookmarked ? "Bookmarked" : "Bookmark"}</button>
          </div>
        </div>
        <div className="lesson-progress-line"><span style={{ width: `${current?.percent ?? 0}%` }} /></div>
      </header>

      <div className="content lesson-layout">
        <aside className="lesson-toc" aria-label="On this page"><p>On this page</p><a href="#why">Why it matters</a><a href="#concepts">Concept instruction</a><a href="#visual">System model</a><a href="#worked">Worked example</a><a href="#check">Knowledge check</a><a href="#build">Build it</a><div className="toc-status"><span className={complete ? "complete" : undefined}>{complete ? <Check size={14} /> : null}{complete ? "Completed" : current ? "In progress" : "Not started"}</span></div></aside>

        <article className="lesson-article">
          <section id="why" className="lesson-section lead-section"><p className="section-kicker">Why this matters</p><h2>This becomes part of the permanent ARPG foundation.</h2><p>{lesson.title} is taught here because later systems depend on an explicit, testable contract—not an implementation detail that emerges by accident.</p><div className="objective-panel"><h3>After this lesson, you will be able to</h3><ul>{concepts.slice(0, 4).map((concept) => <li key={concept}><Check size={15} />{concept}</li>)}</ul></div></section>

          <section id="concepts" className="lesson-section"><p className="section-kicker">Concept instruction</p><h2>Build the mental model before the subsystem.</h2>{concepts.map((concept, index) => <div className="concept-block" key={concept}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{concept.split(":")[0]}</h3><p>{concept.includes(":") ? concept.slice(concept.indexOf(":") + 1).trim() : `Treat ${concept.toLowerCase()} as a named contract with explicit inputs, state, outputs, failure reasons, and tests.`}</p></div></div>)}<div className="warning-callout"><strong>Common failure</strong><p>Do not hide this rule inside presentation code, a one-off class, or an external tutorial. Keep it visible in shared data, tests, and debugging tools where the lesson contract requires it.</p></div></section>

          <section id="visual" className="lesson-section"><p className="section-kicker">Required system model</p><h2>{lesson.visual}</h2><SystemFlow description={lesson.visual} /></section>

          <section id="worked" className="lesson-section"><p className="section-kicker">Worked example</p><h2>Express the rule as a narrow C++ contract.</h2><p>The example is intentionally small. Read the ownership and invariants first; then edit it to test your understanding. It is not a replacement for your project implementation.</p><Suspense fallback={<div className="workbench-loading">Loading the code workspace…</div>}><CodeWorkbench lesson={lesson} /></Suspense></section>

          <div id="check"><KnowledgeCheck key={lesson.id} lesson={lesson} onPassed={() => setPassedLessonId(lesson.id)} /><Link className="focused-workspace-link" to={`/exercise/${lesson.slug}`}>Open the focused practice workspace <ArrowRight size={15} /></Link></div>

          <section id="build" className="lesson-section build-handoff"><div className="build-icon"><Wrench size={22} /></div><p className="section-kicker">Build It in Your Project</p><h2>Leave ActionDev only for the genuine implementation.</h2><p className="build-task">{lesson.projectTask || "This lesson completes in-app; consolidate the model before continuing."}</p><div className="acceptance-grid"><div><h3>Validation</h3><p>{lesson.tests || lesson.assessment}</p></div><div><h3>Completion rule</h3><p>{lesson.completion}</p></div></div><div className="project-boundary"><strong>Project boundary</strong><span>ActionDev records your self-verification. It does not inspect, compile, or claim to certify your repository.</span></div></section>

          <section className="lesson-section optional-resource"><p className="section-kicker">Optional enrichment</p><h2>{lesson.optionalResource}</h2><p>This free resource can deepen the implementation perspective after the complete in-app lesson. It is not required to understand or complete this lesson.</p><Link to="/reference">Open the curated reference library <ArrowRight size={15} /></Link></section>

          <section className={`completion-panel ${complete ? "complete" : ""}`}><div>{complete ? <Check size={22} /> : <Flag size={22} />}<span><small>{complete ? "Lesson complete" : "Completion gate"}</small><strong>{complete ? `${lesson.id} is recorded.` : "Finish the required check before completing."}</strong></span></div>{!complete && <button className="button button-primary" disabled={!checkPassed || busy} onClick={() => void completeLesson()}>{busy ? "Saving…" : "Complete lesson"}</button>}</section>
        </article>
      </div>

      <nav className="lesson-pagination" aria-label="Lesson pagination"><div className="content">{adjacent.previous ? <Link to={`/lesson/${adjacent.previous.slug}`}><ArrowLeft size={17} /><span><small>Previous</small>{adjacent.previous.title}</span></Link> : <span />}{adjacent.next ? <Link to={`/lesson/${adjacent.next.slug}`}><span><small>Next</small>{adjacent.next.title}</span><ArrowRight size={17} /></Link> : <Link to="/milestones"><span><small>Path complete</small>Review milestones</span><Flag size={17} /></Link>}</div></nav>
    </div>
  );
}
