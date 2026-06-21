# ActionDev Implementation Plan

Document status: implementation blueprint, not application code  
Target delivery: static React application on GitHub Pages with Supabase Free Tier  
Source baseline: the five PDFs supplied with the request, reviewed in full on 2026-06-21  
Audience: product, curriculum, content, frontend, database, security, QA, and release implementers

## Document conventions

- `AD-*` identifiers are stable ActionDev content or milestone identifiers. Actual database primary keys are authored UUIDs; human-readable slugs are routing and authoring aids only.
- **Required** means a learner cannot complete the associated gate without it. **Optional** means enrichment and never substitutes for in-app teaching.
- **Project handoff** means the learner leaves ActionDev only to implement or verify work in their own C++ ARPG repository.
- Source precedence is: explicit implementation-plan request; Authoritative Guide; Final Addendum; Roadmap and Syllabus; earlier Roadmap; Front-End Design and UX Specification for UI only.
- Effort is focused study plus exercise time. Project-handoff estimates are separate where useful because learner projects vary.

## 1. Executive Summary

ActionDev is a self-guided e-learning application that takes a learner from no prior C++ game-development experience to a stable, extensible, Steam Early Access-ready foundation for a custom C++ eight-player online co-op ARPG. It is not a generic learning-management system, a link directory, a code generator, or a substitute for the learner’s game repository.

Its core contract is:

1. ActionDev completely teaches required concepts in the application through explanations, ARPG-specific examples, diagrams, guided reasoning, coding and architecture exercises, feedback, and assessments.
2. The learner leaves the application only at an explicit **Build It in Your Project** handoff, after being taught and challenged in-app.
3. The learner implements and tests the actual game. ActionDev records evidence and reflection but does not claim to inspect or build the repository.
4. External resources are optional enrichment, free to access, clearly labeled, and never prerequisites.
5. Durable progress is owned by the authenticated learner in Supabase, protected by Row Level Security, and resumable across devices.

### Selected application architecture

Use React + TypeScript + Vite, React Router `HashRouter`, Tailwind CSS with a small project-owned token/component layer, TanStack Query for Supabase server state, Zustand only for ephemeral UI state, Zod for content/runtime validation, MDX for trusted instructional content, and JSON generated manifests for indexing and dependency traversal. Use CodeMirror 6 for initial code inputs; lazy-load editors, Mermaid rendering, and simulators. Use Vitest, React Testing Library, axe-core, Playwright, and Storybook or a lightweight route fixture gallery for component verification.

This stack fits the constraints because Vite emits static files; hash routing does not require a GitHub Pages rewrite server; static MDX keeps hundreds of lessons version-controlled and reviewable; and Supabase Auth/Postgres/RLS provide browser-safe authenticated persistence without a custom application server. GitHub Pages deployment uses a GitHub Actions build artifact. The Vite `base` is `/<repository>/` for a project site and `/` for a user/custom-domain site. Official references: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter), and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### Selected course architecture

The broad A-L syllabus from the source material becomes 89 implementable ActionDev lessons across eight stages. This is a decomposition, not a rewrite: every broad source lesson, addendum gap, combat law, system dependency, tool, test, and milestone is traceable to one or more lesson IDs in Section 6. The permanent project gates remain:

- `AD-GATE-00`: reproducible toolchain and repository.
- `AD-GATE-01`: disposable local feel probes and written combat contract.
- `AD-GATE-02`: local authoritative vertical slice.
- `AD-GATE-03`: two-player online proof.
- `AD-GATE-04`: eight-player stress slice.
- `AD-GATE-05`: Steam Early Access readiness.

Disposable local prototypes are permitted for movement and combat feel. Durable code begins with client/server/shared boundaries and a fixed-step simulation contract. The current baseline is a 30 Hz authoritative server tick, 20 Hz snapshots for the owning player and nearby engaged actors, 5-10 Hz or event-driven state for distant actors, client prediction for local movement/presentation, server reconciliation, remote interpolation, and per-client interest management. These are profiled starting values, not immutable shipping constants.

### Delivery boundary

This plan specifies the product, content model, curriculum, interfaces, data model, security controls, deployment, tests, rollout, and acceptance criteria. It intentionally does not build the application, write the full lesson prose, or implement the learner’s game.

## 2. Source Material Inventory

### 2.1 Attached sources and contribution

| Source | Authority and contribution | Representation in ActionDev |
|---|---|---|
| **ActionDev Front-End Design and UX Specification** (10 pages) | UI-only authority: premium restrained identity, near-black tokens, typography, continuous page bands, shared shell, route templates, command palette, lesson/workspace/milestone/reference patterns, density controls, motion, accessibility, performance, responsive behavior. It explicitly cannot invent curriculum. | Sections 5, 7, and 9; shared design tokens and route primitives; UX acceptance tests. Its local-persistence-first note is superseded by the request’s Supabase requirement, while its storage abstraction requirement is retained. |
| **Authoritative Guide for a Custom C++ Eight-Player Online Co-op ARPG** (27 pages) | Corrective technical authority: narrow C++ runtime; middleware and ownership boundary; dedicated-server model; corrected 30/20 Hz baseline; canonical combat rules; A-to-production lesson path; scaling, tooling, tests, milestones, risks, schemas, Early Access gate. | Sections 3 and 6; all core runtime, combat, networking, testing, and release lessons; milestone acceptance criteria; reference contracts. |
| **Final Addendum for the Custom C++ Eight Player Online Co-op ARPG Curriculum** (24 pages) | Adds missing production connective tissue: authority maps, tag grammar, animation-combat contract, target invalidation, sub-weapon semantics, status stacking, relevance/prioritization, persistence migrations, asset automation, observability, security, input parity, expanded lesson scaffolding, hybrid Diablo II progression. | Dedicated lessons `AD-AN-*`, `AD-CB-*`, `AD-RP-*`, `AD-NW-*`, `AD-QA-*`; assessment scenarios; schema and QA requirements. |
| **Roadmap and Syllabus for a Custom C++ Eight-Player Online Co-op ARPG** (17 pages) | Canonical broad teaching gates A-L with objectives, prerequisites, estimates, deliverables, tools, tests, success criteria, resource starting points, stable-foundation and eight-player gates. | Section 6 decomposes each A-L block into smaller lessons without changing order or exit criteria. Broad-source mapping is shown in every module heading. |
| **Roadmap for a Custom C++ Eight Player Online Co-op ARPG** (27 pages) | Earlier detailed roadmap: assumptions, own/borrow boundary, message classes, combat state/timing examples, anti-cheat rules, stage gates, party/scaling/readability heuristics, tooling matrix, test strategy, operations, prioritized study blocks. | Retained wherever compatible. Conflicting numerical or sequencing guidance is resolved in favor of the Authoritative Guide and explicit request. |

### 2.2 Source precedence and overlap policy

The documents deliberately overlap. ActionDev must not create five versions of the same lesson. The content build maintains one canonical lesson per concept and a source trace list in its frontmatter. Overlap is handled as follows:

- The Authoritative Guide’s 20 Hz nearby-combat snapshots supersede the older 10-15 Hz starting range. The latter survives as a historical tuning example and a low-relevance exercise, not the default.
- The durable architecture is authoritative client/server early. Addendum language that places online conversion after a strong local combat law means transport integration is staged later, not that durable gameplay becomes a client-only codebase.
- The stable foundation requires one complete class, one main weapon family, one sub-weapon family, three enemy archetypes, and one boss. Exact Early Access counts remain a product decision; this plan recommends two contrasting classes and at least two main-weapon families before charging, but does not present that recommendation as a source mandate.
- The older UX document’s local persistence is reinterpreted as an offline/cache adapter. Authenticated progress uses Supabase as the source of truth.
- The Addendum’s audio choice is resolved to free, code-first miniaudio for the curriculum baseline. FMOD is optional enrichment/future team workflow and cannot be mandatory.
- The Front-End Specification controls presentation only. It cannot remove, reorder, or simplify content required by the curriculum sources.

### 2.3 Traceability model

Every lesson source file contains:

```yaml
sourceTrace:
  - document: authoritative-guide
    pages: [8, 9, 10]
    sections: ["Corrected design specification for core systems"]
  - document: final-addendum
    pages: [2, 3, 4]
    sections: ["Missing topics and why they matter", "Combat-specific edge cases"]
```

The build creates `generated/source-trace.json` with forward links (source section to lessons) and reverse links (lesson to sources). CI fails if a registered source requirement has no lesson, reference page, assessment, project task, or explicit documented deferral. Traceability is reviewed at every curriculum release.

### 2.4 Source-section-to-course trace summary

| Source subject | ActionDev coverage |
|---|---|
| Narrow runtime; own versus borrow; stack | `AD-OR-02`, `AD-RT-01`, reference `REF-ARCH-OWN-BORROW` |
| C++/CMake/Git/LFS/CI/testing/sanitizers | `AD-FD-01` through `AD-FD-08`, `AD-QA-01` |
| SDL3 shell/input/lifecycle | `AD-PL-01` through `AD-PL-04` |
| bgfx/shaders/glTF/Blender/render debugging | `AD-RN-01` through `AD-RN-04` |
| EnTT/ECS/data/schemas/serialization/tools/hot reload | `AD-DT-01` through `AD-DT-05` |
| Fixed timestep/Jolt/controller/queries | `AD-SM-01` through `AD-SM-04` |
| Ozz/animation graphs/events/root motion/contracts | `AD-AN-01` through `AD-AN-05` |
| Full movement/target/combat/defense/damage/UI law | `AD-CB-01` through `AD-CB-10` |
| Skill architecture, hybrid class/weapon progression | `AD-RP-01` through `AD-RP-07` |
| Loot/inventory/affixes/economy/save integrity | `AD-RP-08` through `AD-RP-11`, `AD-NW-10` |
| Recast/Detour, AI, threat, encounter/boss scaling | `AD-AI-01` through `AD-AI-07` |
| Dedicated networking, prediction, snapshots, interest, security | `AD-NW-01` through `AD-NW-12` |
| Party/social/revive/pings/readability/accessibility | `AD-UX-01` through `AD-UX-06` |
| QA/profiling/fuzz/soak/crash/telemetry | `AD-QA-01` through `AD-QA-05` |
| Steamworks/SteamPipe/Cloud/achievements/EA/support | `AD-SH-01` through `AD-SH-06` |
| Frontend shell/lesson/exercise/project/reference UX | Sections 5, 7, and 9 |

Detailed document-section trace:

| Document pages/section | ActionDev implementation target |
|---|---|
| Front-End Design pp. 1-3: Scope, Product Identity, Design Direction, Color, Typography, Layout | Sections 3, 5, 9 design tokens, shell, content widths, identity acceptance criteria |
| Front-End Design pp. 3-5: Overview, Global Navigation, Scalable Routes, Shared Learning Shell | Sections 5.1-5.4 and route registry generated by Section 8 |
| Front-End Design pp. 5-7: Lesson, Exercise/Lab, Project/Milestone, Resource/Reference UI | Sections 5.4-5.7; exercise Section 7; milestone Phase 7 |
| Front-End Design pp. 7-10: Progress, density, motion, responsive, accessibility, performance, rules | Sections 3.3, 5.8, 9.3-9.5, and Section 14 UX gates |
| Authoritative Guide pp. 1-3: Executive Summary, Non-negotiables, Corrected Architecture | `AD-OR-*`, `AD-NW-01`, product principles and source precedence |
| Authoritative Guide pp. 3-8: stack, integration, networking baseline/replication | `AD-FD-*`, `AD-PL-*`, `AD-RN-*`, `AD-DT-*`, `AD-SM-*`, `AD-NW-02..06` |
| Authoritative Guide pp. 8-11: corrected core system specification | `AD-CB-*`, `AD-RP-*`, `AD-AI-04..07`, `AD-UX-04..06` |
| Authoritative Guide pp. 12-15: lesson-based syllabus and gates | all Stage 0-5 lessons, especially Gate 00 through Gate 03 |
| Authoritative Guide pp. 16-19: multiplayer scaling, tools, tests, packaging | `AD-AI-07`, `AD-UX-*`, `AD-QA-*`, `AD-SH-02` |
| Authoritative Guide pp. 18-20: milestone scope, risks, Early Access | all six gates, Sections 12-15 |
| Authoritative Guide pp. 20-25: durable-code checklist, ability/item/snapshot/message examples | references plus `AD-RP-01`, `AD-RP-08`, `AD-NW-02..07`, content fixtures |
| Final Addendum pp. 1-4: gap analysis and combat edge cases | `AD-AN-03..05`, `AD-CB-02..09`, `AD-RP-04..05`, `AD-NW-06/10/11`, `AD-QA-04` |
| Final Addendum pp. 5-9: middleware tradeoffs, architecture, combat data flow | `AD-OR-02`, middleware modules, canonical combat reference/simulator |
| Final Addendum pp. 10-16: lessonized foundation/combat/animation/network/AI/loot | Stage 0-5 lesson bodies and assessments |
| Final Addendum pp. 16-18: hybrid progression insertion and milestone sequencing | `AD-RP-03..11` and Gate 02 before content expansion |
| Final Addendum pp. 18-21: QA, profiling, security, Steam checklist, risks | `AD-NW-11/12`, `AD-QA-*`, `AD-SH-*`, Sections 11 and 15 |
| Roadmap and Syllabus pp. 1-5: architecture assumptions and A-L stage map | overall Stage 0-7 sequence, architecture, and estimates |
| Roadmap and Syllabus pp. 6-9: detailed Lessons A-L | the 89-lesson decomposition and per-lesson implementation contract |
| Roadmap and Syllabus pp. 10-12: own/borrow, combat state/damage/hit/loot/AI/party rules | `AD-OR-02`, `AD-CB-*`, `AD-RP-08..11`, `AD-AI-*`, `AD-UX-*` |
| Roadmap and Syllabus pp. 13-14: stable/eight-player/EA quality gates | Gate 02, Gate 04, Gate 05, Sections 12 and 14 |
| Roadmap and Syllabus pp. 15-17: primary official resources/examples | Section 6.12 optional resource registry |
| Earlier Roadmap pp. 1-6: scope, stack, ownership, data formats | `AD-OR-02`, foundations/platform/data lessons |
| Earlier Roadmap pp. 6-13: server model, schemas/messages, validation, target/damage/timing | `AD-NW-*`, `AD-CB-*`, reference contracts and simulators |
| Earlier Roadmap pp. 13-17: staged milestones/library/test mapping | all gates and development phases |
| Earlier Roadmap pp. 17-20: party/scaling/readability/tools/test matrix | `AD-AI-07`, `AD-UX-*`, `AD-QA-*` |
| Earlier Roadmap pp. 20-24: Steam operations and prioritized learning blocks | `AD-SH-*`, full curriculum order, optional resource registry |

## 3. Product Principles and Non-Negotiables

### 3.1 Learning contract

1. **No mandatory external learning.** Every required concept is explained and exercised in ActionDev. A lesson cannot use “read/watch this first” as a prerequisite.
2. **Application before handoff.** The learner receives framing, concept instruction, worked examples, checks, practice, and assessment before the project assignment.
3. **The learner builds the game.** ActionDev may validate in-app answers and record self-supplied evidence; it does not secretly generate or claim to verify the learner’s C++ project.
4. **ARPG-specific instruction.** Generic examples are allowed only to introduce fundamentals; lessons promptly reconnect them to the final runtime, combat, networking, loot, AI, or shipping system.
5. **Optional means optional.** Enrichment is free, no-account/no-payment where possible, labeled with purpose and expected depth, and never part of completion.
6. **Gates represent evidence.** Completion requires the lesson’s in-app work and, where applicable, a project evidence checklist. Time-on-page alone never completes a lesson.
7. **Failure is explanatory.** Feedback states why an answer failed, what mental model to use, and what to retry. Gating assessments permit retries and never use manipulative scarcity.

### 3.2 Game-development contract

- Build a focused, opinionated ARPG runtime, not a general-purpose engine.
- Use C++20/23, CMake, exactly one dependency manager per project tree, SDL3, bgfx, EnTT, Jolt, Recast/Detour, ozz-animation, RmlUi, Dear ImGui, GameNetworkingSockets, JSON for authored gameplay data, glTF/GLB for runtime 3D assets, and miniaudio as the free initial audio path.
- Own character/controller feel, camera, targeting, combat state, abilities, timing windows, hit rules, damage, status, threat/AI combat, loot/progression, save schemas, replication contracts, developer tools, and telemetry schema.
- Borrow window/input device access, rendering backend abstraction, physics primitives, navmesh construction/query basics, animation sampling/blending primitives, UI layout, packet transport/encryption/relay capabilities, build/package tools, and crash-capture infrastructure.
- Disposable local feel prototypes are allowed. The first durable architecture has client, server, shared simulation, tools, assets, and tests as separate concerns.
- The server owns final movement validation, combat, AI, loot, inventory, progression, session truth, and persistence. A client owns camera and may predict local movement/presentation.
- Preserve the canonical combat brief without silent changes: camera-relative movement; independent camera; movement-facing rotation; nearest-in-range soft target independent of facing; Tab lock without camera lock or forced strafe; startup-only capped facing assistance where authored; directional versus aimed skill semantics; holdable three-hit chain; 2 main/2 sub/4 class/1 ultimate slots; held block with raise cost, drain, perfect-block refund of raise cost only, guard break and full recovery; two independent dodge charges; dodge/block/modifiers/shields/health/post-hit order.
- Tooling, tests, profiling, readability, accessibility, save migration, and release operations are product work, not optional cleanup.

### 3.3 Application, privacy, and accessibility contract

- GitHub Pages contains only public static assets and browser-safe configuration.
- Supabase is authoritative for authenticated progress. IndexedDB may hold a retry queue and drafts; `localStorage` may hold only non-authoritative display preferences and cache markers.
- Every exposed database table has RLS. User-owned records are keyed to `auth.uid()` and indexed by ownership. No service-role or secret key enters the browser, repository, Pages artifact, or client-visible GitHub Actions log.
- Progress is queryable normalized data, not irreversibly hashed. Hashes are optional integrity/deduplication metadata, never access control.
- Collect only email (inside Supabase Auth), optional display name/timezone/pace, progress, learner-authored notes/evidence, and accessibility preferences. Do not collect game repository contents, source code, real name, birth date, behavioral advertising data, or unnecessary telemetry.
- WCAG 2.2 AA is the target. Keyboard-only use, visible focus, semantic headings, screen-reader naming, reduced motion, increased contrast, touch targets of at least 44 CSS pixels where practical, text zoom, code/table horizontal scrolling, and no color-only status are release gates.
- The visual system remains premium and restrained: near-black neutral foundation, technical blue/systems violet/success green/build orange/error red used for meaning, continuous bands, limited cards, no fantasy parchment, no neon overload, no game-launcher framing, and no route-specific microsite styles.

## 4. User Journeys

### 4.1 First-time learner

1. The public landing route shows the ActionDev mission, the custom-runtime boundary, the approximate path to Early Access, and the fact that project work happens in the learner’s repository.
2. The learner can browse the course map and a sample lesson anonymously. No anonymous Supabase user is created; anonymous progress remains a clearly labeled local preview only.
3. On **Start the path**, the learner creates an account. Initial recommendation: verified email/password for reliable cross-device access, with magic-link sign-in offered as a convenience after account creation. The UI explains that auth email delivery on a free backend may be rate-limited and provides resend state without loops.
4. Onboarding asks only for display name/alias, timezone, preferred weekly pace, keyboard/controller interest, text scale, reduced motion, and contrast preference. Every field except pace can be skipped.
5. The learner sees the complete path, estimated focused hours, permanent gates, own/borrow boundary, and initial lesson `AD-OR-01`. The dashboard offers one primary action: begin orientation.
6. Completion of onboarding writes a profile and preferences to Supabase. The client confirms sync; a local queue is used only if the write fails.

### 4.2 Returning learner on another device

1. The learner signs in; Supabase restores/refreshes the browser session.
2. The app fetches profile, current course version, lesson progress, milestone state, notes/bookmarks metadata, and preferences in parallel.
3. A resume resolver chooses the most recent incomplete required lesson with satisfied prerequisites, preferring the last server-recorded location. It never trusts a stale local pointer over server state.
4. The dashboard shows “Resume `AD-*`”, last synchronized time, pending local operations if any, and any major-version review prompt.
5. The learner continues from the stored heading/exercise step. Ephemeral collapsed panels or editor tabs need not cross devices unless explicitly saved.

### 4.3 Completing an in-app lesson

1. The lesson header shows prerequisites, objectives, estimated study/project time, gate contribution, glossary, and completion rule.
2. The learner reads sections, explores diagrams with text alternatives, and runs practice checks. Section position is debounced to the progress adapter.
3. Required exercises provide immediate feedback. Practice attempts are unlimited; gating attempts are immutable and server-recorded.
4. If the lesson has no project handoff, `complete_lesson` verifies required assessment attempt IDs and prerequisites in the database, then records the completed lesson version and event.
5. If it has a handoff, the lesson becomes `awaiting_project_evidence`; the next route is the milestone workspace rather than false completion.

