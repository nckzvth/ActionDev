import { BookOpen, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { glossary, references } from "../content/references";

export function ReferencePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => references.filter((item) => `${item.title} ${item.category} ${item.summary} ${item.lines.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <div className="route-page reference-page">
      <section className="route-hero compact-route-hero"><div className="content"><p className="eyebrow">Stable project contracts</p><h1>The rules you should not have to rediscover.</h1><p>Use these references while lessons explain where each contract comes from and when to apply it.</p><label className="reference-search"><Search size={18} /><span className="sr-only">Search reference library</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search combat, networking, data, release…" /></label></div></section>
      <section className="page-band"><div className="content reference-layout"><div className="reference-index"><p className="eyebrow">Contracts and checklists</p>{filtered.map((item) => <article className="reference-row" key={item.id}><div><small>{item.category}</small><h2>{item.title}</h2><p>{item.summary}</p></div><ol>{item.lines.map((line) => <li key={line}><ChevronRight size={14} />{line}</li>)}</ol></article>)}{!filtered.length && <p className="empty-state">No reference matches “{query}”.</p>}</div><aside className="glossary"><h2><BookOpen size={18} />Working glossary</h2>{glossary.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</aside></div></section>
    </div>
  );
}
