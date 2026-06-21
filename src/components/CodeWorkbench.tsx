import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { useMemo, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import type { CourseLesson } from "../content/types";

const examples: Record<string, string> = {
  "AD-FD": `struct AbilityId {\n  std::uint32_t value{};\n  friend bool operator==(AbilityId, AbilityId) = default;\n};\n\n[[nodiscard]] Result activate(AbilityId id, ActorState& actor);`,
  "AD-CB": `HitResult resolve_hit(const Attack& attack, Target& target) {\n  if (target.is_dodging()) return HitResult::avoided();\n  if (target.can_block(attack)) return resolve_block(attack, target);\n  auto damage = apply_modifiers(attack.damage, target);\n  damage = target.shields.absorb(damage);\n  return target.health.apply(damage);\n}`,
  "AD-NW": `struct InputCommand {\n  ClientSequence sequence;\n  SimTick client_tick;\n  Vec2 movement_intent;\n  AbilityId requested_ability;\n};\n\nValidationResult validate(const InputCommand&, const ServerState&);`,
  "AD-RP": `struct AbilityDef {\n  AbilityId id;\n  TagSet tags;\n  TargetingSpec targeting;\n  CastTimeline timeline;\n  CostSpec costs;\n  EffectList effects;\n};`,
};

export function CodeWorkbench({ lesson }: { lesson: CourseLesson }) {
  const initial = useMemo(() => examples[lesson.moduleId] ?? `// ${lesson.id}: ${lesson.title}\n// Model a narrow, testable contract for this ARPG system.\n\nstruct SystemContract {\n  // Add explicit state and invariants here.\n};`, [lesson]);
  const [code, setCode] = useState(initial);

  return (
    <div className="code-workbench">
      <div className="workbench-bar">
        <span>Worked C++ contract</span>
        <div>
          <button className="icon-button" onClick={() => void navigator.clipboard.writeText(code)} aria-label="Copy code"><Copy size={15} /></button>
          <button className="icon-button" onClick={() => setCode(initial)} aria-label="Reset code"><RotateCcw size={15} /></button>
        </div>
      </div>
      <CodeMirror value={code} height="260px" extensions={[cpp()]} onChange={setCode} theme="dark" basicSetup={{ foldGutter: false, highlightActiveLine: false }} />
      <p className="workbench-note">This browser workspace supports reading and editing. Compile and run the durable implementation in your own C++ repository.</p>
    </div>
  );
}