### 4.4 Completing an external project implementation task

1. **Build It in Your Project** gives exact expected files/systems, manual checks, automated tests, evidence, common failure modes, and rollback guidance.
2. The learner works outside ActionDev. The application does not run background repository inspection.
3. On return, the learner supplies a repository URL only if desired, commit hash, checklist, reflection, test summary, and optional screenshot/object path. Sensitive logs and source code are discouraged.
4. The milestone RPC checks ownership, prerequisite lesson state, required evidence categories, and attestation. It cannot prove code correctness; UI labels the result **learner-verified**.
5. Completing all required evidence moves the milestone to `ready_for_review` or, for self-guided mode, `completed_self_verified` and unlocks the next gate.

### 4.5 Failing and retrying an exercise

1. Submission receives a score plus feedback codes, not merely red/green state.
2. The UI maps each code to an explanation, highlights the relevant model, and offers one progressive hint at a time. Incorrect options do not vanish.
3. The original attempt remains immutable. A retry creates a new attempt linked to the same lesson/exercise/version.
4. Best score and latest score are both shown. Gating uses the defined rule (for example, 80% plus all safety-critical items), not an averaged punishment.
5. After repeated failure, the app suggests specific in-app sections and a worked example; it never redirects to mandatory external content.

### 4.6 Resuming after interruption or offline failure

1. Notes, text answers, and code drafts save to IndexedDB on change and, where supported, to Supabase after a debounce.
2. Network failure changes the sync badge to **Saved on this device; sync pending**. It never claims cloud save.
3. Idempotent queued operations retry with exponential backoff when online. Permanent authorization/content-version errors stop retrying and require user resolution.
4. On another device, only successfully synced state appears. The original device reconciles on reconnection using the conflict rules in Section 10.

### 4.7 Local vertical-slice gate

The learner sees a gate review assembling evidence from repository/toolchain, fixed-step sandbox, movement, targeting, animation/combat, data-driven abilities, AI, loot, local dedicated server, debug tools, and tests. The gate requires a 10-15 minute solo run against the authoritative localhost server; one class; one main and sub weapon family; three enemy archetypes; one boss; instanced loot; save/load; and no blocker desync or corruption. Missing prerequisites deep-link to the relevant ActionDev lesson.

### 4.8 Two-player proof gate

The gate requires two remote processes/players to repeatedly complete the same slice under induced latency/loss; server-authoritative movement and combat; local prediction and remote interpolation; party/join/revive; personal loot ownership; reconnect; and no progression corruption. Evidence includes a network profile, packet simulation settings, test results, and learner reflection on observed reconciliation.

### 4.9 Eight-player stress gate

The gate progresses through 2, 4, 6, and 8 participants or equivalent simulation. It requires documented server tick, CPU, memory, packet, relevance, AI, projectile, and VFX budgets; readable ally frames and enemy telegraphs; party scaling; reconnect/late join; two-hour soak; induced packet loss; and save/loot integrity. Passing does not depend on a polished content breadth.

### 4.10 Steam Early Access preparation

The learner completes release branches, SteamPipe/depot rehearsal, dedicated-server packaging plan, Cloud/save conflict policy, achievements/stats smoke test, crash/log/support workflow, accessibility checks, store assets and honest current-state copy, Coming Soon timing, patch template, save compatibility policy, and a private-branch release rehearsal. ActionDev blocks the gate if the learner describes a tech demo or future promises instead of a replayable game available now.

## 5. Information Architecture

### 5.1 Navigation and routes

Use `HashRouter`; route fragments remain stable under a GitHub Pages project base. The canonical route registry is generated from content rather than hardcoded in components.

| Route | Purpose |
|---|---|
| `/#/` | Public overview for anonymous users; authenticated learning hub for signed-in users. |
| `/#/onboarding` | Mission, account, pace, preferences, own/borrow boundary. |
| `/#/dashboard` | Resume, stage/system progress, next gate, performance, recent work. |
| `/#/path` | Complete dependency-aware curriculum map with required/optional/artifact/gate filters. |
| `/#/stage/:stageSlug` | Stage outcomes, modules, dependencies, gate, estimates. |
| `/#/lesson/:lessonSlug` | Lesson reader and embedded practice. |
| `/#/exercise/:exerciseId` | Focused exercise workspace; deep-linkable from a lesson. |
| `/#/milestones` | All gates and project artifacts. |
| `/#/milestone/:milestoneSlug` | Evidence, acceptance criteria, tests, reflection, status history. |
| `/#/reference` | Searchable glossary, contracts, diagrams, schemas, checklists. |
| `/#/reference/:referenceSlug` | Stable anchored reference page. |
| `/#/progress` | Stage/system performance, completed versions, assessment history, export. |
| `/#/notes` | Notes and bookmarks across content. |
| `/#/settings/account` | Auth, recovery, export, deletion, progress reset. |
| `/#/settings/accessibility` | Text/UI density, motion, contrast, editor, device preferences. |
| `/#/auth/callback` | Auth callback parser and safe redirect to the stored internal destination. |
| `/#/auth/recovery` | Password recovery state and update form. |

Global navigation contains ActionDev, Dashboard, Path, Milestones, Reference, a resume control, `Cmd/Ctrl+K` command palette, sync state, and account menu. Desktop dropdown trays and mobile grouped drawer use the same route registry. Hover behavior is mirrored by focus; no action is hover-only.

### 5.2 Dashboard

The first authenticated viewport shows current stage/module/lesson, a single resume action, overall required completion, next milestone, pending evidence, and sync status. Below it are continuous page bands for:

- stage and system progress (foundation, rendering, combat, RPG, AI, networking, party/UI, shipping);
- upcoming project artifacts and blockers;
- assessment trends using best/latest scores without punitive leaderboards;
- recently viewed notes/bookmarks;
- optional pace projection based on learner-entered weekly hours, never manipulative streak loss.

The immersive background, if used, depicts actual domain relationships (C++ runtime modules, multiplayer connections, combat state flow) and fades only into the lower page background. The next band remains visible in the first viewport.

### 5.3 Curriculum map

Render a virtualized dependency graph and an accessible ordered-list alternative. Nodes encode required/optional, completion, locked reason, permanent project artifact, source A-L mapping, and gate contribution. Selecting a node opens a details drawer without losing map position. Filters include stage, system, estimated effort, project artifact, assessment, and optional content. Gates appear as explicit junctions, not decorative badges.

On mobile, default to the ordered stage/module list; graph view is an optional horizontally pannable mode with zoom controls and a textual equivalent. Deep links reopen collapsed ancestors and focus the target.

### 5.4 Lesson reader

Wide layout: global shell; compact lesson header; sticky local table of contents; 720-860 px reading column; optional metadata/notes rail. Narrow layout: header, collapsible contents, reading column, bottom previous/next controls. Supported blocks are prose, definition, restrained note/warning, code, diff, terminal, diagram, timeline, table, tabs, collapsible explanation, worked example, common error, checkpoint, exercise embed, project handoff, optional resource, and completion summary.

The lesson header always exposes prerequisite state, objectives, vocabulary, effort, version, source trace in an “About this lesson” disclosure, required exercises, project artifact, and milestone. Long lessons store the last heading. Code examples offer copy, wrap/scroll, line labels, language, and an adjacent explanation; copy is not treated as learning.

### 5.5 Exercise workspace

Desktop uses a stable split: instructions/rubric on the left; interaction/editor/diagram on the right; feedback/console below without layout jumps. Mobile uses labeled Instructions, Work, and Feedback tabs while preserving drafts. Controls include submit/check, reset with confirmation, hint, accessible keyboard shortcuts, and solution/model answer only when policy permits.

Practice and gating assessments use distinct labels. Every exercise shows attempts, best/latest result, completion rule, and whether evaluation is local or server-verified. Screen-reader announcements are concise and do not dump whole code blocks on each result.

### 5.6 Milestone workspace

Sections are Brief, Dependencies, Build steps, Files/systems, Acceptance criteria, Manual tests, Automated tests, Evidence, Reflection, Risks, and Status history. Evidence types are URL, commit hash, checklist, short text, test summary, and optional screenshot/object path. Required, optional, completed, blocked, and not-started states use icon/text as well as color. “Mark ready” explains learner-verification limits.

### 5.7 Reference library and search

Use dense searchable lists, not decorative card grids. Index glossary terms, architecture contracts, combat laws, diagrams, schemas, tool conventions, debugger checklists, testing matrix, release checklist, lessons, exercises, milestones, and optional resources. The static build emits a MiniSearch/FlexSearch index; search loads after navigation is interactive. External links show an icon, destination domain, optional label, and open safely with `noopener`.

### 5.8 Settings, responsiveness, motion, and density

Account settings provide session state, email/password recovery, export, deletion, and scoped reset (drafts, a module, or all progress) with typed confirmation. Accessibility settings are server-synced; purely device-specific layout choices stay local unless the learner opts to sync.

Use 1180-1280 px general content, 720-860 px reading, and 1100-1400 px workspaces. Split panes become tabs/stacks; tables/code scroll; controls never overlay headings; touch targets are 40-44 px minimum with a 44 px target default. Compact mode reduces repeated-item spacing but never hides details globally. Motion explains state in 120-220 ms and is disabled/reduced under `prefers-reduced-motion`; validation and navigation are never delayed by animation.

## 6. Complete Curriculum Mapping

### 6.1 Lesson implementation contract

Every lesson below is a content production unit. The compact entries use these required fields:

- **Prereq**: required lessons or gate.
- **Teach**: objectives and in-app sections, including correct/incorrect/debug examples.
- **Visual**: required diagram, state view, timeline, or data model with a text alternative.
- **Check**: in-app practice plus gating assessment and threshold.
- **Build/Test/Artifact**: exact project handoff, evidence, manual/automated validation, and permanent output. “None” means the lesson completes entirely in-app.
- **Done**: completion rule; required exercises are always included even when abbreviated.
- **Effort**: in-app focused hours plus estimated project hours where applicable.
- **Milestone**: gate contribution.
- **Optional**: free enrichment resource key from Section 6.12. The full required explanation remains in ActionDev.

Every lesson also includes framing, deliberate vocabulary, at least one annotated worked example, one incorrect/debug example, glossary links, saveable notes, and a project-specific reflection. Those shared elements are schema-required and are not repeated in each entry.

### 6.2 Stage 0 - Orientation and foundations (source Lessons A-B)

#### Module AD-OR - Mission and architecture boundary

**AD-OR-01 - The ActionDev learning contract**  
Prereq: none. Teach: distinguish in-app education from repository implementation; understand stages, gates, evidence, estimates, optional resources, progress privacy, and self-verification limits. Visual: full course path with six gates and “inside ActionDev/outside in project” swimlanes. Check: match activities to the correct environment; scenario on whether a link can replace a lesson; 100% on non-negotiables. Build/Test/Artifact: create or identify the learner repository and record an optional URL plus a written scope statement; no code. Done: onboarding, contract check, and scope reflection complete. Effort: 1-2 h + 0.5 h project. Milestone: `AD-GATE-00`. Optional: `R-GPP`.

**AD-OR-02 - Build the ARPG, not a general engine**  
Prereq: `AD-OR-01`. Teach: custom runtime versus engine, own/borrow boundary, selected middleware, PC/Steam/dedicated-session assumptions, non-goals, and how to reject general-purpose editor/shader/physics/transport work. Visual: own-versus-borrow matrix and runtime dependency map. Check: architecture tradeoff scenarios and “scope or game requirement?” sorting; 85%. Build/Test/Artifact: write `docs/runtime-scope.md` with owned/borrowed systems and decision log. Test: every owned system maps to an ARPG requirement; every borrowed layer has a selected library. Done: assessment and artifact attestation. Effort: 2-3 h + 1 h. Milestone: `AD-GATE-00`. Optional: `R-GPP`, `R-DOD`.

#### Module AD-FD - Modern C++, repository, and engineering discipline

**AD-FD-01 - Command line, compiler, linker, and debugger mental model**  
Prereq: `AD-OR-02`. Teach: files/directories, shell commands, translation units, headers, preprocessing, object files, linking, executable, symbols, debug/release; correct and broken compile/link examples. Visual: source-to-executable pipeline. Check: order build stages, classify compiler/linker/runtime errors, inspect short diagnostic excerpts; 80%. Build/Test/Artifact: create `scratch/foundations` and compile/run/debug a two-file program using documented commands. Test: clean rebuild and intentional undefined-symbol diagnosis. Done: checks plus command/output evidence. Effort: 4-6 h + 2 h. Milestone: `AD-GATE-00`. Optional: `R-CPPREF`, `R-CMAKE`.

**AD-FD-02 - Types, control flow, functions, structs, and namespaces**  
Prereq: `AD-FD-01`. Teach: fundamental types, initialization, conversions, conditions/loops, functions, references, `const`, enums, structs, namespaces, header/source separation using health/resources and ability examples. Visual: stack-frame and function-call flow. Check: code reading, completion, conversion bug finding; 80%. Build/Test/Artifact: implement typed `Health`, `Stamina`, and `DamageEvent` utilities without global mutable state. Tests: boundary values, invalid conversion cases. Done: assessment and test evidence. Effort: 8-12 h + 4 h. Milestone: `AD-GATE-00`. Optional: `R-CPPREF`.

**AD-FD-03 - RAII, ownership, lifetime, and resource safety**  
Prereq: `AD-FD-02`. Teach: scope, stack/heap, constructors/destructors, raw pointer roles, smart pointers, references, handles, ownership graphs, leaks/dangling/double-free; resource wrappers for SDL/bgfx-like handles. Visual: object lifetime and ownership diagrams. Check: identify owner, repair lifetime bugs, select `unique_ptr`/value/handle; all safety-critical items + 80%. Build/Test/Artifact: RAII wrapper for a mock runtime resource and handle registry. Tests: construction/destruction order, stale handle rejection, ASan clean. Done: assessment and sanitizer evidence. Effort: 8-12 h + 5 h. Milestone: `AD-GATE-00`. Optional: `R-CORE`, `R-ASAN`.

**AD-FD-04 - Value semantics, move semantics, containers, spans, and ranges**  
Prereq: `AD-FD-03`. Teach: copy/move, vector/string/map tradeoffs, iterators, algorithms, `span`, views/ranges, invalidation, allocation awareness; ability registry and snapshot examples. Visual: container storage/invalidation timeline. Check: predict copies/moves, choose structures, debug invalidated references; 80%. Build/Test/Artifact: allocation-conscious command buffer and stable-ID registry. Tests: move/copy counters, invalidation, empty/large inputs. Done: checks, code reflection, tests. Effort: 8-12 h + 5 h. Milestone: `AD-GATE-00`. Optional: `R-CPPREF`, `R-DOD`.

**AD-FD-05 - APIs, errors, strong IDs, tags, and serialization-friendly data**  
Prereq: `AD-FD-04`. Teach: invariants, `expected`-style results, exceptions policy, strong types, opaque IDs, enums/flags, tag sets, POD-like wire/data boundaries, parse/validate/activate separation. Visual: boundary-validation flow. Check: improve ambiguous APIs, classify validation location, design schema contracts; 85%. Build/Test/Artifact: strong entity/ability/item IDs, result type, starter gameplay tag set, JSON round-trip model. Tests: invalid IDs, missing fields, unknown versions. Done: API review checklist and tests. Effort: 8-12 h + 6 h. Milestone: `AD-GATE-00`. Optional: `R-CORE`, `R-JSON`.

**AD-FD-06 - CMake targets, presets, packages, and repository layout**  
Prereq: `AD-FD-05`. Teach: target-based CMake, visibility, presets, build types, generated files, CTest, install/package concepts, vcpkg versus Conan, why exactly one manager, `/client /server /shared /tools /tests /assets`. Visual: target dependency graph. Check: fix transitive include/link errors, choose public/private/interface, package-policy scenario; 85%. Build/Test/Artifact: monorepo skeleton, `CMakePresets.json`, vcpkg baseline, client/server/shared/test hello targets. Tests: clean configure/build/test with Debug and RelWithDebInfo. Done: clone-to-green evidence and setup doc. Effort: 10-14 h + 8 h. Milestone: `AD-GATE-00`. Optional: `R-CMAKE`, `R-VCPKG`.

**AD-FD-07 - Git, GitHub, LFS, branches, and reviewable changes**  
Prereq: `AD-FD-06`. Teach: commits, branches, merges/rebases at beginner level, ignore rules, LFS pointer model, binary asset policy, issues/PRs, release branches, bisect/revert, secrets hygiene. Visual: local/remote history and asset path. Check: order safe recovery, identify secret/binary mistakes, split a bad commit; 80%. Build/Test/Artifact: repository rules, `.gitignore`, `.gitattributes`, LFS patterns, PR template, decision record template. Test: fresh clone obtains assets and builds; no secrets tracked. Done: artifact checklist. Effort: 6-9 h + 3 h. Milestone: `AD-GATE-00`. Optional: `R-PROGIT`, `R-GHLFS`.

**AD-FD-08 - Tests, CI, sanitizers, logging, profiling, and build discipline**  
Prereq: `AD-FD-07`. Teach: unit/integration/smoke distinctions, CTest/GoogleTest, assertions, ASan/UBSan/TSan tradeoffs, structured logs, crash context, Tracy zones, reproducible CI, formatting/static analysis. Visual: feedback pipeline from commit to artifact. Check: choose test/tool by failure, diagnose sanitizer/log excerpts, CI ordering; 85%. Build/Test/Artifact: GitHub Actions build/test lane, formatting/static-analysis checks, sanitizer preset, structured logger, smoke test and profiler marker. Test: intentional failure is caught in each lane. Done: CI run evidence and tool matrix. Effort: 10-14 h + 8 h. Milestone: `AD-GATE-00`. Optional: `R-GTEST`, `R-ASAN`, `R-TSAN`, `R-TRACY`.

`AD-GATE-00` exit: a fresh clone builds client/server/shared/tests from documented presets; dependencies are pinned; CI, formatter, static analysis, unit test, and at least one sanitizer lane work; Git/LFS rules and runtime scope exist. Estimated source-block total remains within Lesson A-B’s broad 200-300 hour learning range when exercises and independent practice are included.

### 6.3 Stage 1 - Platform, rendering, ECS, and content (source Lessons C-E)

#### Module AD-PL - SDL3 platform shell

**AD-PL-01 - Application lifecycle and SDL3 platform boundary**  
Prereq: `AD-GATE-00`. Teach: initialize/run/shutdown, subsystem ownership, errors, window lifecycle, focus/alt-tab, event pump, clean failure paths, client-only versus shared code. Visual: lifecycle state machine. Check: ordering and failure diagnosis; 85%. Build/Test/Artifact: SDL3 client bootstrap with guarded teardown and smoke-testable platform adapter. Tests: repeated start/stop, failed initialization, window close. Done: runnable artifact and tests. Effort: 4-6 h + 5 h. Milestone: `AD-GATE-01`. Optional: `R-SDL`.

**AD-PL-02 - Input actions, devices, gamepads, and focus safety**  
Prereq: `AD-PL-01`. Teach: events versus sampled state, action mapping, chords/deadzones, simultaneous keyboard/mouse/gamepad, device connect/disconnect, glyph abstraction, remapping, no stuck input after focus loss. Visual: physical input -> action -> command flow. Check: mapping and edge-case scenarios; 85%. Build/Test/Artifact: action-map layer and controller debug screen. Tests: unplug/replug, same-frame mouse/gamepad, focus loss, remap conflict. Done: assessment plus recorded test matrix. Effort: 6-9 h + 7 h. Milestone: `AD-GATE-01`. Optional: `R-SDL`, `R-STEAMINPUT`.

**AD-PL-03 - Frame loop, clocks, configuration, logging, and debug loop**  
Prereq: `AD-PL-02`. Teach: wall/render/simulation clocks, accumulator preview, frame pacing, configuration validation/hot reload, log categories, debug overlay, safe main-thread ownership. Visual: frame loop with future fixed-step boundary. Check: timing calculations, bad hot-reload design, log-level diagnosis; 85%. Build/Test/Artifact: frame timer, validated config, hot reload for presentation-only values, ImGui timing/input pane. Tests: variable render rate, malformed config, reload rollback. Done: stable shell evidence. Effort: 6-9 h + 7 h. Milestone: `AD-GATE-01`. Optional: `R-SDL`, `R-IMGUI`.

**AD-PL-04 - Audio-device shell and free audio boundary**  
Prereq: `AD-PL-03`. Teach: device lifecycle, buses/categories, event IDs versus filenames, spatial/non-spatial split, volume/accessibility settings, miniaudio baseline, why designer middleware is optional. Visual: gameplay event -> audio service -> device. Check: ownership and failure scenarios; 80%. Build/Test/Artifact: miniaudio-backed smoke service or interface plus silent fallback. Tests: missing device/file and shutdown. Done: assessment and API contract. Effort: 3-5 h + 3 h. Milestone: `AD-GATE-01`. Optional: `R-MINIAUDIO`.

