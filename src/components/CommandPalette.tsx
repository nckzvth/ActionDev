import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Flag, LayoutDashboard, Map, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { course } from "../generated/course-data";
import { useAppStore } from "../state/appStore";

const fixedItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Curriculum path", path: "/path", icon: Map },
  { label: "Milestones", path: "/milestones", icon: Flag },
  { label: "Reference library", path: "/reference", icon: BookOpen },
];

export function CommandPalette() {
  const open = useAppStore((state) => state.commandOpen);
  const setOpen = useAppStore((state) => state.setCommandOpen);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return fixedItems;
    return course.lessons
      .filter((lesson) => `${lesson.id} ${lesson.title} ${lesson.moduleTitle}`.toLowerCase().includes(term))
      .slice(0, 9)
      .map((lesson) => ({ label: `${lesson.id} · ${lesson.title}`, path: `/lesson/${lesson.slug}`, icon: BookOpen }));
  }, [query]);

  const go = (path: string) => {
    navigate(path);
    setQuery("");
    setOpen(false);
  };

  return (
    <dialog
      ref={dialog}
      className="command-dialog"
      onCancel={() => setOpen(false)}
      onClose={() => setOpen(false)}
      aria-label="Search ActionDev"
    >
      <div className="command-input-row">
        <Search size={18} />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search lessons, systems, and routes…"
          aria-label="Search lessons and routes"
        />
        <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close search"><X size={18} /></button>
      </div>
      <div className="command-results">
        {results.length ? (
          results.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.path} onClick={() => go(item.path)}>
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })
        ) : (
          <p className="empty-state">No lesson matches “{query}”.</p>
        )}
      </div>
      <p className="command-hint">Press Esc to close · Search all 89 lessons</p>
    </dialog>
  );
}
