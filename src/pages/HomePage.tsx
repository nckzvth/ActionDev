import { ArrowRight, Braces, Check, Network, ShieldCheck, Swords } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandMark } from "../components/BrandMark";
import { course } from "../content/course";
import { milestones } from "../content/milestones";
import { useAppStore } from "../state/appStore";

export function HomePage() {
  const { user } = useAuth();
  const setAuthOpen = useAppStore((state) => state.setAuthOpen);

  return (
    <>
      <section className="hero-band">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="content hero-content">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" />A complete custom C++ learning path</p>
            <h1>Learn the systems.<br /><span>Build the ARPG.</span></h1>
            <p className="hero-lede">
              Go from zero experience to a stable, extensible eight-player online co-op foundation—without handing the learning to an engine, a playlist, or an AI that builds the game for you.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link className="button button-primary button-large" to="/dashboard">Resume learning <ArrowRight size={17} /></Link>
              ) : (
                <button className="button button-primary button-large" onClick={() => setAuthOpen(true)}>Start the path <ArrowRight size={17} /></button>
              )}
              <Link className="button button-secondary button-large" to="/path">Explore all {course.lessons.length} lessons</Link>
            </div>
            <div className="hero-proof">
              <span><Check size={15} />Required teaching stays in-app</span>
              <span><Check size={15} />Your repository remains yours</span>
              <span><Check size={15} />Progress syncs across devices</span>
            </div>
          </div>
          <div className="architecture-visual" aria-label="ActionDev runtime architecture overview">
            <div className="visual-header"><BrandMark /><span>Durable runtime</span><small>30 Hz authority</small></div>
            <div className="visual-core">
              <div className="core-node"><Network size={22} /><span>Dedicated server</span><small>Simulation truth</small></div>
              <div className="satellite satellite-a"><Braces size={18} /><span>Shared rules</span></div>
              <div className="satellite satellite-b"><Swords size={18} /><span>Combat</span></div>
              <div className="satellite satellite-c"><ShieldCheck size={18} /><span>Persistence</span></div>
            </div>
            <div className="signal-lines" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="visual-footer"><span>Client prediction</span><span>Server validation</span><span>Remote interpolation</span></div>
          </div>
        </div>
        <div className="scroll-cue">The path begins below <span>↓</span></div>
      </section>

      <section className="page-band band-intro">
        <div className="content two-column-intro">
          <div>
            <p className="eyebrow">One deliberate path</p>
            <h2>Education inside.<br />Implementation outside.</h2>
          </div>
          <div className="intro-copy">
            <p>Every required lesson teaches the concept, shows the system, challenges your reasoning, and prepares an exact project handoff.</p>
            <p>You leave ActionDev only when it is time to build and test the genuine artifact in your own C++ repository.</p>
          </div>
        </div>
      </section>

      <section className="page-band stages-band">
        <div className="content">
          <div className="section-heading"><div><p className="eyebrow">Curriculum architecture</p><h2>Eight stages. Six permanent gates.</h2></div><Link to="/path">View dependency map <ArrowRight size={16} /></Link></div>
          <div className="stage-grid">
            {course.stages.map((stage) => {
              const count = course.lessons.filter((lesson) => lesson.stageId === stage.id).length;
              return <Link to={`/path?stage=${stage.number}`} className="stage-tile" key={stage.id}><span>0{stage.number}</span><div><h3>{stage.title}</h3><p>{count} required lessons</p></div><ArrowRight size={17} /></Link>;
            })}
          </div>
        </div>
      </section>

      <section className="page-band gates-band">
        <div className="content">
          <div className="section-heading"><div><p className="eyebrow">Evidence, not checkboxes</p><h2>Build gates that prove the foundation.</h2></div></div>
          <div className="gate-timeline">
            {milestones.map((gate, index) => (
              <div className="gate-point" key={gate.id}><span className={`gate-dot ${gate.accent}`}>{index + 1}</span><div><small>{gate.label}</small><strong>{gate.title}</strong></div></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