#### Module AD-RN - bgfx rendering and asset ingress

**AD-RN-01 - Renderer bootstrap, views, resources, and frame submission**  
Prereq: `AD-PL-03`. Teach: renderer abstraction, backend selection, handles/lifetimes, views/passes, transforms, draw submission, resize/device reset, client-only boundary. Visual: CPU submission to backend frame. Check: order calls, repair lifetime/view bugs; 85%. Build/Test/Artifact: bgfx init/shutdown, clear, ground plane, simple mesh, orbit camera, frame HUD. Tests: resize/reload/no leaked handles. Done: capture plus test evidence. Effort: 8-12 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-BGFX`.

**AD-RN-02 - Shader pipeline, materials, lighting, and debugging**  
Prereq: `AD-RN-01`. Teach: vertex/fragment flow, spaces, uniforms, shaderc variants, material contracts, view order, RenderDoc capture, visual diagnostics, incorrect matrices/resources. Visual: coordinate spaces and shader pipeline. Check: match space to operation, debug broken render captures; 85%. Build/Test/Artifact: CI shader build, lit graybox material, debug normals/wireframe/overdraw-like view. Tests: compile all variants and stable screenshots. Done: annotated capture and tests. Effort: 10-14 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-BGFX`, `R-RENDERDOC`.

**AD-RN-03 - Blender-to-glTF/GLB asset workflow**  
Prereq: `AD-RN-02`. Teach: axes/units/transforms, meshes/materials/textures, naming, skeleton/animation preview, export settings, runtime-ready versus source assets, Git LFS, glTF validation. Visual: Blender source -> export -> validate -> import -> runtime. Check: diagnose scale/axis/material errors and choose asset form; 85%. Build/Test/Artifact: placeholder environment and character round trip with conventions document. Tests: glTF validator, missing texture/reference, repeatable export sample. Done: runtime capture and validation log. Effort: 6-10 h + 8 h. Milestone: `AD-GATE-01`. Optional: `R-GLTF`, `R-BLENDER`.

**AD-RN-04 - Render architecture, diagnostics, budgets, and asset failure UX**  
Prereq: `AD-RN-03`. Teach: scene extraction versus rendering, resource caches, fallback assets, pass ownership, debug draw, GPU/CPU budget thinking, lazy/async boundaries, no server rendering dependency. Visual: simulation snapshot -> presentation facade -> render queue. Check: architecture scenarios and failure triage; 85%. Build/Test/Artifact: render submission facade, missing-asset marker, pass toggles, frame capture checklist. Tests: scene reload, invalid asset, server target links without renderer. Done: design review and automated smoke. Effort: 6-9 h + 8 h. Milestone: `AD-GATE-01`. Optional: `R-BGFX`, `R-TRACY`.

#### Module AD-DT - EnTT, schemas, serialization, and tools

**AD-DT-01 - ECS tradeoffs, entities, components, systems, and services**  
Prereq: `AD-RN-04`. Teach: ECS strengths/limits, data-oriented iteration, entity identity, components versus services, events/commands, avoiding “everything is ECS,” client/server/shared placement. Visual: entity/component tables and system query. Check: classify concerns, repair coupling and boolean-component abuse; 85%. Build/Test/Artifact: EnTT playground with player/enemy/projectile/pickup/trigger and inspector. Tests: create/destroy, stale references, iteration behavior. Done: architecture reflection and tests. Effort: 7-10 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-ENTT`, `R-DOD`.

**AD-DT-02 - Stable identity, lifecycle, relationships, and serialization boundaries**  
Prereq: `AD-DT-01`. Teach: runtime entity IDs versus persistent IDs versus network IDs, parent/ownership relationships, spawn/despawn, snapshots, saveable versus derived state, version fields. Visual: ID domains and translation map. Check: choose ID and lifetime for scenarios; round-trip reasoning; 85%. Build/Test/Artifact: stable ID registry and serialization-friendly component boundary. Tests: ID reuse, missing reference, round trip, migration placeholder. Done: tests and schema review. Effort: 6-9 h + 8 h. Milestone: `AD-GATE-01`. Optional: `R-ENTT`, `R-JSON`.

**AD-DT-03 - Gameplay schemas, registries, validation, and references**  
Prereq: `AD-DT-02`. Teach: JSON schema-like validation for abilities, weapons, items, affixes, enemies, encounters; parse/validate/link/freeze pipeline; descriptive errors; cyclic and missing references; deterministic ordering. Visual: content compiler stages. Check: repair malformed definitions and design invariants; 90% including all integrity items. Build/Test/Artifact: data registry with sample ability/weapon/item/affix and validation CLI. Tests: unknown IDs, cycles, ranges, duplicates, deterministic output. Done: CI validator green. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-JSON`.

**AD-DT-04 - Hot reload, authoritative boundaries, and developer tools**  
Prereq: `AD-DT-03`. Teach: safe presentation reload, unsafe authoritative mutation, generation/version handles, transactional reload, inspector/edit distinction, record/replay test arenas. Visual: prepare/validate/swap/rollback flow. Check: decide what may reload during local/network play; debug stale references; 85%. Build/Test/Artifact: transactional config/content reload for non-authoritative sandbox plus entity/content inspectors. Tests: invalid reload preserves old state; changed IDs produce warning. Done: demonstration and tests. Effort: 6-9 h + 9 h. Milestone: `AD-GATE-01`. Optional: `R-IMGUI`, `R-ENTT`.

**AD-DT-05 - Asset/content pipeline automation and localization-ready data**  
Prereq: `AD-DT-04`. Teach: model/texture/shader/animation/nav/data/localization build steps, dependency hashes, generated versus source artifacts, CI cache, manifest, human-readable errors, stable string keys. Visual: asset DAG and CI outputs. Check: order pipeline, detect stale generated content, localization-key scenarios; 85%. Build/Test/Artifact: content-build target and manifest with validation hooks; placeholder locale bundle. Tests: clean/incremental build and missing localization key. Done: reproducible pipeline evidence. Effort: 7-10 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-CMAKE`, `R-GLTF`.

### 6.4 Stage 2 - Simulation, movement, animation, and combat (source Lessons F-H)

#### Module AD-SM - Fixed-step simulation and Jolt gameplay queries

**AD-SM-01 - Fixed-step simulation and render interpolation**  
Prereq: `AD-DT-05`. Teach: variable timestep failure, fixed accumulator, 30 Hz baseline, headroom/spiral of death, deterministic-enough replay, previous/current render interpolation, command queues. Visual: render frames crossing fixed ticks. Check: calculate ticks/alpha, order commands, diagnose divergent rates; 90%. Build/Test/Artifact: headless-capable fixed-step sandbox with uncapped interpolated client view. Tests: same scripted input at 30/60/144 render FPS yields equivalent simulation. Done: tests and timing capture. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-GAFFER-TIME`.

**AD-SM-02 - Jolt world, layers, shapes, and query API**  
Prereq: `AD-SM-01`. Teach: bodies/shapes, broad/narrow phases, collision layers/filters, raycasts, overlaps, sweeps/shape casts, query ownership and units. Visual: collision filtering and sweep volume. Check: select query and filter; debug false hits/tunneling; 85%. Build/Test/Artifact: Jolt sandbox and shared world-query facade with debug draw. Tests: layer matrix, ray/sweep/overlap consistency, no-hit behavior. Done: query matrix and tests. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-JOLT`.

**AD-SM-03 - Character controller: slopes, stairs, ledges, and frame invariance**  
Prereq: `AD-SM-02`. Teach: virtual/kinematic controller tradeoffs, grounding, walkable normals, step negotiation, depenetration, acceleration/braking, moving platforms boundary, camera collision. Visual: slope/step decision flow. Check: diagnose controller edge cases; 90%. Build/Test/Artifact: graybox traversal map and tuned controller. Tests: ascent/descent, stairs, ledges, corners, varying render rates, focus pause. Done: traversal checklist and automated scenarios. Effort: 10-14 h + 16 h. Milestone: `AD-GATE-01`. Optional: `R-JOLT`.

**AD-SM-04 - Forced movement, knockback, dodge displacement, and combat query contracts**  
Prereq: `AD-SM-03`. Teach: intent versus resolved motion, server-validatable displacement, wall clipping, sweeps, melee trace paths, block-facing arcs, hitbox/hurtbox/debug conventions. Visual: proposed motion -> sweep -> slide/reject -> state. Check: choose resolution for lunge/dodge/knockback; 90%. Build/Test/Artifact: forced-movement API, backward-wall dodge case, swept melee trace, hit visualization. Tests: tunneling, wall/ledge, multiple targets, repeated hit suppression. Done: tests and captured debug overlay. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-JOLT`.

#### Module AD-AN - Ozz and the animation-combat contract

**AD-AN-01 - Skeletons, clips, offline conversion, and runtime sampling**  
Prereq: `AD-RN-03`, `AD-SM-01`. Teach: skeleton hierarchy, bind/local/model space, clips/tracks, offline conversion/compression, sampling and skinning data flow, asset compatibility errors. Visual: Blender rig -> ozz archive -> sampled pose -> skinning. Check: space/hierarchy and import debugging; 85%. Build/Test/Artifact: one hero and enemy idle/run/attack clip through ozz. Tests: missing bones, repeatable conversion, resource reload. Done: runtime playback and pipeline log. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-OZZ`.

**AD-AN-02 - Animation graph, locomotion blending, layers, and additive reactions**  
Prereq: `AD-AN-01`. Teach: state graphs versus blend trees, parameters, transitions, crossfade, locomotion blend, upper-body layer, masks, additive hit reacts, transition interruption. Visual: minimal graph and layer stack. Check: select blend/layer, repair popping/ownership bugs; 85%. Build/Test/Artifact: idle/run and upper-body block/attack graph with hit reaction. Tests: transition stability and parameter boundaries. Done: debug graph capture and tests. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-OZZ`.

**AD-AN-03 - Event tracks and authoritative gameplay windows**  
Prereq: `AD-AN-02`, `AD-SM-04`. Teach: startup/active/recovery/lockout/buffer/cancel windows, VFX/SFX notifies, presentation event versus server outcome, tick conversion, duplicate/missed events, frame variance. Visual: animation time, fixed ticks, active hit window, network confirmation. Check: order and classify events; debug skipped/double event; 90%. Build/Test/Artifact: event schema and timing overlay for two attacks and block raise. Tests: variable render FPS, loop boundary, replay. Done: contract document and tests. Effort: 8-12 h + 12 h. Milestone: `AD-GATE-01`. Optional: `R-OZZ`, `R-GAFFER-TIME`.

**AD-AN-04 - Root motion, motion extraction, facing override, and server agreement**  
Prereq: `AD-AN-03`. Teach: code-driven versus extracted motion, explicit per-move policy, assist-facing startup window, server movement rule, collision truncation, reconciliation consequences, root rotation. Visual: authored trajectory versus collision-resolved authoritative trajectory. Check: policy/tradeoff scenarios; 90%. Build/Test/Artifact: one declared motion-extracted lunge and one code-driven attack. Tests: wall collision, capped angle/speed, server-replayable displacement. Done: policy and automated cases. Effort: 7-10 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-OZZ`.

**AD-AN-05 - Combat animation debugging, IK restraint, and gameplay/presentation separation**  
Prereq: `AD-AN-04`. Teach: timing audit, pose/trace overlay, blend-out/cancel rules, hit-stop allowance, simple look/foot IK, when IK damages authored combat, replicated compact action tags. Visual: gameplay state versus animation state ownership matrix. Check: diagnose desyncs and choose authority; 90%. Build/Test/Artifact: animation inspector and combat-window audit checklist; optional restrained head/foot IK. Tests: cancellation, late confirmation, reduced render rate. Done: debug evidence and authority map. Effort: 6-9 h + 8 h. Milestone: `AD-GATE-01`. Optional: `R-OZZ`, `R-IMGUI`.

#### Module AD-CB - Canonical third-person combat law

**AD-CB-01 - Camera-relative locomotion and independent facing**  
Prereq: `AD-SM-03`, `AD-PL-02`. Teach: project camera forward/right onto locomotion plane, normalize intent, movement-facing yaw, idle camera independence, free/attack-steer/hit-react/forced-motion facing states. Visual: vector construction and facing-state diagram. Check: vector reasoning and camera-only rotation cases; 100% on contract items. Build/Test/Artifact: movement/facing prototype with arrows and replay. Tests: orbit while moving and while idle; camera never directly rotates character. Done: contract tests and feel notes. Effort: 5-7 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-SDL`.

**AD-CB-02 - Soft target selection, stability, and invalidation**  
Prereq: `AD-CB-01`, `AD-DT-03`. Teach: nearest living hostile within main-weapon selection range regardless of facing, selection versus hit validity, hysteresis/tie-breaks, death/occlusion/teleport/phasing/corpse/faction/range/off-screen cases. Visual: candidate scoring and invalidation flow. Check: rank candidates and debug flicker; 100% on facing-independent selection. Build/Test/Artifact: scorer, target debug overlay, replay fixtures. Tests: crossing targets, behind player, equal distance, invalidation transitions. Done: tests and assessment. Effort: 6-9 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-GPP`.

**AD-CB-03 - Tab lock without camera lock or forced strafing**  
Prereq: `AD-CB-02`. Teach: explicit lock state, acquire/current/release/cycle rules, free camera, normal movement-facing locomotion, optional skill-specific strafe distinct from global lock, HUD state. Visual: soft/locked/invalid target state machine. Check: scenario decisions; 100% on no camera lock/no forced strafe. Build/Test/Artifact: lock and manual/cycle controls with world/HUD marker. Tests: camera orbit, movement facing, death/range/manual release. Done: tests and accessibility input check. Effort: 4-6 h + 8 h. Milestone: `AD-GATE-01`. Optional: `R-STEAMINPUT`.

**AD-CB-04 - Attack-facing, directional skills, aimed skills, and hit validity**  
Prereq: `AD-CB-03`, `AD-AN-04`. Teach: startup-only capped target assistance, max angle/turn speed per ability, directional character-facing skills, future camera/reticle aim, independent range/angle/collision/LOS validation. Visual: selection, facing resolution, shape validation pipeline. Check: resolve eight scenarios and spot illegal snap-turn; 90%. Build/Test/Artifact: facing resolver and directional/target-assisted/aimed test abilities. Tests: cap, target loss, miss despite selection, camera aim. Done: tests and inspector trace. Effort: 6-9 h + 10 h. Milestone: `AD-GATE-01`. Optional: `R-JOLT`.

**AD-CB-05 - Three-hit holdable basic chain**  
Prereq: `AD-CB-04`, `AD-AN-03`. Teach: startup/active/recovery, hold continuation, press buffering, buffer windows, combo timeout, interruption, movement commitment, weapon-authored steps, stronger finisher, no direct skip. Visual: three-step timing and state graph. Check: order inputs/windows, debug early/late buffers; 90%. Build/Test/Artifact: two weapon data records with distinct chains and slow-motion overlay. Tests: hold, press buffer, timeout, interrupt, finisher, no skip. Done: playable chain and tests. Effort: 8-12 h + 14 h. Milestone: `AD-GATE-01`. Optional: `R-OZZ`.

**AD-CB-06 - Main/sub weapons and 2/2/4/1 loadout semantics**  
Prereq: `AD-CB-05`, `AD-DT-03`. Teach: main weapon defines basics/range/timings/native package; two main slots; two borrowed sub-weapon slots; four class slots; one ultimate; granted versus bound ability; validation; live versus snapshotted weapon stats; swap policy as explicit decision. Visual: weapon package/loadout relationship model. Check: valid/invalid loadouts and inheritance scenarios; 90%. Build/Test/Artifact: generic loadout schema/validator and UI-neutral binding API. Tests: illegal slot, missing requirements, sub swap leaves basic chain unchanged. Done: tests and decision record. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-JSON`.

**AD-CB-07 - Held block, stamina, perfect block, and guard break**  
Prereq: `AD-CB-05`, `AD-AN-03`. Teach: discrete raise cost, hold drain, block arc, perfect window, refund raise cost only, punish opportunity, zero-stamina guard break, no block until full recovery, server timing truth. Visual: defense state machine and stamina timeline. Check: calculate stamina/refunds and resolve timing cases; 100% on refund/order rules. Build/Test/Artifact: duel room with tunable block telemetry. Tests: normal/perfect, empty stamina, no over-refund, arc, recovery. Done: tests and combat-log evidence. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-JOLT`.

**AD-CB-08 - Two independently recharging dodge charges**  
Prereq: `AD-CB-07`, `AD-SM-04`. Teach: per-charge timers, character-facing direction, displacement validation, i-frame window separate from motion, buffering/cancel policy, HUD replication/save implications, server truth/client anticipation. Visual: two charge timelines and dodge state. Check: charge arithmetic and validation scenarios; 100% on independence/facing. Build/Test/Artifact: dodge with two timers and HUD. Tests: consume/refill overlap, wall/ledge, i-frame boundary, render rates. Done: tests and manual feel checklist. Effort: 5-8 h + 10 h. Milestone: `AD-GATE-02`. Optional: `R-GAFFER-TIME`.

**AD-CB-09 - Canonical damage, status, and post-hit pipeline**  
Prereq: `AD-CB-07`, `AD-CB-08`, `AD-FD-05`. Teach: validate -> dodge/immunity -> block -> modifiers -> shields -> health -> post-hit reactions; armor/resistance/penetration/crit/vulnerability; shields; damage/heal; status tags; stacking/refresh/exclusivity/cleanse/CC DR/immunity; deterministic logs. Visual: damage flow and modifier graph. Check: calculate/order complex hits and repair alternate pipelines; 100% order + 85% overall. Build/Test/Artifact: single shared pipeline and trace log. Tests: formula table, status laws, repeatability. Done: full test suite. Effort: 10-14 h + 16 h. Milestone: `AD-GATE-02`. Optional: `R-GTEST`.

**AD-CB-10 - Combat feedback, telegraphs, reactive windows, and failure reasons**  
Prereq: `AD-CB-09`, `AD-RN-04`. Teach: HUD/world target indicators, telegraphs, cooldown/resource/charges, block/dodge/punish windows, hit/immune/out-of-range/LOS/resource/cooldown failure, combat logs, effect priority, no color-only signals. Visual: action-result event fan-out to HUD/VFX/audio/log. Check: map state to feedback and accessibility critique; 90%. Build/Test/Artifact: feedback event facade, combat HUD slice, failure reason catalog. Tests: every rejection produces stable code and accessible cue. Done: audit checklist and tests. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-XAG`, `R-RMLUI`.

`AD-GATE-01` exit: written combat contract and disposable feel probes demonstrate camera/movement/target/lock/basic/block/dodge behavior worth preserving. Durable work then continues into `AD-GATE-02`; prototypes themselves need not survive.

### 6.5 Stage 3 - Skills, hybrid progression, loot, and persistence (source Lesson H plus Addendum)

#### Module AD-RP - Ability architecture and Diablo II-inspired buildcraft

**AD-RP-01 - Generic ability definition and execution pipeline**  
Prereq: `AD-CB-06`, `AD-CB-09`. Teach: stable ability ID, tags, target/facing/range/shape, cost/cooldown, cast timeline, effects, movement, cancel rules, presentation/network hints; definition versus runtime instance; request/precondition/resolve/commit/failure. Visual: ability schema and execution flow. Check: label fields, repair underspecified definitions, trace activation; 90%. Build/Test/Artifact: registry/executor and three schema-complete sample abilities. Tests: validation, cost/cooldown atomicity, cancellation, failure codes. Done: tests and schema docs. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-02`. Optional: `R-JSON`.

**AD-RP-02 - Target, facing, range, shape, payload, and cancel composition**  
Prereq: `AD-RP-01`. Teach: self/ally/hostile/ground/directional/aimed modes; line/cone/sphere/capsule/projectile; LOS/range/angle; cast/channel/toggle/charge; cancel gates; damage/heal/shield/buff/debuff/CC/movement payloads; avoid one-off subclasses. Visual: orthogonal ability axes. Check: compose twelve skill concepts and flag contradictory fields; 90%. Build/Test/Artifact: data-driven melee, projectile, ground heal, ally shield, and movement skill. Tests: each axis and invalid combinations. Done: matrix green. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-02`. Optional: `R-GPP`.

**AD-RP-03 - Class identity, role leaning, resources, and mechanics**  
Prereq: `AD-RP-02`. Teach: class fantasy as rules not cosmetics; tank/healer/DPS/support leaning without rigid party requirement; class resources, generators/spenders, signature states, role clarity, server-owned resource truth, readable UI. Visual: class mechanic loop and party-role overlap. Check: distinguish identity from raw coefficients and critique resource loops; 85%. Build/Test/Artifact: one class mechanic/resource design and executor hooks. Tests: generation/spend caps, reset/death/reconnect behavior. Done: design rubric and tests. Effort: 5-8 h + 10 h. Milestone: `AD-GATE-02`. Optional: `R-GPP`.

**AD-RP-04 - Main weapon packages and borrowed sub-weapon skills**  
Prereq: `AD-RP-03`, `AD-CB-06`. Teach: main basics/native skills/range/timing identity; sub-package selective import; weapon requirements; live versus snapshotted stats; passive applicability; swap cooldown recommendation; UI/tooltips showing provenance. Visual: class + main package + borrowed sub skill evaluator. Check: inheritance and invalidation scenarios; 90%. Build/Test/Artifact: one main and one sub package with two borrowed skills. Tests: swap, requirements, tag/passive effects, basic-chain invariance. Done: package tests and decision record. Effort: 6-9 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-JSON`.

**AD-RP-05 - Tag grammar and rule composition**  
Prereq: `AD-RP-04`, `AD-FD-05`. Teach: namespaces such as `weapon:sword`, `role:tank`, `damage:holy`, `state:blocking`, `delivery:projectile`, `target:ally`, `proc:on-perfect-block`, `resource:stamina`; requirements, grants, queries, conversion, conflict, UI filters; preventing boolean explosion. Visual: tag query and modifier graph. Check: normalize ad hoc rules into tags and detect ambiguous/cyclic compositions; 90%. Build/Test/Artifact: versioned tag registry/query language and validation rules. Tests: unknown tags, contradictions, deterministic matching. Done: tag-spec approval and tests. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-JSON`.

**AD-RP-06 - Class trees, points, prerequisites, ranks, and passives**  
Prereq: `AD-RP-05`. Teach: Diablo II-inspired commitment; tree branches, unlock level, skill points, rank caps, prerequisites, passive nodes, active unlocks, synergy edges, ultimate branches, legal build validation. Visual: directed acyclic prerequisite graph. Check: validate allocations, order transactions, identify traps/cycles; 90%. Build/Test/Artifact: modest 20-30 node tree for the first class and generic allocator. Tests: prerequisite, refund, cap, save round trip. Done: validator green and tree review. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-02`. Optional: `R-D2`.

**AD-RP-07 - Synergies, respec, build-defining interactions, and buildcraft literacy**  
Prereq: `AD-RP-06`. Teach: transparent synergies, tag-based conversions, passive/weapon/class interactions, soft versus hard commitment, respec policy, model-answer build comparison, avoiding mandatory hidden math and irreversible beginner traps. Visual: contribution trace from node/item/weapon to final skill. Check: construct and explain two builds; debug illegal/respec states; 85%. Build/Test/Artifact: respec transaction, derivation/explanation UI data, two example builds. Tests: atomic refund/reapply, no negative points, reconnect. Done: buildcraft assessment and tests. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-D2`.

**AD-RP-08 - Item bases, identity, slots, rarity, and affix grammar**  
Prereq: `AD-RP-05`, `AD-DT-03`. Teach: item definition versus instance, GUID, item/required level, weapon/armor/jewelry bases, common/magic/rare/unique, prefix/suffix pools, families, weights, tiers, exclusivity, tag requirements, tooltip schema. Visual: definition -> seeded roll -> persistent instance. Check: roll legality, schema repair, identity scenarios; 90%. Build/Test/Artifact: item/affix definitions and validator. Tests: bounds, exclusivity, missing family, serialization. Done: test corpus and inspector. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-02`. Optional: `R-JSON`.

**AD-RP-09 - Server-owned loot rolls, personal ownership, and economy boundaries**  
Prereq: `AD-RP-08`, `AD-RP-01`. Teach: loot tables/budgets, deterministic test seeds versus unpredictable production RNG, server creation, personal/instanced visibility, pickup rights, party reward chest, ownership transfers, no client-authored grants, anti-duplication transaction boundaries. Visual: kill -> server roll -> ownership -> pickup -> save. Check: threat-model economy messages and calculate weighted rolls; 100% trust-boundary items. Build/Test/Artifact: authoritative loot generator contract and local server implementation. Tests: two-player separate drops, duplicate request, disconnect, seed distribution. Done: ownership tests. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-02`. Optional: `R-GNS`.

**AD-RP-10 - Inventory, equipment, stash, comparison, and item persistence**  
Prereq: `AD-RP-09`. Teach: inventory transactions, slot validation, equipment-derived stats, sorting/filtering, tooltip comparison, stash scope, item instance lifecycle, save checkpoints, rollback, no ad hoc object serialization. Visual: inventory transaction and derived-stat invalidation. Check: sequence transactions and diagnose duplicate/lost item bugs; 90%. Build/Test/Artifact: inventory/equipment/stash v1 and item save schema. Tests: equip swap, full inventory, repeated request, save/load identity, crash boundary. Done: tests and UI evidence. Effort: 9-13 h + 18 h. Milestone: `AD-GATE-02`. Optional: `R-RMLUI`.

**AD-RP-11 - Progression/loot pacing, uniques, migrations, and economy observability**  
Prereq: `AD-RP-07`, `AD-RP-10`. Teach: XP/level/point cadence, rarity/affix pacing, build-defining uniques, weapon/class interaction, reward loops, telemetry without dark patterns, save version migrations and validation, economy non-goals (no broad crafting initially). Visual: progression loop and migration ladder. Check: pacing table critique, migration design, unique interaction trace; 85%. Build/Test/Artifact: XP/small talent progression, one build-defining unique, save v1->v2 migration, loot-roll inspector. Tests: legal builds across migration, no lost IDs/points. Done: migration and pacing review. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-02`. Optional: `R-STEAMCLOUD`.

### 6.6 Stage 4 - Navigation, AI, and encounters (source Lesson I)

#### Module AD-AI - Recast/Detour and server-owned encounter intelligence

**AD-AI-01 - Navmesh concepts, Recast build, Detour queries, and debug views**  
Prereq: `AD-SM-03`, `AD-DT-05`. Teach: rasterization/voxels, walkability, regions/polygons, agent settings, offline bake, Detour query, path corridor, navmesh as substrate not intelligence. Visual: geometry-to-navmesh pipeline. Check: tune config and diagnose missing/merged regions; 85%. Build/Test/Artifact: navmesh CLI/tool and runtime overlay for graybox. Tests: bake/load, reachable/unreachable, agent sizes. Done: artifact and test map. Effort: 8-12 h + 14 h. Milestone: `AD-GATE-02`. Optional: `R-RECAST`.

**AD-AI-02 - Tiled navmesh, obstacles, crowd/steering, and query budgets**  
Prereq: `AD-AI-01`. Teach: single versus tiled meshes, TileCache/dynamic obstacles, path replans, local avoidance/steering, DetourCrowd tradeoffs, server query budgets and debug telemetry. Visual: hierarchical path plus local steering. Check: select tile/update strategy and triage budget spikes; 85%. Build/Test/Artifact: tiled test space, blocked-door reroute, budget panel. Tests: obstacle add/remove, crowd congestion, bounded replans. Done: tests and profile. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-RECAST`.

**AD-AI-03 - Behavior authoring model and action contracts**  
Prereq: `AD-AI-02`, `AD-RP-01`. Teach: hierarchical state machines, behavior trees/utility scoring tradeoffs, tactical decision versus action execution, reusable conditions/tasks, data authoring, animation/combat action contract, failure/recovery. Visual: perception -> decision -> requested ability -> combat executor. Check: refactor monolithic AI and trace failure status; 85%. Build/Test/Artifact: chosen lightweight behavior model with melee and ranged archetypes. Tests: transition/action failure, no invalid ability bypass. Done: behavior fixtures. Effort: 8-12 h + 14 h. Milestone: `AD-GATE-02`. Optional: `R-BT-SURVEY`, `R-GAIPRO`.

**AD-AI-04 - Perception, threat, taunts, healer threat, and role cooperation**  
Prereq: `AD-AI-03`, `AD-RP-03`. Teach: perception/aggro/leash, threat entries from damage/heal/protection, decay, taunt override/value, scripted boss exceptions, healer targeting, support spacing, server ownership and inspectability. Visual: threat table changes over an encounter. Check: calculate target changes and resolve taunt/script conflicts; 90%. Build/Test/Artifact: threat service and 3-enemy role encounter. Tests: taunt, heal threat, death/leave, boss script override. Done: tests and debug table. Effort: 8-12 h + 14 h. Milestone: `AD-GATE-02`. Optional: `R-GAIPRO`.

**AD-AI-05 - Enemy archetypes, status response, and readable telegraphs**  
Prereq: `AD-AI-04`, `AD-CB-10`. Teach: melee/ranged/support/elite responsibilities, interrupt/stagger/CC immunity and diminishing returns, telegraph startup/shape/impact, punish windows, fair off-screen behavior, failure recovery. Visual: enemy action/telegraph timeline. Check: critique unfair attacks and design state/status responses; 90%. Build/Test/Artifact: third support/elite archetype plus telegraphed attacks. Tests: interrupt windows, CC rules, LOS/obstacle, reduced-effects readability. Done: combat review and tests. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-02`. Optional: `R-XAG`.

**AD-AI-06 - Encounters, boss phases, resets, anti-zerg rules, and pacing**  
Prereq: `AD-AI-05`. Teach: encounter director, spawn budgets/waves, leash/reset/wipe, phase state, target-priority, split pressure, interrupts/positional danger, anti-zerg without HP inflation, replayable reward hook. Visual: encounter and boss phase state machines. Check: scenario design and reset diagnosis; 85%. Build/Test/Artifact: one boss skeleton and combat gauntlet. Tests: phase transition, wipe/reset, add spawn, taunt exception, reward once. Done: scripted completion and tests. Effort: 10-14 h + 18 h. Milestone: `AD-GATE-02`. Optional: `R-GAIPRO`.

**AD-AI-07 - One-to-eight player scaling and encounter performance budgets**  
Prereq: `AD-AI-06`. Teach: mixed health/damage/add/elite/mechanic scaling, healer load, revive tension, threat stability, active thinker/nav/projectile/ground-effect caps, profiles at 1/2/4/6/8, readable priority. Visual: scaling dimensions versus party size. Check: improve health-only curve and choose budget reactions; 90%. Build/Test/Artifact: party-size scaling data and bot/simulation harness. Tests: composition at each size, cap behavior, no reward duplication. Done: scaling worksheet and automated assertions. Effort: 8-12 h + 14 h. Milestone: `AD-GATE-02` then `AD-GATE-04`. Optional: `R-TRACY`.

`AD-GATE-02` exit - local authoritative vertical slice:

- Durable `/client`, `/server`, `/shared`, `/tools`, `/tests`, and `/assets` targets; solo play connects to the localhost dedicated server path.
- One complete class, one main weapon family, one sub-weapon family, 2/2/4/1 slots, full combat state/feedback, data-driven abilities/status/items/affixes, progression v1.
- Three enemy archetypes and one boss in a 10-15 minute replayable run; personal loot, inventory, stash, XP/small tree, save/load/migration.
- Entity/combat/target/hit/AI/threat/loot/network/save inspectors; formula, timing, schema, save, and smoke tests; basic profiling.
- Required evidence: commit hash, architecture diagram, recorded run or screenshots, CI summary, test matrix, known limitations, and learner attestation. Completion is self-verified, not automatic repository inspection.

### 6.7 Stage 5 - Dedicated networking, authority, and persistence (source Lesson J)

#### Module AD-NW - Eight-player client/server architecture

**AD-NW-01 - Client/server/shared separation and authority map**  
Prereq: `AD-GATE-02`. Teach: dedicated session server, localhost solo equivalence, simulation/presentation/transport separation, server ownership of movement resolution/combat/AI/loot/inventory/progression/persistence, client camera/prediction/presentation, shared pure rules. Visual: process/dependency/authority diagrams. Check: place 30 responsibilities and repair forbidden dependencies; 100% authority items. Build/Test/Artifact: executable separation audit and living authority table. Tests: headless server links/runs without bgfx/RmlUi. Done: architecture gate. Effort: 6-9 h + 10 h. Milestone: `AD-GATE-03`. Optional: `R-GAFFER-NET`.

**AD-NW-02 - GameNetworkingSockets, connection lifecycle, and message classes**  
Prereq: `AD-NW-01`. Teach: transport versus replication, authenticated/encrypted transport capability, connect/handshake/disconnect, reliable ordered versus unreliable sequenced, fragmentation, lanes/priorities, message version/header, chat/echo harness. Visual: lifecycle and lane map. Check: choose delivery for each message and diagnose head-of-line misuse; 90%. Build/Test/Artifact: loopback client/server harness and protocol header/spec. Tests: connect/reject/version/disconnect/retry. Done: transport tests. Effort: 8-12 h + 14 h. Milestone: `AD-GATE-03`. Optional: `R-GNS`.

**AD-NW-03 - Fixed-tick input commands and server movement validation**  
Prereq: `AD-NW-02`, `AD-SM-01`. Teach: client sequence/tick, sampled action command, coalescing, acknowledgements, server queue, stale/future/rate/acceleration/state checks, dropped-input tolerance, camera aim as request data not replicated camera. Visual: command from capture through authoritative tick. Check: validate traces and identify impossible commands; 90%. Build/Test/Artifact: movement intent protocol and authoritative server application. Tests: reorder/drop/duplicate/stale/future/CC/dead cases. Done: test harness green. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-03`. Optional: `R-GAFFER-NET`.

**AD-NW-04 - Local prediction, acknowledgements, and reconciliation**  
Prereq: `AD-NW-03`. Teach: store unacknowledged commands, predict with shared rules, snapshot last processed sequence, rewind/correct/replay, error threshold/smoothing, non-predictable contacts, visible error bars. Visual: prediction/reconciliation timeline. Check: step through traces and fix double-apply; 90%. Build/Test/Artifact: predicted owner movement with correction overlay. Tests: 80/150/250 ms, loss/jitter, collision correction, bounded history. Done: profile and tests. Effort: 10-14 h + 18 h. Milestone: `AD-GATE-03`. Optional: `R-GAFFER-NET`.

**AD-NW-05 - Snapshots, quantization, deltas, and remote interpolation**  
Prereq: `AD-NW-04`. Teach: entity net state, server tick/snapshot ID, quantized transforms/velocity/resources/action tags, baselines/deltas, timestamped history, interpolation delay, extrapolation limit, stale/out-of-order rejection. Visual: 20 Hz samples rendered at 60+ FPS. Check: compute interpolation states and packet budget; 90%. Build/Test/Artifact: compact snapshot and four-actor interpolation scene. Tests: reorder/loss/jitter, quantization bounds, missing baseline. Done: visual stability and tests. Effort: 10-14 h + 18 h. Milestone: `AD-GATE-03`. Optional: `R-GAFFER-SNAPSHOT`.

**AD-NW-06 - Relevance, interest management, priorities, and bandwidth budgets**  
Prereq: `AD-NW-05`, `AD-AI-07`. Teach: per-client relevance graph, nearby engaged 20 Hz baseline, distant 5-10 Hz/event-driven, owner/party/boss/loot priority, enter/leave relevance, starvation prevention/priority accumulator, packet budget telemetry. Visual: interest rings plus prioritized send queue. Check: allocate a constrained packet and debug missing critical state; 90%. Build/Test/Artifact: relevance filter, priority scheduler, bandwidth graph. Tests: 8 clients, high entity density, starvation, spawn/despawn. Done: budget report. Effort: 9-13 h + 18 h. Milestone: `AD-GATE-04`. Optional: `R-GAFFER-SNAPSHOT`, `R-GNS`.

**AD-NW-07 - Server-authoritative ability, combat, dodge, and block validation**  
Prereq: `AD-NW-04`, `AD-RP-02`, `AD-CB-09`. Teach: activation request/accept/reject, equipped/unlocked/cooldown/resource/state/target/range/LOS/timing checks, server hit query, i-frame/perfect-block truth, client visual anticipation, result/event replication, lag policy without PvP overengineering. Visual: request -> validate -> resolve -> replicate. Check: attack malicious/desynced traces; 100% trust rules. Build/Test/Artifact: network the full combat slice. Tests: cooldown/resource spoof, duplicate, invalid target, late block/dodge, authoritative damage. Done: integration suite. Effort: 12-18 h + 24 h. Milestone: `AD-GATE-03`. Optional: `R-GNS`.

**AD-NW-08 - Party, lobby, server assignment, authentication, and one-to-eight session flow**  
Prereq: `AD-NW-02`. Teach: Steam lobby as future party/discovery layer not transport; internal session browser first; create/join/ready/character metadata/server assignment/connect/leave; session tickets planning; party leader scope; 1-8 capacity. Visual: lobby-to-dedicated-server sequence. Check: order flow and identify insecure lobby trust; 90%. Build/Test/Artifact: platform-neutral party/session service with local browser and eight-slot roster. Tests: full/duplicate/late ready/leader leave. Done: two-process flow. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-03`. Optional: `R-STEAMLOBBY`, `R-STEAMAUTH`.

**AD-NW-09 - Reconnect, late join, travel, wipe, and failure recovery**  
Prereq: `AD-NW-08`, `AD-NW-05`. Teach: reconnect token/session binding, state resync, command history reset, late-join restrictions, boss lock policy, loading/travel, wipe/reset, server crash boundaries, idempotency. Visual: disconnect/reconnect state machine and resync snapshot. Check: failure scenarios and duplicate suppression; 90%. Build/Test/Artifact: short-drop reconnect and clean wipe/restart. Tests: reconnect during combat/reward/save, stale token, version mismatch. Done: drills and automated tests. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-03`. Optional: `R-GNS`.

**AD-NW-10 - Authoritative persistence, save versions, item integrity, and migrations**  
Prereq: `AD-NW-07`, `AD-RP-11`. Teach: server-owned character snapshot, checkpoint/transaction log tradeoff, stable item IDs, protocol/save/content versions, atomic writes, checksums as corruption detection, migration/rollback, Steam Cloud later, backend unspecified boundary. Visual: authoritative event -> checkpoint -> versioned save -> migration. Check: corruption/rollback/duplication scenarios; 100% economy integrity. Build/Test/Artifact: server save service and two-version migration suite. Tests: crash interval, repeated reward, reconnect, invalid checksum/version, partial write. Done: integrity suite. Effort: 10-14 h + 20 h. Milestone: `AD-GATE-03`. Optional: `R-STEAMCLOUD`.

**AD-NW-11 - PvE anti-cheat trust boundaries, rate limits, and audit logs**  
Prereq: `AD-NW-07`, `AD-NW-10`. Teach: practical threat model; client may drive camera/input/presentation but not results; auth/session identity; sequence/time/sanity/rate checks; server RNG; progression audit events; parser bounds; no invasive kernel anti-cheat default. Visual: trust boundary/data-flow threat model. Check: classify spoof/replay/tamper/DoS cases and choose control; 100% authority items. Build/Test/Artifact: validation policy, rejection metrics, audit record, abuse-rate tests. Tests: malformed/oversize/replay/rate burst. Done: threat-model review. Effort: 7-10 h + 12 h. Milestone: `AD-GATE-03`. Optional: `R-STEAMAUTH`, `R-STEAMAC`.

**AD-NW-12 - Network simulation, parser fuzzing, load, and soak tests**  
Prereq: `AD-NW-06`, `AD-NW-11`. Teach: latency/loss/jitter/reorder profiles, bot clients, 2/4/6/8 progression, replay logs, snapshot/interest assertions, fuzzing untrusted decoders, memory/tick/bandwidth soak metrics, failure triage. Visual: test pyramid and network fault matrix. Check: choose test by failure and interpret traces; 90%. Build/Test/Artifact: automated network harness, packet simulation presets, one parser fuzzer, two-hour soak recipe. Done: two-player profile passes now; 8-player suite ready for Gate 04. Effort: 9-13 h + 18 h. Milestone: `AD-GATE-03` and `AD-GATE-04`. Optional: `R-LIBFUZZ`, `R-GNS`.

`AD-GATE-03` exit - two-player proof: two remote clients repeatedly finish the vertical slice at representative latency/loss; authority, prediction, interpolation, party/revive, reconnect, loot ownership, and persistence behave correctly; no item duplication/progression corruption; traces and known limitations are captured.

### 6.8 Stage 6 - Party UX, production UI, readability, and accessibility (source Lesson K)

#### Module AD-UX - Eight-player player-facing systems

**AD-UX-01 - RmlUi production architecture and UI data facades**  
Prereq: `AD-GATE-03`, `AD-RN-04`. Teach: retained document/style/event model, render/system interfaces, UI state facade, localization keys, resolution/DPI, navigation, separation from ImGui debug UI, no direct ECS mutation from views. Visual: authoritative state -> presentation model -> RmlUi. Check: classify production/debug concerns and repair coupled UI; 85%. Build/Test/Artifact: HUD/menu shell with facade and theme tokens. Tests: resize, missing localization, server target headless. Done: architecture review. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-04`. Optional: `R-RMLUI`.

**AD-UX-02 - Party formation, roster, role clarity, ready state, and social signals**  
Prereq: `AD-UX-01`, `AD-NW-08`. Teach: eight-slot condensed/expanded roster, ready/leader/session state, role-leaning icons without hard enforcement, distance/off-screen state, pings and optional quick chat, spam/cooldown and accessibility. Visual: party UI information hierarchy. Check: prioritize signals and resolve join/leave cases; 90%. Build/Test/Artifact: party/lobby screen, role indicators, ping protocol/UI. Tests: 1-8 layout, leave/rejoin, keyboard/controller. Done: UX test matrix. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-04`. Optional: `R-RMLUI`, `R-STEAMINPUT`.

**AD-UX-03 - Ally frames, death/downed/revive, healer triage, and off-screen awareness**  
Prereq: `AD-UX-02`, `AD-AI-04`. Teach: health/shield/downed/cleanse/major defense/distance/direction; revive interrupt/window/limits; smart-heal fallback and group triage; server-owned revive; avoid UI overload. Visual: ally-frame priority layers and revive state. Check: triage scenarios and inaccessible designs; 90%. Build/Test/Artifact: ally frames and revive flow. Tests: eight players, simultaneous status, loss mid-revive, off-screen. Done: role-play test. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-04`. Optional: `R-XAG`.

**AD-UX-04 - Eight-player effect density, telegraph priority, and combat readability**  
Prereq: `AD-UX-03`, `AD-CB-10`, `AD-AI-07`. Teach: hostile danger priority, reduced allied AoE, “mine/others” intensity, number/hit-spark/shake/camera controls, boss break/taunt/interrupt cues, color/timing channel limits, culling that preserves rules. Visual: render-priority stack in worst-case boss fight. Check: critique frames and allocate VFX budget; 90%. Build/Test/Artifact: effect categories, throttling, reduced-effects preset, worst-case capture. Tests: critical telegraphs visible at cap and under color filters. Done: readability review. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-04`. Optional: `R-XAG`, `R-GAG`.

**AD-UX-05 - Keyboard/mouse/controller parity, remapping, glyphs, and UI navigation**  
Prereq: `AD-UX-01`, `AD-PL-02`. Teach: simultaneous input, action-based prompts, last-active-device without flicker, remapping/conflicts, D-pad/stick/focus navigation, couch readability, sensitivity/deadzone, disconnect. Visual: action-to-glyph and focus graph. Check: device scenarios and focus-order bugs; 100% critical parity items. Build/Test/Artifact: complete navigation/remap/glyph system for slice. Tests: all screens by mouse/keyboard/gamepad, unplug, same-frame devices. Done: device matrix. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-04`. Optional: `R-STEAMINPUT`.

**AD-UX-06 - Accessibility, UI scaling, localization readiness, and configurable feedback**  
Prereq: `AD-UX-04`, `AD-UX-05`. Teach: text/subtitle/UI scale, contrast/color-safe indicators, reduced motion/shake/flashes, VFX opacity, input alternatives, captions, screen-safe areas, string expansion/plurals, no baked text, accessibility as continuous test. Visual: preference-to-presentation dependency map. Check: audit a screen and select remediations; 90%. Build/Test/Artifact: accessibility settings and pseudo-localized slice. Tests: 200% UI/text where supported, long strings, reduced effects/motion, color-only audit. Done: checklist and captures. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-04`. Optional: `R-XAG`, `R-GAG`.

`AD-GATE-04` exit - eight-player stress slice: exercise 2/4/6/8 participants or equivalent bots; complete an encounter under induced loss; preserve server tick headroom, bounded memory/bandwidth/AI/nav/projectile/VFX budgets, critical telegraphs, party/revive clarity, reconnect/late join, and reward/save integrity. Required evidence includes profile traces, packet graphs, readability captures with reduced effects, two-hour soak, faults found/fixed, and residual risk.

### 6.9 Stage 7 - QA, observability, Steam, and Early Access (source Lesson L plus Addendum)

#### Module AD-QA - Production quality engineering

**AD-QA-01 - Layered automated test architecture and CI matrix**  
Prereq: `AD-GATE-03`. Teach: unit/integration/simulation/content/network/smoke/end-to-end distinctions, deterministic micro-scenarios, platform/build matrices, test data, flaky-test policy, release blocking. Visual: test layers mapped to systems and branches. Check: select layer and rewrite brittle tests; 90%. Build/Test/Artifact: documented CI matrix with formula/combat/save/network/content/package suites. Test: intentional failure in each lane. Done: protected green pipeline. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-05`. Optional: `R-GTEST`, `R-CTEST`.

**AD-QA-02 - Sanitizers, static analysis, fuzzing, and concurrency safety**  
Prereq: `AD-QA-01`. Teach: ASan/UBSan/TSan costs and coverage, clang-tidy, parser fuzz targets, seed corpus, minimizing crashes, thread ownership/job boundaries, targeted nightly lanes. Visual: defect class -> tool map. Check: interpret reports and avoid false fixes; 90%. Build/Test/Artifact: sanitizer/nightly jobs and fuzzers for save plus packet/content parsers. Done: clean target duration and fixed seeded defects. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-05`. Optional: `R-ASAN`, `R-TSAN`, `R-LIBFUZZ`.

**AD-QA-03 - Profiling and explicit performance budgets**  
Prereq: `AD-GATE-04`. Teach: measure before optimize, Tracy CPU/memory/locks, RenderDoc GPU frames, server 30 Hz budget/headroom, AI/nav/packet/UI/VFX hot spots, percentile and worst-case scenes, regression budgets. Visual: frame/tick budget waterfall. Check: interpret captures and prioritize fixes; 90%. Build/Test/Artifact: budget sheet and annotated worst combat/boss/inventory traces; fix one measured bottleneck. Done: budgets enforced or documented. Effort: 8-12 h + 16 h. Milestone: `AD-GATE-05`. Optional: `R-TRACY`, `R-RENDERDOC`.

**AD-QA-04 - Logging, crash capture, metrics, traces, and privacy**  
Prereq: `AD-QA-03`, `AD-NW-11`. Teach: structured correlation IDs/ticks/actions, redaction, Crashpad/Sentry Native choice, symbol upload, OpenTelemetry metrics/traces/logs, consent/minimization, crash-to-repro workflow, no hot-path blocking. Visual: client/server event to crash/trace triage. Check: design useful non-sensitive event schema and triage sample failure; 90%. Build/Test/Artifact: crash hook, symbol/runbook, minimal telemetry schema with opt-out. Tests: intentional crash report and redaction. Done: triage rehearsal. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-05`. Optional: `R-CRASHPAD`, `R-OTEL`.

**AD-QA-05 - Long-session soak, patch-forward compatibility, and release candidate rehearsal**  
Prereq: `AD-QA-02`, `AD-QA-04`. Teach: 2-4 hour and overnight profiles, memory creep, repeated travel/reward/save, server restart/reconnect, old save/new build, rollback limits, defect severity, go/no-go. Visual: release candidate qualification flow. Check: evaluate evidence and call no-go when warranted; 90%. Build/Test/Artifact: soak automation/runbook and compatibility matrix across several internal save versions. Done: candidate report with zero blocker corruption/crashes. Effort: 7-10 h + 16 h. Milestone: `AD-GATE-05`. Optional: `R-STEAMEA`.

#### Module AD-SH - Steam platform and live operations

**AD-SH-01 - Steamworks boundary, Spacewar study, authentication, lobbies, and servers**  
Prereq: `AD-GATE-04`, `AD-NW-08`. Teach: partner/SDK boundary, Spacewar as example, platform abstraction, session tickets, lobby metadata, dedicated server registration/SDR plan, offline/local fallback, licensing/access caveat. Visual: Steam services around platform-neutral runtime. Check: map responsibility and avoid coupling Steam to simulation; 90%. Build/Test/Artifact: integration plan and adapter interfaces; optional development integration when partner access exists. Done: architecture review; lack of partner access does not block conceptual lesson. Effort: 6-9 h + 8-16 h. Milestone: `AD-GATE-05`. Optional: `R-SPACEWAR`, `R-STEAMSERVER`.

**AD-SH-02 - SteamPipe, depots, client/server packages, branches, and build promotion**  
Prereq: `AD-SH-01`, `AD-QA-01`. Teach: App ID/depot/build scripts, client versus dedicated server output, separate Tool App ID planning, SteamCMD, private/password branches, immutable artifact promotion, version compatibility. Visual: commit -> CI artifact -> depot -> branch -> default. Check: repair unsafe upload/promotion flow; 90%. Build/Test/Artifact: upload scripts/templates, depot map, branch policy, packaged headless server. Tests: install/boot from staged package. Done: private rehearsal or documented dry run. Effort: 7-10 h + 14 h. Milestone: `AD-GATE-05`. Optional: `R-STEAMUPLOAD`, `R-STEAMSERVER`.

**AD-SH-03 - Steam Cloud, save conflicts, achievements, and stats**  
Prereq: `AD-SH-02`, `AD-NW-10`. Teach: Cloud API versus Auto-Cloud, user-unique paths, machine settings exclusion, multiple slots/migrations/conflict UI, server-owned progression boundary, stats/achievement definitions and unlock authority. Visual: local/server/cloud ownership and conflict flow. Check: choose merge/replace for scenarios and prevent achievement spoof effects; 90%. Build/Test/Artifact: Cloud strategy, conflict prototype, small achievement/stat set. Tests: offline conflict, old save, account/device change. Done: policy and smoke tests. Effort: 6-9 h + 12 h. Milestone: `AD-GATE-05`. Optional: `R-STEAMCLOUD`, `R-STEAMSTATS`.

**AD-SH-04 - Store page, graphical assets, Coming Soon, and honest Early Access scope**  
Prereq: `AD-SH-02`. Teach: current-state truth, no guaranteed future promises, playable-not-tech-demo requirement, Coming Soon timing, asset/screenshot/trailer integrity, EA questionnaire, known issues, save risks and price/scope boundaries. Visual: readiness evidence -> store claim trace. Check: critique misleading copy and map claims to playable evidence; 100% honesty items. Build/Test/Artifact: store-page draft, asset checklist, current/experimental/not-promised matrix, EA FAQ. Done: every claim evidenced. Effort: 6-9 h + 12 h. Milestone: `AD-GATE-05`. Optional: `R-STEAMEA`, `R-STEAMSTORE`.

**AD-SH-05 - Patch, support, crash triage, save compatibility, and communication workflow**  
Prereq: `AD-SH-03`, `AD-QA-04`. Teach: intake/severity/repro/fix/verify/promote, known issues, patch notes, support data minimization, moderation surface, emergency rollback, server/client protocol compatibility, save-break communication. Visual: incident-to-patch swimlane. Check: prioritize incidents and write accurate communication; 90%. Build/Test/Artifact: support runbook, templates, compatibility policy, escalation tree. Test: mock corrupt-save and server-crash incidents. Done: tabletop rehearsal. Effort: 5-8 h + 8 h. Milestone: `AD-GATE-05`. Optional: `R-STEAMEA`.

**AD-SH-06 - Final Early Access gate and sustainable next-content plan**  
Prereq: `AD-QA-05`, `AD-SH-04`, `AD-SH-05`. Teach: go/no-go synthesis, replayability now, dedicated server operations, accessibility/controller checks, 2/4/6/8 evidence, support capacity, honest uncertainty, data-first extension, rejection of engine scope creep. Visual: gate dependency and evidence dashboard. Check: evaluate a flawed candidate and justify no-go/go; 100% blockers. Build/Test/Artifact: final release dossier, rehearsal, first patch plan, post-launch risk register. Done: all Gate 05 criteria evidenced; no waiver for corruption, unplayability, deceptive store claims, or missing operations. Effort: 6-10 h + 12 h. Milestone: `AD-GATE-05`. Optional: `R-STEAMEA`.

`AD-GATE-05` exit - Steam Early Access readiness:

- The game is a replayable, stable game now, not a tech demo or funding promise.
- Dedicated server build/deployment/versioning, Steam depot/branch rehearsal, Cloud/save conflict plan, stats/achievements smoke, auth/lobby/server join plan, crash/log/support workflow, and patch process exist.
- Controller/remapping/accessibility settings work; 2/4/6/8 stress, worst-case combat/boss/UI profiles, long soak, sanitizer/test/package pipelines, reconnect and save migration are green.
- The store page accurately describes current content, limits, experimental systems, save risks, and uncertainty; Coming Soon/review timing is planned from current Steam rules.

### 6.10 Cross-lesson assessments and source milestone mapping

| Assessment | Required lessons | In-app evaluation | Project gate |
|---|---|---|---|
| Foundation architecture review | `AD-OR-*`, `AD-FD-*` | dependency map, ownership scenarios, CI diagnostic | Gate 00 |
| Feel contract review | `AD-SM-*`, `AD-AN-*`, `AD-CB-01..05` | vector/timing/state simulator and design defense | Gate 01 |
| Local vertical slice review | `AD-CB-*`, `AD-RP-*`, `AD-AI-*`, `AD-NW-01` | combat trace, schema validation, boss/loot/save scenarios | Gate 02 |
| Two-player authority review | `AD-NW-01..05`, `07..12` | simulated packet traces, validation attacks, reconnect order | Gate 03 |
| Eight-player systems review | `AD-NW-06`, `AD-AI-07`, `AD-UX-*`, `AD-QA-03` | interest-budget simulator, readability critique, role scenarios | Gate 04 |
| Early Access readiness board | `AD-QA-*`, `AD-SH-*` | candidate evidence evaluation and honest-copy audit | Gate 05 |

The original broad lessons map without omission: A -> `AD-FD-06..08`; B -> `AD-FD-01..05`; C -> `AD-PL-*`; D -> `AD-RN-*`; E -> `AD-DT-*`; F -> `AD-SM-*` and `AD-CB-01`; G -> `AD-AN-*`; H -> `AD-CB-*` and `AD-RP-*`; I -> `AD-AI-*`; J -> `AD-NW-*`; K -> `AD-UX-*` plus `AD-QA-03`; L -> `AD-QA-*` and `AD-SH-*`.

### 6.11 Explicit open game-design decisions

ActionDev teaches how to decide and records the learner’s decision; it does not invent these source-unspecified commitments:

- exact team size, weekly capacity, non-PC targets, art direction, budget, and outsourcing;
- keyboard-first versus controller-first tuning priority while both remain supported;
- exact launch class/weapon/dungeon/act counts (recommendation: at least two contrasting classes and two main-weapon families before a paid release; Gate 02 remains one complete class);
- friends-only, server browser, or automated matchmaking policy;
- dedicated hosting vendor/cost model and long-term persistence service;
- exact lock-range grace, join-in-progress/boss-lock, revive limits, difficulty ownership, respec price, swap cooldown, root-motion-per-move, and anti-cheat aggressiveness;
- procedural maps, mods, seasons, monetization, crafting breadth, or MMO-persistent worlds;
- final audio workflow beyond the free miniaudio baseline.

### 6.12 Optional free resource registry

These resources are enrichment only. Content authors add a one-sentence “why optional” note and verify availability/license at curriculum release. Paid books cited by source documents may be discussed in the bibliography but are not linked as learner requirements.

| Key | Free resource |
|---|---|
| `R-CPPREF` / `R-CORE` | [cppreference](https://en.cppreference.com/) / [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines) |
| `R-CMAKE` / `R-CTEST` | [CMake Tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/) / [CTest](https://cmake.org/cmake/help/latest/manual/ctest.1.html) |
| `R-VCPKG` | [vcpkg CMake integration](https://learn.microsoft.com/en-us/vcpkg/users/buildsystems/cmake-integration) |
| `R-PROGIT` / `R-GHLFS` | [Pro Git](https://git-scm.com/book/en/v2) / [Git LFS](https://git-lfs.com/) |
| `R-ASAN` / `R-TSAN` / `R-LIBFUZZ` | [AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html), [ThreadSanitizer](https://clang.llvm.org/docs/ThreadSanitizer.html), [libFuzzer](https://llvm.org/docs/LibFuzzer.html) |
| `R-GTEST` | [GoogleTest guide](https://google.github.io/googletest/) |
| `R-GPP` / `R-DOD` | [Game Programming Patterns](https://gameprogrammingpatterns.com/) / [Data-Oriented Design](https://www.dataorienteddesign.com/dodbook/) |
| `R-SDL` / `R-MINIAUDIO` | [SDL3 Wiki](https://wiki.libsdl.org/SDL3/) / [miniaudio manual](https://miniaud.io/docs/manual/) |
| `R-BGFX` / `R-RENDERDOC` / `R-TRACY` | [bgfx](https://bkaradzic.github.io/bgfx/), [RenderDoc](https://renderdoc.org/), [Tracy](https://github.com/wolfpld/tracy) |
| `R-GLTF` / `R-BLENDER` | [glTF 2.0 specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) / [Blender glTF exporter manual](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) |
| `R-ENTT` / `R-JSON` | [EnTT](https://github.com/skypjack/entt) / [JSON for Modern C++](https://github.com/nlohmann/json) |
| `R-JOLT` / `R-OZZ` / `R-RECAST` | [Jolt Physics](https://jrouwe.github.io/JoltPhysics/), [ozz-animation](https://guillaumeblanc.github.io/ozz-animation/documentation/), [Recast Navigation](https://recastnav.com/) |
| `R-IMGUI` / `R-RMLUI` | [Dear ImGui](https://github.com/ocornut/imgui/wiki/Getting-Started) / [RmlUi manual](https://mikke89.github.io/RmlUiDoc/pages/cpp_manual.html) |
| `R-GAFFER-TIME` / `R-GAFFER-NET` / `R-GAFFER-SNAPSHOT` | [Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/), [Networked Physics](https://gafferongames.com/categories/networked-physics/), [Snapshot Interpolation](https://gafferongames.com/post/snapshot_interpolation/) |
| `R-GNS` | [GameNetworkingSockets](https://github.com/ValveSoftware/GameNetworkingSockets) |
| `R-BT-SURVEY` / `R-GAIPRO` | [Behavior Tree survey](https://arxiv.org/abs/2005.05842) / [Game AI Pro free books](https://www.gameaipro.com/) |
| `R-XAG` / `R-GAG` | [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines) / [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/) |
| `R-CRASHPAD` / `R-OTEL` | [Crashpad](https://chromium.googlesource.com/crashpad/crashpad/) / [OpenTelemetry C++](https://opentelemetry.io/docs/languages/cpp/) |
| `R-D2` | In-app historical/design summary; optional reference only to openly accessible official game manuals or public patch documentation after license/link review. |
| `R-STEAMINPUT`, `R-STEAMLOBBY`, `R-STEAMAUTH`, `R-STEAMAC` | Official Steamworks docs for [Input](https://partner.steamgames.com/doc/features/steam_controller), [lobbies](https://partner.steamgames.com/doc/features/multiplayer/matchmaking), [auth](https://partner.steamgames.com/doc/features/auth), and [anti-cheat](https://partner.steamgames.com/doc/features/anticheat) |
| `R-SPACEWAR`, `R-STEAMSERVER`, `R-STEAMUPLOAD` | Official [Spacewar](https://partner.steamgames.com/doc/sdk/api/example), [game server](https://partner.steamgames.com/doc/features/multiplayer/game_servers), and [upload](https://partner.steamgames.com/doc/sdk/uploading) docs |
| `R-STEAMCLOUD`, `R-STEAMSTATS` | Official [Steam Cloud](https://partner.steamgames.com/doc/features/cloud) and [Stats/Achievements](https://partner.steamgames.com/doc/features/achievements) docs |
| `R-STEAMEA`, `R-STEAMSTORE` | Official [Early Access](https://partner.steamgames.com/doc/store/earlyaccess) and [store presence](https://partner.steamgames.com/doc/store) docs |

## 7. Assessment and Exercise Specification

### 7.1 Exercise taxonomy and schemas

All exercises implement a discriminated `ExerciseDefinition` union. Shared fields are `id` (authored UUID), `slug`, `version`, `lessonVersionId`, `mode` (`practice|gating`), `type`, prompt blocks, objectives, points, pass threshold, attempt policy, hints, feedback codes, accessibility label, evaluator version, and optional simulation fixture. Gating definitions mirror metadata into Supabase; private answer material is not exposed through public tables.

| Type | Answer schema | Evaluation and feedback |
|---|---|---|
| Multiple choice | one option ID | Exact choice; each option maps to a misconception-specific feedback code. |
| Multi-select | set of option IDs | Exact set for safety/authority rules; optional partial credit elsewhere using correct-minus-incorrect with a floor of zero. |
| Matching | ordered pairs of stable IDs | Per-pair feedback; keyboard alternative uses two selects and an explicit pair action. |
| Ordering | ordered stable IDs | Exact or constrained partial order; explain first violated dependency. |
| Code completion | text plus normalized token/AST facts | Phase 1 normalizes whitespace/tokens and checks required/forbidden constructs; never claims compilation. |
| Code reading | choices, trace rows, or short value sequence | Deterministic expected state at checkpoints with per-step explanation. |
| Bug finding/patching | selected spans plus patch text | Required bug categories, token/static checks, and rubric; show why a plausible patch remains wrong. |
| Scenario decision | option plus rationale IDs | Weighted rule outcomes; feedback traces the relevant contract. |
| Diagram labeling | node-to-label mapping | Same matching evaluator; accessible linearized alternative is mandatory. |
| Test-case selection/design | selected cases or structured Given/When/Then rows | Coverage rubric for boundaries, invalid state, authority, and observability. |
| Short answer/reflection | text plus learner checklist | Self-review against a model-answer rubric; not used alone for an important gate. |
| Architecture tradeoff | choice, constraints, consequences | Rubric checks recognized constraints/tradeoffs, not a single stylistic answer. |
| State/data-flow trace | sequence of typed events/state snapshots | Deterministic simulator compares transition/rejection reason and explains divergence. |

Example schema shape (illustrative, not application source code):

```ts
type OrderingExercise = CommonExercise & {
  type: "ordering";
  items: { id: string; content: ContentBlock[] }[];
  evaluator: { kind: "exact" | "partial-order"; constraintIds: string[] };
};
```

### 7.2 Scoring and completion

- Practice exercises default to unlimited attempts, record latest and best result, and do not lock progress.
- Gating assessments default to 80% overall plus all `critical: true` items. Combat-law, security, economy, and source-truth questions use critical flags.
- Multi-part scores use explicit integer points; no hidden adaptive weighting. Rounding occurs only at display time.
- Attempt rows are immutable. A retry inserts another row; a lesson references the qualifying attempt.
- A solution reveal, where allowed, marks the attempt `solution_viewed`; the learner must complete a fresh variant or reflection before the exercise can qualify for a gate.
- Question pools may vary order and parameter values, but every variant is reviewed for equivalent objectives/difficulty. Random seeds are stored with attempts.
- Time is never part of a score except an explicitly educational simulation clock. No daily lives, streak penalties, or paid unlocks.

### 7.3 Feedback model

Evaluators return `{score, maxScore, passed, feedbackCodes[], trace?, evaluatorVersion}`. Public feedback content maps codes to a concise result, mental model, in-app section anchor, optional hint ladder, and worked-example link. Feedback avoids revealing all answer keys on first failure. After the policy threshold, the learner may view the model reasoning; the app records this transparently.

Incorrect code responses must be described accurately: “static check did not find a bounds check” rather than “your C++ will crash.” Browser simulations are labeled models, not the learner’s native runtime.

### 7.4 Evaluation trust levels

1. **Local practice:** deterministic evaluator shipped with static content. Fast/offline-capable; not an integrity boundary.
2. **Server-verified structured gate:** `submit_exercise_attempt` Postgres RPC evaluates IDs/order/structured traces against non-public answer data and records the immutable result. This prevents direct completion writes but does not pretend to be exam-grade proctoring.
3. **Edge-verified advanced gate:** optional Supabase Edge Function for bounded AST/schema/simulation evaluation requiring private fixtures. The function authenticates the JWT, limits payload size/time, returns feedback codes, and writes through a database function. It is introduced only when SQL evaluation is insufficient.
4. **Self-verified project artifact:** learner attestation plus evidence. The app states that it has not inspected the repository.

Because all local client code can be modified by its owner, important unlocks use database RPCs that verify prerequisites and qualifying server-recorded attempts. This protects accidental or casual bypass and cross-user access. It cannot guarantee academic honesty against a learner who controls their own browser, nor is such surveillance appropriate for this self-guided product.

### 7.5 Phased implementation

**Phase 1 - local deterministic engine:** multiple choice, multi-select, matching, ordering, scenario, diagram labeling with linear alternative, test selection, checklist short answer, tradeoff, tokenized code completion, and typed data/state traces. Use pure TypeScript evaluators in Web Workers where work may exceed one frame. This delivers most pedagogical value without a native compiler.

**Phase 2 - browser workspaces:** lazy-load CodeMirror 6; add Tree-sitter WASM or a smaller grammar only when a lesson needs syntax structure; implement C++-like pseudocode validators, API-contract/schema checks, diff tasks, and file-shaped workspaces. Do not claim full C++ conformance. A WebAssembly C++ compiler is not required and should not block the full curriculum.

**Phase 3 - advanced simulators:** fixed-step trace viewer, combat state machine, targeting candidates, damage pipeline, loot roll visualizer, skill tree/buildcraft sandbox, snapshot interpolation/reconciliation lab, interest-budget lab, save-migration/schema validator. These are project-owned TypeScript simulations with versioned fixtures and golden tests.

**Optional compiled sandbox:** investigate only after usage proves value. A browser Clang/WASM payload is large, difficult to secure, slow on mobile, and may require worker/CSP/cross-origin constraints awkward on GitHub Pages. Restrict it to small isolated programs, run in a Worker with time/memory/output limits, lazy-load it, and retain static exercises as the accessible fallback. Never execute arbitrary native code or add a paid remote compile service as a required dependency.

### 7.6 Persistence and accessibility

Partial code/text drafts use IndexedDB keyed by user, exercise, and version; optional `exercise_drafts` cloud rows sync debounced text under a size limit. Attempts store answers only when pedagogically needed; sensitive repository code is discouraged. Objective answers may be stored as stable option IDs; free text can be excluded from analytics.

All drag interactions have click/keyboard alternatives. Ordering and matching expose list position and move/pair controls. Diagrams have linear descriptions. Editors expose plain-text textarea fallback, focusable instructions, configurable tab behavior/font size, no color-only diagnostics, and non-live verbose console regions. Feedback uses `aria-live="polite"` for summary only and moves focus to a heading on explicit submission.

## 8. Content Authoring and Versioning System

### 8.1 Repository structure

```text
content/
  course.yml
  stages/<stage>/stage.yml
  modules/<module>/module.yml
  lessons/<module>/<lesson-slug>/
    lesson.mdx
    lesson.yml
    exercises/*.yml
    diagrams/*.mmd
    fixtures/*.{json,txt,cpp}
  references/{glossary,contracts,schemas,checklists}/
  resources/resources.yml
  source-trace/requirements.yml
src/
  content-components/
  exercise-engine/
  simulators/
  generated/            # ignored; built by scripts
scripts/content/
  validate.ts
  build-manifest.ts
  build-search-index.ts
  build-supabase-seed.ts
supabase/
  migrations/
  seed.sql
```

Lesson prose lives in MDX because trusted maintainers need diagrams, code, checks, and simulators inline. Metadata and exercise definitions remain YAML/JSON validated by Zod, making them inspectable without executing MDX. MDX imports are restricted to an allowlist of content components; arbitrary network requests, scripts, and runtime HTML are rejected by lint rules.

### 8.2 Lesson schema

Required metadata: authored UUID, slug, title, stage UUID, module UUID, sequence, source A-L mapping, source trace, version UUID and semantic version, change class, prerequisites, estimated study/project minutes, objectives, concepts, glossary IDs, section anchors, diagram IDs/text alternatives, code example IDs, exercise IDs and required set, optional resource IDs, project handoff, acceptance criteria, required manual/automated tests, artifact checklist, milestone association, completion rule, review status, author, reviewers, and last reviewed date.

`projectHandoff` requires:

```yaml
projectHandoff:
  required: true
  summary: "..."
  expectedPaths: ["shared/combat/...", "tests/combat/..."]
  steps: ["..."]
  acceptanceCriteria: ["..."]
  manualTests: ["..."]
  automatedTests: ["..."]
  evidence: [commit_hash, checklist, test_summary, reflection]
```

Paths are examples/contracts, not assumptions that ActionDev can access the repository. Content authors may mark a path pattern as adaptable.

### 8.3 Validation and build

The content pipeline runs before unit tests and deployment:

1. Parse frontmatter/YAML with source locations.
2. Validate schemas and stable authored UUIDs.
3. Validate unique slugs/anchors/IDs, prerequisite existence and acyclicity, sequence, required exercise types, gate coverage, glossary links, resource flags, diagram text alternatives, project handoff fields, and source trace.
4. Reject mandatory external-resource language and external resources not marked optional/free/reviewed.
5. Compile MDX with an allowlist; syntax-highlight code at build time where possible.
6. Emit course/route/prerequisite manifests, search index, exercise bundles split per route, source-trace report, and Supabase public-metadata seed SQL.
7. Run link checking for internal anchors on every change; external links on a scheduled/manual job so flaky sites do not block every commit without evidence.
8. Compare generated files for deterministic output and course-version consistency.

CI preview builds every changed lesson and publishes a Pages artifact only from trusted branches. Pull requests show schema errors and a curriculum coverage diff: added/removed required lessons, changed completion rules, source requirements affected, and learner-impact classification.

### 8.4 Authoring and review workflow

Content moves `draft -> technical_review -> instructional_review -> accessibility_review -> published`. A lesson cannot publish without one technical reviewer, one instructional/content reviewer, and an accessibility checklist; one person may fill multiple roles for a solo project but must perform separate passes. Review fixtures include desktop/mobile, keyboard-only, screen-reader headings, reduced motion, text zoom, code overflow, and server/local evaluator parity.

The authoring preview supports a fixture learner and local Supabase. A `content-dev` route displays source trace, unresolved glossary terms, exercise feedback paths, and all variants. Production does not expose private answer material.

### 8.5 Versioning and learner impact

- Stable lesson UUID never changes for the same learning contract. Each publication creates a `lesson_versions` UUID and semantic version.
- **Patch**: typo, clarity, link, visual/accessibility fix; completion remains valid with no prompt.
- **Minor**: additive explanation/example/optional practice; completion remains valid; dashboard may show “updated.”
- **Major**: objectives, required assessment, project acceptance, authoritative rule, or prerequisite changes. Existing completion remains historically recorded against the old version. The learner receives a transparent review task; only future gates that genuinely depend on the new objective may require review.
- A new required lesson is shown as new work and never silently changes a completion percentage without a release note and denominator explanation.
- Course versions pin an ordered set of lesson-version IDs. Learners retain `enrolled_course_version_id`; they may migrate to a newer course version with a computed impact preview. Urgent correctness/security errata can mark a lesson `review_required` without deleting completion.
- Removed lessons remain addressable in progress history but disappear from the active path; their outcomes map to successors through `supersedes` metadata.

## 9. Frontend Technical Architecture

### 9.1 Framework and package decisions

| Concern | Decision | Rationale |
|---|---|---|
| UI/build | React + TypeScript + Vite | Static output, mature ecosystem, typed content/exercises, route-level splitting. |
| Routing | React Router `HashRouter` | Hash is not sent to GitHub Pages, eliminating SPA rewrite/404 dependency. |
| Styling | Tailwind CSS plus CSS custom-property design tokens and project-owned components | Fast consistent implementation while preserving a distinct non-template visual system. |
| Accessible primitives | Radix primitives selectively for dialog/menu/tabs/tooltip; no full themed kit | Reduces interaction bugs without imposing visual sameness. |
| Server state | TanStack Query | Cache, retries, invalidation, optimistic updates, online/focus behavior. |
| Ephemeral UI | React state/context; Zustand for cross-route command palette/sync UI only | Avoid a large global store and keep server data in Query. |
| Content | MDX + YAML/JSON + Zod build validation | Versionable deep lessons and structured interactive blocks. |
| Editor | CodeMirror 6, lazy-loaded | Accessible and smaller/more modular than a full IDE surface. |
| Local durable cache | IndexedDB through a small adapter (Dexie optional) | Queue/drafts can exceed safe `localStorage`; still non-authoritative. |
| Diagrams | Mermaid pre-rendered to SVG at build time where possible; interactive simulators in React | Sharp, accessible diagrams without runtime cost on every lesson. |
| Tests | Vitest, Testing Library, axe-core, Playwright | Unit/component/accessibility/end-to-end coverage. |

Pin exact package versions in the lockfile, use Renovate/Dependabot in grouped reviewed updates, and do not encode version numbers into the curriculum unless a behavior truly depends on them.

### 9.2 Layering and component boundaries

```text
app shell / route registry / auth gate
  -> feature routes (dashboard, path, lesson, exercise, milestone, reference, settings)
    -> domain services (content, progress, assessment, milestone, notes, sync)
      -> repositories (static content, Supabase, IndexedDB queue)
        -> generated manifests and Supabase client
```

UI components receive view models and commands; they do not call Supabase directly. `ProgressRepository`, `AttemptRepository`, and `MilestoneRepository` expose the same contract in local-demo and authenticated modes. The sync coordinator owns retries/idempotency. Content components never import user-data repositories.

Core component groups:

- shell: global nav, mobile drawer, command palette, sync indicator, breadcrumbs;
- content: lesson header, TOC, prose/code/diff/diagram/callout/definition/optional resource/project handoff;
- exercises: renderer by discriminant, feedback, attempts, hint ladder, editor/console;
- curriculum: map/list/node/dependency details/gate;
- milestone: criteria, evidence editor, status timeline;
- progress/account: charts without color-only encoding, export/reset/delete/recovery;
- system: error boundary, offline banner, toast, dialog, skeleton, empty/error states.

### 9.3 Rendering, loading, and performance budgets

The app is a client-rendered static SPA; lessons are route-level dynamic imports generated at build time. Do not load the whole course into React. Load a small manifest/search metadata initially; load the active MDX, editor, diagram renderer, or simulator on demand. Preload the next required lesson after idle only on suitable connections.

Initial targets (validate on representative low/mid mobile and laptop hardware): shell JS under 200 KB compressed excluding React/vendor split; route chunk under 150 KB typical; no editor/simulator in initial chunk; LCP under 2.5 s on a warm CDN/typical 4G target; interaction under 200 ms; CLS under 0.1; search index compressed and loaded after first interaction/idle. Treat these as budgets subject to measured adjustment, not fabricated guarantees.

### 9.4 Error and offline behavior

Route error boundaries distinguish content build defects (should never deploy), auth expiry, authorization denial, network outage, evaluator failure, and unknown errors. A failed optimistic mutation rolls back or marks pending; it never changes a completed gate locally without server confirmation. The service worker, if added after the core release, caches hashed static assets/content only and uses network-first for Supabase; never cache auth responses or treat cached progress as authoritative.

### 9.5 Accessibility engineering

Use semantic landmarks, one `h1`, logical headings from MDX lint, skip links, focus restoration on route/dialog close, `inert` for collapsed/off-canvas content, complete names/descriptions/errors, and user-controlled motion. Automated axe checks run on route fixtures and Playwright flows; manual keyboard, VoiceOver/NVDA or equivalent, zoom, high contrast, reduced motion, and touch tests are mandatory. Code, diagrams, and dense tables have text/linear alternatives.

### 9.6 GitHub Pages deployment

Set `base: process.env.GITHUB_ACTIONS ? '/<repo>/' : '/'` (or an explicit `VITE_BASE_PATH`) for a project site. Build with `pnpm install --frozen-lockfile`, typecheck, content validate, test, and `vite build`; upload `dist` with `actions/upload-pages-artifact`; deploy with `actions/deploy-pages` using `pages: write` and `id-token: write`. Configure Settings -> Pages -> Source: GitHub Actions. Use a `github-pages` environment restricted to the default branch. The workflow does not need a service-role key.

For a custom domain or `<owner>.github.io` root site, use `/` and update Supabase Site URL/redirect allowlist before switching. Verify direct loading of the root and every hash route, asset paths, auth callback, refresh, back/forward, and a repository rename.

## 10. Supabase Architecture and Full Setup Guide

### 10.1 Responsibility split

Static content is authored in Git and shipped with the Pages artifact. Supabase stores published course metadata needed for secure prerequisite checks plus all authenticated learner state. It does not become the primary lesson CMS. Course metadata is inserted only by reviewed migrations generated from the same content manifest; clients receive read-only published rows.

Supabase components:

- Auth: verified email/password initially; magic link optional; PKCE browser flow; password recovery.
- Postgres: course/version metadata, normalized progress, immutable attempts/events, milestones/evidence, notes/bookmarks/preferences.
- RLS: public published course reads; `auth.uid()` ownership on learner state.
- Database RPCs: exercise submission, lesson completion, milestone transitions, reset/export helpers where needed.
- Edge Functions: account deletion and only advanced evaluators that require private compute; not a general app server.
- Storage (optional): private, size-limited milestone screenshots. URLs/text evidence remain the default.

### 10.2 Project and local-development setup

1. Create a Supabase Free project in the closest appropriate region. Generate a strong database password and store it in a password manager, not the repository.
2. Record Project URL and the current **publishable key**. A legacy `anon` key is also browser-safe when RLS is correct, but prefer the newer publishable key. Never copy a secret key, `service_role`, JWT secret, database password, or management access token into frontend configuration. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).
3. Install Node 20+ and Docker. Add the Supabase CLI as a pinned dev dependency: `pnpm add -D supabase`; run `pnpm supabase init`, `pnpm supabase start`, and `pnpm supabase status`.
4. Store schema changes in migrations; use `pnpm supabase db reset` to prove a clean database plus seed. Use `pnpm supabase gen types typescript --local > src/lib/supabase/database.types.ts` in a formatting script rather than hand-editing generated types.
5. Create the hosted project only after local migrations are green; run `pnpm supabase login`, `pnpm supabase link --project-ref <ref>`, review any `db pull`, then `pnpm supabase db push`. Official workflow: [local development with migrations](https://supabase.com/docs/guides/cli/local-development).
6. Keep production mutation deliberate. A protected/manual database workflow may use `SUPABASE_ACCESS_TOKEN`, project ref, and database password as GitHub Actions secrets. The Pages build/deploy workflow does not receive them.

Migration order:

```text
supabase/migrations/
  0001_extensions_and_types.sql
  0002_public_course_schema.sql
  0003_user_state_schema.sql
  0004_indexes_constraints_triggers.sql
  0005_rls_grants.sql
  0006_progress_and_assessment_functions.sql
  0007_storage_policies_optional.sql
  0008_seed_course_<course-version>.sql
supabase/seed.sql                 # local fixture users are created by test setup, not production
supabase/tests/rls/*.sql          # pgTAP or SQL role/JWT fixtures
```

### 10.3 Normalized schema

The following is the canonical schema specification. Production migrations may split statements, but may not weaken constraints/RLS.

```sql
create extension if not exists pgcrypto;

create type public.course_status as enum ('draft','published','retired');
create type public.progress_status as enum
  ('not_started','in_progress','awaiting_project_evidence','completed','review_required');
create type public.milestone_status as enum
  ('locked','available','in_progress','ready_for_review','completed_self_verified');

create table public.course_versions (
  id uuid primary key,
  version text not null unique,
  status public.course_status not null default 'draft',
  title text not null,
  manifest_sha256 text not null check (manifest_sha256 ~ '^[0-9a-f]{64}$'),
  release_notes text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null)
      or (status = 'draft' and published_at is null)
      or status = 'retired')
);

create table public.course_modules (
  id uuid primary key,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  slug text not null,
  title text not null,
  stage_slug text not null,
  position integer not null check (position >= 0),
  is_required boolean not null default true,
  source_lesson_codes text[] not null default '{}',
  unique (course_version_id, slug),
  unique (course_version_id, position)
);

create table public.lessons (
  id uuid primary key,
  slug text not null unique,
  canonical_title text not null,
  created_at timestamptz not null default now()
);

create table public.lesson_versions (
  id uuid primary key,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete restrict,
  version text not null,
  title text not null,
  position integer not null check (position >= 0),
  is_required boolean not null default true,
  change_class text not null check (change_class in ('patch','minor','major')),
  estimated_study_minutes integer not null check (estimated_study_minutes > 0),
  estimated_project_minutes integer not null default 0 check (estimated_project_minutes >= 0),
  requires_project_evidence boolean not null default false,
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  published_at timestamptz not null,
  unique (lesson_id, course_version_id),
  unique (module_id, position)
);

create table public.lesson_prerequisites (
  lesson_version_id uuid not null references public.lesson_versions(id) on delete cascade,
  prerequisite_lesson_id uuid not null references public.lessons(id) on delete restrict,
  primary key (lesson_version_id, prerequisite_lesson_id)
);

create table public.exercise_definitions (
  id uuid primary key,
  lesson_version_id uuid not null references public.lesson_versions(id) on delete cascade,
  slug text not null,
  version integer not null check (version > 0),
  type text not null,
  mode text not null check (mode in ('practice','gating')),
  max_score integer not null check (max_score > 0),
  pass_score integer not null check (pass_score between 0 and max_score),
  evaluator_version text not null,
  is_required boolean not null default false,
  public_metadata jsonb not null default '{}'::jsonb,
  unique (lesson_version_id, slug, version)
);

create table public.milestone_definitions (
  id uuid primary key,
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  slug text not null,
  title text not null,
  position integer not null check (position >= 0),
  required_evidence_types text[] not null default '{}',
  unique (course_version_id, slug),
  unique (course_version_id, position)
);

-- Not exposed through the Data API. Only tightly scoped SECURITY DEFINER functions read it.
create schema if not exists content_private;
revoke all on schema content_private from public, anon, authenticated;
create table content_private.exercise_keys (
  exercise_id uuid primary key references public.exercise_definitions(id) on delete cascade,
  evaluator_kind text not null,
  answer_key jsonb not null,
  critical_item_ids text[] not null default '{}'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  timezone text,
  weekly_pace_hours numeric(4,1) check (weekly_pace_hours between 0 and 80),
  active_course_version_id uuid references public.course_versions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  course_version_id uuid not null references public.course_versions(id) on delete restrict,
  current_lesson_version_id uuid references public.lesson_versions(id) on delete restrict,
  completed_lesson_version_id uuid references public.lesson_versions(id) on delete restrict,
  status public.progress_status not null default 'not_started',
  last_anchor text,
  percent integer not null default 0 check (percent between 0 and 100),
  best_score integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  primary key (user_id, lesson_id, course_version_id)
);

create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  client_operation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercise_definitions(id) on delete restrict,
  lesson_version_id uuid not null references public.lesson_versions(id) on delete restrict,
  attempt_number integer not null check (attempt_number > 0),
  answer_summary jsonb,
  score integer not null check (score >= 0),
  max_score integer not null check (max_score > 0 and score <= max_score),
  passed boolean not null,
  solution_viewed boolean not null default false,
  feedback_codes text[] not null default '{}',
  evaluator_version text not null,
  variant_seed text,
  payload_sha256 text check (payload_sha256 is null or payload_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (user_id, client_operation_id),
  unique (user_id, exercise_id, attempt_number)
);

create table public.user_module_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.course_modules(id) on delete restrict,
  required_completed integer not null default 0 check (required_completed >= 0),
  required_total integer not null default 0 check (required_total >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table public.project_milestones (
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.milestone_definitions(id) on delete restrict,
  status public.milestone_status not null default 'locked',
  reflection text check (char_length(reflection) <= 10000),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  primary key (user_id, milestone_id)
);

create table public.milestone_evidence (
  id uuid primary key default gen_random_uuid(),
  client_operation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.milestone_definitions(id) on delete restrict,
  evidence_type text not null check (evidence_type in
    ('repository_url','commit_hash','checklist','reflection','screenshot','test_summary','note')),
  text_value text check (char_length(text_value) <= 20000),
  url_value text check (char_length(url_value) <= 2048),
  storage_object_path text,
  payload_sha256 text check (payload_sha256 is null or payload_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_operation_id),
  check (num_nonnulls(text_value, url_value, storage_object_path) >= 1)
);

create table public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  anchor text not null default '',
  body text not null check (char_length(body) <= 50000),
  client_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision bigint not null default 0
);

create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('lesson','reference','exercise','milestone')),
  content_id uuid not null,
  anchor text,
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id, anchor)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  text_scale numeric(3,2) not null default 1 check (text_scale between 0.8 and 2.0),
  compact_mode boolean not null default false,
  reduced_motion boolean,
  increased_contrast boolean not null default false,
  theme text not null default 'dark' check (theme in ('dark','system')),
  code_font_size integer not null default 14 check (code_font_size between 12 and 28),
  device_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0
);

create table public.exercise_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercise_definitions(id) on delete cascade,
  lesson_version_id uuid not null references public.lesson_versions(id) on delete restrict,
  draft jsonb not null,
  updated_at timestamptz not null default now(),
  revision bigint not null default 0,
  primary key (user_id, exercise_id),
  check (pg_column_size(draft) <= 262144)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  course_version_id uuid references public.course_versions(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  server_created_at timestamptz not null default now()
);
```

Required indexes beyond primary/unique keys:

```sql
create index on public.course_modules(course_version_id, stage_slug, position);
create index on public.lesson_versions(course_version_id, module_id, position);
create index on public.lesson_prerequisites(prerequisite_lesson_id);
create index on public.exercise_definitions(lesson_version_id, is_required);
create index on public.user_lesson_progress(user_id, status, updated_at desc);
create index on public.exercise_attempts(user_id, exercise_id, created_at desc);
create index on public.exercise_attempts(exercise_id, passed) where passed;
create index on public.project_milestones(user_id, status, updated_at desc);
create index on public.milestone_evidence(user_id, milestone_id, evidence_type);
create index on public.user_notes(user_id, updated_at desc);
create index on public.audit_events(user_id, server_created_at desc);
```

Use a generic `updated_at/revision` trigger on editable tables. Attempts and audit events are append-only. The auth-user trigger inserts only `profiles.id` and `user_preferences.user_id`; it does not copy email into public tables:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  insert into public.user_preferences(user_id) values (new.id) on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.touch_revision()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  new.revision := old.revision + 1;
  return new;
end $$;
```

Attach `touch_revision` only to editable tables that contain both columns; use a `touch_updated_at` variant for profiles/evidence. Do not attach mutation triggers to immutable attempts/audit events.

### 10.4 Grants and Row Level Security

Enable RLS even on public course tables. Public means read-only published rows, not unrestricted mutation. Revoke default write privileges before adding policies.

```sql
revoke all on all tables in schema public from anon, authenticated;
grant select on public.course_versions, public.course_modules, public.lessons,
  public.lesson_versions, public.lesson_prerequisites,
  public.exercise_definitions, public.milestone_definitions to anon, authenticated;

alter table public.course_versions enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_versions enable row level security;
alter table public.lesson_prerequisites enable row level security;
alter table public.exercise_definitions enable row level security;
alter table public.milestone_definitions enable row level security;

create policy course_versions_published_read on public.course_versions
  for select to anon, authenticated using (status = 'published');
create policy modules_published_read on public.course_modules
  for select to anon, authenticated using (exists (
    select 1 from public.course_versions cv
    where cv.id = course_version_id and cv.status = 'published'));
create policy lesson_versions_published_read on public.lesson_versions
  for select to anon, authenticated using (exists (
    select 1 from public.course_versions cv
    where cv.id = course_version_id and cv.status = 'published'));
create policy lessons_published_read on public.lessons
  for select to anon, authenticated using (exists (
    select 1 from public.lesson_versions lv join public.course_versions cv
      on cv.id = lv.course_version_id
    where lv.lesson_id = lessons.id and cv.status = 'published'));
create policy prerequisites_published_read on public.lesson_prerequisites
  for select to anon, authenticated using (exists (
    select 1 from public.lesson_versions lv join public.course_versions cv
      on cv.id = lv.course_version_id
    where lv.id = lesson_version_id and cv.status = 'published'));
create policy exercises_published_read on public.exercise_definitions
  for select to anon, authenticated using (exists (
    select 1 from public.lesson_versions lv join public.course_versions cv
      on cv.id = lv.course_version_id
    where lv.id = lesson_version_id and cv.status = 'published'));
create policy milestones_published_read on public.milestone_definitions
  for select to anon, authenticated using (exists (
    select 1 from public.course_versions cv
    where cv.id = course_version_id and cv.status = 'published'));
```

User table policy matrix:

| Table | Direct client grants | Policies |
|---|---|---|
| `profiles` | select, update | `id = auth.uid()` for both `using` and `with check`; no direct delete. |
| `user_lesson_progress` | select only | own rows; writes only through RPC. |
| `exercise_attempts` | select only | own rows; inserts only through evaluator RPC; no update/delete. |
| `user_module_progress` | select only | own rows; maintained by progress RPC/trigger. |
| `project_milestones` | select only | own rows; transitions only through RPC. |
| `milestone_evidence` | select/insert/update/delete | own rows; `with check` on insert/update; status still controlled by RPC. |
| `user_notes` | select/insert/update/delete | own rows. |
| `bookmarks` | select/insert/delete | own rows. |
| `user_preferences` | select/insert/update | own row. |
| `exercise_drafts` | select/insert/update/delete | own rows. |
| `audit_events` | select only | own rows; inserts only through trusted functions. |

Representative complete policy pattern (repeat with the grants in the matrix):

```sql
alter table public.user_notes enable row level security;
grant select, insert, update, delete on public.user_notes to authenticated;
create policy notes_select_own on public.user_notes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy notes_insert_own on public.user_notes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy notes_update_own on public.user_notes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy notes_delete_own on public.user_notes for delete to authenticated
  using ((select auth.uid()) = user_id);

alter table public.exercise_attempts enable row level security;
grant select on public.exercise_attempts to authenticated;
create policy attempts_select_own on public.exercise_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

alter table public.user_lesson_progress enable row level security;
grant select on public.user_lesson_progress to authenticated;
create policy progress_select_own on public.user_lesson_progress for select to authenticated
  using ((select auth.uid()) = user_id);
```

Apply the same exact ownership predicate to every table in the matrix; add ownership-column indexes as defined above. Do not create a broad `for all` policy for course content or use user-supplied `user_id` without `with check`. Views exposed to the API use `security_invoker = true` or are revoked from `anon/authenticated`. Official Supabase guidance requires RLS on exposed-schema tables and warns that service keys bypass it: [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security).

### 10.5 Secure progress and assessment functions

The client cannot insert/update progress, module aggregates, attempts, milestone status, or audit events directly. Functions are `SECURITY DEFINER`, owned by a non-login migration owner, set a safe search path, fully validate `auth.uid()`, and receive execution grants only for `authenticated`. They never accept an ownership ID from the client.

The core evaluator supports deterministic objective gates; advanced evaluators implement the same output contract in an Edge Function. Illustrative migration logic:

```sql
create or replace function public.submit_objective_attempt(
  p_exercise_id uuid,
  p_lesson_version_id uuid,
  p_client_operation_id uuid,
  p_answer jsonb,
  p_variant_seed text default null
) returns public.exercise_attempts
language plpgsql security definer
set search_path = public, content_private, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_def public.exercise_definitions;
  v_key content_private.exercise_keys;
  v_attempt integer;
  v_score integer;
  v_row public.exercise_attempts;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  select * into strict v_def from public.exercise_definitions
    where id = p_exercise_id and lesson_version_id = p_lesson_version_id;
  select * into strict v_key from content_private.exercise_keys
    where exercise_id = p_exercise_id;

  -- Initial SQL evaluator: exact structured equality after definitions normalize set/order semantics.
  -- Add reviewed evaluator branches by evaluator_kind; never evaluate code or dynamic SQL.
  v_score := case when p_answer = v_key.answer_key then v_def.max_score else 0 end;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text || p_exercise_id::text, 0));
  select coalesce(max(attempt_number), 0) + 1 into v_attempt
    from public.exercise_attempts
    where user_id = v_user and exercise_id = p_exercise_id;

  insert into public.exercise_attempts(
    client_operation_id, user_id, exercise_id, lesson_version_id,
    attempt_number, answer_summary, score, max_score, passed,
    feedback_codes, evaluator_version, variant_seed, payload_sha256)
  values (
    p_client_operation_id, v_user, p_exercise_id, p_lesson_version_id,
    v_attempt, p_answer, v_score, v_def.max_score, v_score >= v_def.pass_score,
    case when v_score >= v_def.pass_score then array['correct'] else array['retry'] end,
    v_def.evaluator_version, p_variant_seed,
    encode(digest(convert_to(p_answer::text, 'UTF8'), 'sha256'), 'hex'))
  returning * into v_row;
  return v_row;
end $$;

revoke all on function public.submit_objective_attempt(uuid,uuid,uuid,jsonb,text)
  from public, anon;
grant execute on function public.submit_objective_attempt(uuid,uuid,uuid,jsonb,text)
  to authenticated;
```

`record_lesson_position(lesson_version_id, anchor, percent, client_operation_id)`:

- derives the user from `auth.uid()`;
- verifies the lesson belongs to the profile’s active published course version;
- verifies prerequisite completions before changing `not_started` to `in_progress`;
- upserts only `last_anchor`, monotonic `percent`, `started_at`, `updated_at`, and `revision`;
- never accepts status/completion timestamps from the browser.

`complete_lesson(lesson_version_id, client_operation_id)` runs one transaction:

1. Lock the user/lesson progress row.
2. Verify active course version and every `lesson_prerequisites` row has `completed` progress.
3. Verify each required gating `exercise_definition` has a server-recorded passing attempt with the current evaluator/version rule.
4. If project evidence is required, set `awaiting_project_evidence`; otherwise set `completed`, `percent=100`, `completed_lesson_version_id`, and server `completed_at`.
5. Recompute the module aggregate from source rows; never trust client counts.
6. Insert a completion `audit_event` and unlock only milestone/lesson states whose prerequisites are now satisfied.
7. Return authoritative progress. Repeated `client_operation_id` returns the prior result or a no-op.

`submit_milestone(milestone_id, reflection, client_operation_id)` verifies required lessons and required evidence types, records the learner’s attestation, transitions to `completed_self_verified`, inserts an audit event, and triggers dependent unlock recomputation. It never asserts that code was inspected.

`reset_progress(scope, scope_id, confirmation)` is a definer function with an explicit allowlist. It creates an audit event and deletes/resets only the caller’s applicable rows. Full resets require a UI typed confirmation and a recent session. Account deletion is separate.

### 10.6 Authentication and session configuration

Recommended first release: verified email/password. It gives predictable cross-device sign-in and avoids making every sign-in dependent on email delivery. Offer magic-link sign-in as an optional same-browser convenience after testing the PKCE verifier/email-client behavior; a link opened on a different browser/device may not have the originating verifier. Retain password recovery. Do not enable anonymous Supabase Auth for preview mode because anonymous users cannot recover the account on another device. Anonymous visitors browse static content and may keep clearly temporary IndexedDB preview state.

Dashboard configuration:

1. Authentication -> Providers -> Email: enable email/password; require email confirmation for production. Configure password policy and abuse/rate limits appropriate to the current plan.
2. Authentication -> URL Configuration -> Site URL: exact production root, e.g. `https://<owner>.github.io/<repo>/`.
3. Add exact Redirect URLs: production root, `http://localhost:5173/`, and any intentional custom-domain root. Avoid broad production wildcards; official guidance recommends exact production paths: [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
4. Use PKCE. Redirect email confirmation/recovery to the site root, not a hash fragment. On bootstrap, detect the authorization `code` query, exchange it, remove sensitive query parameters with `history.replaceState`, then navigate internally to `#/auth/callback` or `#/auth/recovery`. This avoids hash-router/token-fragment collisions and GitHub Pages 404s.
5. Customize confirmation/recovery templates with the ActionDev name, support contact, expected destination, expiry wording, and no misleading urgency. Test confirmation, expired/reused link, changed device, resend, and recovery.
6. For a public launch, review current Supabase Auth email rate limits/deliverability. The default sender is acceptable for a single learner/private pilot but may not be adequate at scale. A custom SMTP provider is an operational option, not a mandatory paid dependency in the course app.

GitHub Pages does not provide an isolated pull-request URL by default. Do not add a broad preview wildcard merely in anticipation of one. Local previews use `http://localhost:5173/`. If a deliberate preview host is introduced later, add its documented pattern as an additional redirect, keep the production Site URL exact, and never point auth emails at an untrusted fork preview.

Browser client initialization:

```ts
createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

Register `onAuthStateChange` once near client creation; handle initial, sign-in, sign-out, password recovery, token refreshed, and user updated events, and unsubscribe on teardown. Supabase stores browser session tokens locally so the session survives refresh; that is authentication state, not authoritative course progress. Server/RLS always verify the JWT. On sign-out, clear user-scoped Query/IndexedDB data and leave non-sensitive static caches.

Account recovery calls `resetPasswordForEmail` with the exact allowed root redirect, then accepts the `PASSWORD_RECOVERY` event and calls `updateUser` after password validation. Account email change, where exposed, requires re-verification.

### 10.7 Environment variables and secrets

`.env.example`:

```text
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_APP_BASE_URL=/repository-name/
VITE_CONTENT_VERSION=development
```

- `VITE_*` values are compiled into the static JavaScript and are public. Store them as GitHub repository/environment **variables** or workflow environment values; calling them secrets does not make them secret after build.
- `.env.local` is ignored. Commit only `.env.example` with placeholders.
- `SUPABASE_ACCESS_TOKEN`, database password, secret/service-role key, SMTP credentials, Edge Function signing/integration secrets, and any completion-receipt HMAC secret are server/CI-only. Put them in Supabase project secrets or protected GitHub Actions secrets only for the workflow that needs them.
- A service-role/secret key is never used by the React app, Pages job, MDX, simulator, test fixture shipped to the browser, or public preview.

Local no-credential mode uses static course manifests, a fixture account, in-memory/IndexedDB repository, and visible **Local demo - not synced** status. Full integration uses the local Supabase stack’s generated URL/publishable/anon value. Production credentials are not required to author/render lessons.

### 10.8 Online-first progress synchronization

Each mutation receives a UUID `client_operation_id`. The UI applies optimistic state only for reversible fields and marks it pending. The operation queue is in IndexedDB with user ID, entity, operation, base revision, payload, created time, retry count, and last error. Retry uses connectivity events plus capped exponential backoff with jitter. `401` triggers one session refresh; `403`, schema/version, validation, or prerequisite errors are permanent and shown to the learner.

Conflict rules:

- Lesson status is monotonic (`not_started -> in_progress -> awaiting evidence/completed`); completion never regresses automatically. Server time wins for completion.
- Percent is `max(server, queued)` within the same lesson version; a major-version review is a separate state.
- Exercise attempts and audit events append; idempotency prevents duplicates. Best score is derived, never conflict-merged in the client.
- Notes/drafts use revision compare-and-swap. On concurrent edits, preserve both copies and ask the learner to choose/merge; never silently discard text.
- Bookmarks are a set; add/delete are idempotent.
- Preferences use field-level last-server-write except explicit device-local fields.
- Milestone evidence appends by operation ID; edits require the latest revision. Milestone completion is server-derived.

On login/reconnect, pull server state first, remove operations already applied by ID, then replay valid queued operations in creation order per entity. A visible sync center lists pending/failed items and provides retry/export; local queued data is never represented as cross-device safe.

### 10.9 Export, deletion, storage, backups, and Free Tier operations

Export fetches all caller-visible learner tables under RLS and creates a browser-side ZIP/JSON/Markdown package containing profile (not auth internals), progress with versions/timestamps, attempts, milestones/evidence metadata, notes/bookmarks/preferences, and audit history. It excludes private answer keys and other users. Large exports may move to an authenticated Edge Function later.

Account deletion requires a fresh authenticated session, typed confirmation, and an Edge Function. The function validates the JWT, deletes private Storage objects, then uses a service-role client held only in Supabase secrets to delete the Auth user; `on delete cascade` removes learner rows. It returns no service credential. The UI explains irreversibility and recommends export first.

Optional screenshot evidence uses private bucket `milestone-evidence`, object path `<auth.uid()>/<uuid>.<ext>`, accepted image MIME allowlist, client-side dimension/size reduction, per-object limit, and Storage RLS matching the first path segment to `auth.uid()`. Do not accept archives, executables, raw project repositories, or unbounded logs. Prefer URL/text/commit evidence to conserve Free Tier storage.

Free Tier is suitable for a personal learner/pilot, not an availability promise. Current official guidance notes that low-activity free projects may pause and recommends user-managed logical dumps for free projects. Run a regular owner-controlled `supabase db dump` to encrypted off-site storage, test restore, monitor database/storage/egress/Auth/Function quotas, and review limits before rollout: [Supabase production checklist](https://supabase.com/docs/guides/platform/going-into-prod/) and [backup guidance](https://supabase.com/docs/guides/platform/backups). Do not add artificial traffic to evade pausing. The app must show a clear backend-unavailable state and preserve local drafts for retry.

### 10.10 Supabase verification checklist

- Run schema from empty database and compare generated TypeScript types.
- Automated RLS matrix uses users A/B and anonymous role: A can read/write permitted A rows, cannot see/mutate B; B reciprocal; anonymous sees published metadata only; draft course/private answer keys are inaccessible.
- Attempt/progress/milestone direct writes fail; RPCs succeed only for authenticated owner with satisfied rules.
- A malicious `user_id`, locked lesson, stale lesson version, forged passing score, duplicate operation, missing evidence, and cross-course attempt are rejected.
- Account deletion removes auth user, public learner rows, and private objects; export contains only owner data.
- Localhost and production confirmation/recovery redirects work; arbitrary redirect is rejected; query tokens/codes are removed after exchange.
- Offline queue, two-device conflict, token refresh/expiry, sign-out cache clearing, free-project pause, and restored backend are exercised.

## 11. Security and Privacy Model

### 11.1 What is stored

- Supabase Auth stores identity credentials/session records. ActionDev public tables store no password and do not copy email.
- `profiles` stores optional alias, timezone, pace, and course version.
- Progress stores opaque/authored UUIDs, statuses, lesson version, scores, server timestamps, and last anchor.
- Attempts store structured response summaries only when needed for feedback/audit. Avoid retaining unnecessary free response and never ask for repository source.
- Milestones store learner-supplied links, commit hashes, checklist/reflection/test summaries, and optional private screenshot path.
- Notes/bookmarks/preferences are learner-controlled. Minimal operational audit events describe completion/reset/status transitions.
- Product analytics are off by default in the first release. If later added, use aggregated first-party events, documented purpose/retention, consent where required, and no advertising fingerprinting.

### 11.2 Hash, encryption, and integrity decision

Do **not** hash lesson/module/milestone progress. The app must query, update, synchronize, export, and render those records. A one-way hash would make those functions impossible and would not provide authorization.

Use:

- Supabase Auth’s managed password handling; ActionDev never hashes or receives raw stored passwords.
- TLS in transit and Supabase platform encryption controls at rest; do not invent client-side encryption without a key-recovery/product requirement.
- UUID content IDs and `auth.uid()` ownership rather than descriptive/sensitive keys in user-state relationships. Course titles are public and not sensitive.
- server timestamps, immutable attempts/audit events, lesson/course version IDs, constraints, RLS, and idempotency as the primary integrity controls;
- optional server-computed SHA-256 on immutable answer/evidence canonical payloads for duplicate/corruption detection. A digest stored beside the same row does not stop a privileged database administrator and is not proof of academic honesty;
- optional future HMAC-signed completion receipt only if an external verifier needs it. Generate it in an Edge Function with a server-held rotating secret; never expose the secret. It is unnecessary for normal progress.

### 11.3 Threat model and controls

| Threat | Control | Residual limit |
|---|---|---|
| User A reads/writes User B state | RLS on every learner table; ownership indexes; two-user tests | Supabase project administrators retain privileged access. |
| Browser key leaks | Publishable key is intentionally public; least grants + RLS | RLS misconfiguration remains critical, so migrations/tests gate deploy. |
| Service key leaks | Never in client/Pages; Supabase/GitHub protected secrets; rotate on suspected exposure | Trusted CI/Edge owners remain privileged. |
| Locked lesson marked complete | No direct progress writes; completion RPC checks published version, prerequisites, attempts, evidence | A determined learner can discover answers; this is self-guided education, not proctoring. |
| Attempt replay/duplicate | operation UUID, unique constraints, server attempt numbering and timestamps | Offline operations still require reconciliation UX. |
| Malicious MDX/content | Trusted-only MDX, component allowlist, no raw scripts, schema/lint/build review, CSP | Maintainer compromise can ship malicious static code; protect repository/Actions. |
| XSS from notes/feedback | Render learner text as text, not HTML; sanitize any allowed markup; CSP; no token logging | Third-party dependencies remain supply-chain risk. |
| Evidence upload abuse | Private bucket, RLS path, MIME/size/dimension allowlist, no executable/archive types | Client MIME can lie; inspect signatures in Edge Function if uploads expand. |
| Auth redirect abuse | Exact production allowlist, PKCE, root callback, state/verifier handled by library, strip query | Email client/link-scanner behavior requires testing. |
| Data loss/free pause | local drafts/queue, regular logical dumps, restore drill, export | Free Tier has weaker availability/recovery than paid service. |

### 11.4 Static-frontend limits

Anyone can inspect JavaScript, static course prose, public feedback, and local evaluators. Client-side checks cannot protect secrets or guarantee completion integrity. GitHub Pages cannot run server code, safely hold a service role, delete Auth users, sign certificates, hide answer keys, or compile arbitrary native code. Put only the minimal sensitive operations in Postgres functions/Edge Functions and keep everything else static. If requirements later demand high-stakes certification, private commercial content protection, large media, or heavy remote compilation, the architecture must be revisited rather than disguised with frontend obfuscation.

### 11.5 Retention and user rights

Keep learner records until deletion; allow note/evidence deletion and scoped progress reset. Audit/completion history may be removed by full account deletion. Define a short retention for orphaned upload objects and failed evaluator payloads. Publish a plain-language privacy page naming Supabase/GitHub Pages, data categories, purpose, storage region, export/deletion route, and support contact. Do not claim legal compliance without a jurisdiction-specific review.

## 12. Development Phases and Delivery Plan

Each phase ends in a deployable increment and content evidence. Do not begin full curriculum prose production before the schema/templates and a representative lesson are validated; do not delay architecture/course inventory until visual polish.

### Phase 1 - Project foundation and GitHub Pages deployment

- Goal/scope: React/TypeScript/Vite, HashRouter, pnpm, lint/type/test, design tokens, global shell, route fixtures, Pages workflow, error boundaries.
- Content: orientation fixture and generated route manifest only.
- Data/Supabase: repository/migration skeleton; no production dependency.
- Tests/DoD: root/hash routes, base path, desktop/mobile shell, keyboard nav, axe, build artifact deployed from protected default branch.
- Risk/mitigation: base-path/auth-route mistakes; test project-site URL in CI preview.
- Do not build: dashboard metrics, full course map, editor, simulators, upload storage.

### Phase 2 - Supabase Auth and persistent learner state

- Goal/scope: email/password/confirmation/recovery, session provider, profile/preferences, sync indicator, IndexedDB queue adapter, local-demo adapter.
- Content: privacy/learning-contract onboarding.
- Data/Supabase: migrations 0001-0005, Auth URLs, profile trigger, RLS tests, environment separation.
- Tests/DoD: two-user isolation, production/localhost callbacks, cross-device profile/preferences, offline failure labeling, no secret in artifact.
- Risk/mitigation: Free email/pausing; clear pilot constraints and backend-unavailable UI.
- Do not build: completion RPC or milestone evidence.

### Phase 3 - Content schema, build pipeline, and lesson reader

- Goal/scope: MDX allowlist, YAML/Zod schemas, content validator, manifests/search trace, lesson shell/TOC/code/diagram/glossary/notes/bookmarks.
- Content: full metadata skeleton for all 89 lessons; complete `AD-OR-01`, `AD-OR-02`, and one technical vertical lesson.
- Data/Supabase: public course metadata and notes/bookmarks tables/RLS.
- Tests/DoD: invalid prerequisites/anchors/resources/trace/hand-off fail CI; reader accessible/responsive; version seed matches manifest hash.
- Risk/mitigation: schema churn; prove three structurally different lessons before freeze.
- Do not build: large lesson body set or advanced exercise engine.

### Phase 4 - Dashboard and dependency-aware curriculum map

- Goal/scope: dashboard, route search/command palette, map/list, locked reasons, stage/system/gate progress, resume resolver.
- Content: all stage/module/gate summaries and reference contracts.
- Data/Supabase: progress tables, `record_lesson_position`, aggregate recomputation.
- Tests/DoD: anonymous versus authenticated views, map/list parity, mobile list, deep-link disclosure, cross-device resume.
- Risk/mitigation: graph performance/accessibility; virtualize and keep ordered-list canonical alternative.
- Do not build: streak gamification or complex charts.

### Phase 5 - Core deterministic exercise engine

- Goal/scope: Phase 1 exercise union/renderers/evaluators, hints/feedback/retries, practice/gate distinction, attempt history.
- Content: exercises for orientation and first foundation module; feedback code catalog.
- Data/Supabase: private keys, `submit_objective_attempt`, immutable attempts, `complete_lesson`.
- Tests/DoD: evaluator golden tests, critical thresholds, idempotency, forged/direct completion rejection, keyboard alternatives, screen-reader feedback.
- Risk/mitigation: answer leakage/inflexible schema; separate public feedback/private keys and version evaluators.
- Do not build: C++ WASM or free-form AI grading.

### Phase 6 - First complete course stage

- Goal/scope: author, review, and ship Stage 0 end-to-end with project evidence for Gate 00.
- Content: `AD-OR-*`, `AD-FD-*`, glossary/references/diagrams/assessments/handoffs.
- Data/Supabase: active course enrollment and major/minor/patch version behavior.
- Tests/DoD: a beginner can complete without mandatory links; clone/build/test handoff has exact criteria; content review and usability test produce resolved findings.
- Risk/mitigation: shallow prose; apply lesson rubric and beginner test sessions before scaling.
- Do not build: later lesson prose merely to increase count.

### Phase 7 - Project milestone tracker

- Goal/scope: all six gates, evidence/checklist/reflection/status history, self-verification language, optional private screenshots, export/reset.
- Content: gate briefs and acceptance criteria from Section 6.
- Data/Supabase: milestone/evidence/audit tables, completion/reset/export functions, Storage policies if enabled.
- Tests/DoD: missing evidence/prerequisite rejected; cross-user evidence isolated; offline evidence queue; deletion/export verified.
- Risk/mitigation: false verification claim; use explicit `completed_self_verified` status everywhere.
- Do not build: GitHub repository inspection or OAuth integration.

### Phase 8 - Full curriculum implementation

- Goal/scope: parallel content production by dependency order; reusable diagram/simulator/reference assets; staged publishing.
- Content order: Platform/Data -> Simulation/Animation/Combat -> RPG/AI -> Networking -> Party/QA/Steam. Every lesson gets technical, instructional, and accessibility review.
- Data/Supabase: generated metadata migrations per course release; impact previews.
- Tests/DoD: source trace coverage 100%; all 89 lessons meet schema/rubric; no mandatory external learning; gates preserve source criteria.
- Risk/mitigation: authoring scope; module budgets, common reference pages, no duplicate lessons, never waive completeness.
- Do not build: unrelated learning paths or generalized LMS authoring UI.

### Phase 9 - Advanced simulations and code exercises

- Goal/scope: CodeMirror/static parsing plus combat, loot, skill-tree, network, interest, and migration simulators in Workers.
- Content: exercises attached only where simulation materially improves understanding.
- Data/Supabase: evaluator versions/fixtures; optional Edge Function for bounded private evaluation.
- Tests/DoD: golden traces, deterministic seeds, time/memory/output limits, accessible non-visual alternatives, low-end device budgets.
- Risk/mitigation: gimmick/complexity; require learning-outcome justification and retain simpler fallback.
- Do not build: native arbitrary code service or required browser compiler.

### Phase 10 - Accessibility, privacy, performance, and launch hardening

- Goal/scope: full manual accessibility sweep, content QA, performance budgets, CSP/dependency audit, RLS/redirect/restore drills, browser/device matrix, operational docs.
- Content: final errata, resource link review, release notes, privacy/help pages.
- Data/Supabase: account deletion Edge Function, backup/export test, production policy review.
- Tests/DoD: Section 14 acceptance suite green; pilot learners complete representative stages; no critical security/accessibility/content defects.
- Risk/mitigation: polished shell masking thin teaching; launch report separately scores content completeness and product quality.
- Do not build: future enhancements before launch blockers close.

## 13. Prioritized Backlog

### Must-have for first usable release

1. Static Pages foundation, shared shell, restrained design tokens, responsive/accessible navigation.
2. Supabase verified email/password, recovery, RLS, profile/preferences, cross-device session/progress.
3. Content schema/validator/versioning/source trace, reader, glossary, notes/bookmarks.
4. Dashboard and accessible curriculum list/map with locked reasons and Gate 00.
5. Deterministic Phase 1 exercises, explanatory feedback, immutable attempts, server-verified completion RPC.
6. Complete Stage 0 content with no mandatory external learning.
7. Offline draft/operation queue with honest sync state; export, reset, privacy explanation.
8. CI unit/component/content/RLS/axe/Playwright and Pages deploy.

### Must-have before full curriculum rollout

1. Milestone tracker and all gate definitions/evidence/RPCs.
2. All content block types, diagrams with alternatives, code/diff/terminal, command palette/reference search.
3. Major/minor/patch impact and course-version migration preview.
4. Content author preview/review workflow and coverage report.
5. CodeMirror/static validators and reusable trace/simulation framework.
6. Full 89-lesson metadata and dependency/source map; staged complete modules in order.
7. Account deletion, private upload only if screenshots are enabled, restore rehearsal.

### Important but can follow the first full path

1. Rich skill-tree, loot, network, and save-migration simulators beyond required static exercises.
2. PWA static-content offline support after auth/progress semantics are proven.
3. More granular progress analytics and learner-controlled pace forecasting.
4. Improved content author diff/preview tooling and automated external-link health reports.
5. Optional magic-link primary sign-in after email delivery is operationally reliable.
6. Edge-verified AST/static evaluation for a small set of advanced gates.

### Optional future enhancements

1. Carefully sandboxed C++/Clang WASM for tiny programs.
2. GitHub OAuth/repository integration that is explicitly opt-in, least-privilege, and never required.
3. Additional learning paths using the same content-agnostic shell.
4. Signed completion receipts or shareable certificates.
5. Instructor/reviewer workflow, cohorts, or collaborative notes.
6. Rich downloadable/print course summaries generated from the same source.

## 14. Acceptance Criteria

### Platform and deployment

- Production builds from a clean clone with a frozen lockfile; typecheck, content validation, unit/component/accessibility/E2E tests precede deploy.
- GitHub Pages loads from the configured project/root base, all hash routes refresh/back/forward correctly, assets resolve, and only the default branch can deploy.
- No secret/service-role/database credential exists in source, logs, source maps, or the downloaded Pages artifact.

### Authentication and account

- Verified email/password signup/sign-in/sign-out, confirmation, expired/reused links, password recovery, session refresh, and another-device login work for localhost and exact production URL.
- Anonymous visitors can browse allowed content but cannot create authoritative progress. Authenticated users resume across devices.
- Export contains only the caller’s data; reset is scoped/confirmed/audited; deletion removes Auth user, learner rows, and private objects.

### Database and RLS

- Every exposed table has RLS and explicit grants. Anonymous sees only published course metadata. User A cannot select/insert/update/delete User B data using REST, SDK, RPC parameter tampering, or Storage path manipulation.
- Course content is client read-only. Private answer keys are unreachable through Data API.
- Direct attempts/progress/module/milestone/audit writes fail; RPCs derive `auth.uid()`, validate active versions/prerequisites/attempts/evidence, use server timestamps, and are idempotent.

### Progress and exercises

- Lesson state, last location, required completion, attempts/best result, milestones, notes/bookmarks/preferences sync online-first and survive another-device login.
- A network failure never displays a false cloud-saved state. Queued mutations retry and permanent failures are actionable. Two-device note/draft conflict preserves both versions.
- All exercise types have keyboard/touch/screen-reader alternatives, immediate explanatory feedback, retry, best/latest result, deterministic evaluator tests, and versioned attempts.
- A locked lesson cannot be completed through supported client APIs without prerequisites and required server-recorded qualifying assessments.

### Content and curriculum

- All 89 lessons in Section 6 exist with title, prerequisite, framing/objectives, complete in-app instruction, vocabulary, worked correct/incorrect/debug examples, visuals and alternatives, required exercises/assessment, optional free enrichment, exact project handoff/artifacts/tests, completion rule, effort, milestone, version, and source trace.
- The generated trace report maps every registered requirement from all five PDFs to published content/reference/gate or a documented source-unspecified decision; coverage is 100% with no unexplained orphan.
- No required lesson tells the learner to learn elsewhere. Every external resource is optional, free/no-payment-required at review time, purpose-labeled, and link-checked.
- Major course changes preserve historical completion/version and show transparent review/migration impact; minor/patch edits do not erase completion.
- The own/borrow boundary, durable authority model, complete combat contract, hybrid progression, loot/AI/network/party/Steam/QA/accessibility curriculum, and six gates remain intact.

### Milestones

- Gate 00, feel gate, local vertical slice, two-player proof, eight-player stress, and Early Access readiness reproduce Section 6 criteria.
- Evidence supports URL, commit, checklist, reflection, screenshot path, and test summary with explicit learner-verification language. The app never claims repository inspection.

### Accessibility and responsive UX

- Target WCAG 2.2 AA; no critical axe findings; complete keyboard use; logical headings/landmarks/focus; screen-reader labels/state; reduced motion; sufficient contrast; no color-only state.
- Meaningful diagrams have equivalent text/linear workflows. Code/tables remain readable/scrollable. Touch targets default to 44 px. Text/code/UI scale and high-content pages work on mobile, tablet, laptop, desktop, and wide screens without overlay collisions.
- The product follows the supplied visual rules: restrained near-black system, meaningful accents, continuous bands, limited card nesting, consistent route shell, no fantasy/game-launcher/LMS-template treatment.

### Performance and operations

- Initial shell excludes editor/simulators; route chunks lazy-load; measured budgets in Section 9 are met or revised with evidence and no interaction/accessibility regression.
- RLS, Auth redirect, export/deletion, backup/restore, free-project unavailable/recovery, and incident runbooks are tested before public launch.

## 15. Risks, Tradeoffs, and Open Decisions

| Risk/tradeoff | Impact | Mitigation/decision |
|---|---|---|
| Curriculum scope explosion | 89 deep lessons plus exercises/diagrams/handoffs is far larger than a normal app build. | Treat content as the product; stage by dependency; enforce templates/review/trace; reuse reference contracts without replacing lesson teaching; do not market incomplete path as complete. |
| Thin content behind polished UI | Violates the core promise despite good metrics/design. | Separate content-completeness gate from software launch gate; beginner usability reviews; mandatory lesson rubric and source coverage. |
| Mandatory-link regression | Authors may save time by outsourcing instruction. | CI language lint plus human review; external resources schema requires `optional/free/whyOptional`; acceptance test samples every lesson. |
| Browser C++ complexity | Large compiler payload/security/mobile performance can consume the roadmap. | Deterministic/type-aware static exercises first; learner compiles real C++ in project; optional WASM only after evidence. |
| Static hosting limits | No safe server secrets, rewrite server, or native execution. | HashRouter; Supabase RLS/RPC/Edge only for necessary private operations; never obfuscate secrets in JS. |
| Supabase Free Tier pause/quota/email/backup limits | Auth or sync may be unavailable and recovery weaker than paid tiers. | Honest pilot scope, IndexedDB drafts/queue, monitoring, logical dumps/restore drill, exact current-limit review, upgrade only when justified. |
| Auth redirects on hash routing | Fragment/query collisions or Pages 404 can break confirmation/recovery. | PKCE redirect to exact site root, bootstrap code exchange, strip query, then internal hash navigation; E2E test email flows. |
| RLS/function mistake | Cross-user exposure or fake progression. | Default revoke, migrations only, two-user/anonymous test matrix, no direct status writes, safe definer functions, code review. |
| Local answer visibility | Static practice answers can be reverse engineered. | Accept for self-guided practice; private structured gate keys/RPC; no false claim of proctoring. |
| Content version churn | Completion invalidation erodes trust. | Stable IDs, patch/minor/major policy, historical records, explicit impact review; never silently erase. |
| Sync conflicts/data loss | Notes/drafts or progress can diverge across devices. | Idempotency, revisions, monotonic completion, append-only attempts/evidence, preserve both text conflicts, visible sync center. |
| UX map complexity | Graph becomes slow/inaccessible on mobile. | Ordered list is canonical accessible representation; graph is filtered/virtualized enhancement. |
| Overuse of component library/cards | Product becomes generic LMS despite specification. | Token-owned styling, primitive-only library use, continuous bands, design review against UX source. |
| Source conflict/numerical drift | Older roadmap values can silently reappear. | Documented precedence; 30 Hz/20 Hz nearby baseline; source trace and authoritative-rule reference pages. |
| Project verification illusion | Learner may assume evidence proves code works. | `completed_self_verified` status, explicit limits, exact tests/evidence, no GitHub inspection claim. |
| Privacy creep from evidence/analytics | Repository details, logs, or identity may be over-collected. | Minimal fields, discourage source/log uploads, private size-limited images, analytics off initially, export/delete. |
| Accessibility debt | Complex editors/maps/drag exercises become unusable. | Linear/keyboard fallbacks are schema requirements; manual review each content component and release. |
| Maintaining external resources | Links/pricing/access change. | Optional only; scheduled review; official/open sources; broken links never block required understanding. |

Final product decisions to confirm before implementation begins:

1. Repository owner/name and whether deployment is a project site or custom/root domain; this fixes Vite base and Auth URLs.
2. Whether the first release is private/single learner or publicly discoverable; this changes email/Free Tier operational expectations, not architecture.
3. Whether optional screenshot evidence is worth Storage complexity in the first release. Recommendation: start with URL/text/commit/test evidence and add screenshots in Phase 7 only if needed.
4. Whether magic links are offered at initial launch. Recommendation: verified email/password first, magic link secondary after deliverability tests.
5. Whether course publishing is one complete release or stage-by-stage. Recommendation: stage-by-stage with honest availability labels; never call the curriculum complete until Section 14 is satisfied.

No unresolved item above authorizes a change to the canonical ARPG combat, authoritative networking, own/borrow boundary, or required learning promise.
