export const references = [
  {
    id: "combat-law",
    category: "Combat contract",
    title: "Canonical damage order",
    summary: "Every hit resolves through one shared, testable sequence.",
    lines: ["Validate attack", "Dodge or immunity", "Block", "Modifiers", "Shields", "Health", "Post-hit reactions"],
  },
  {
    id: "targeting-law",
    category: "Combat contract",
    title: "Selection is not hit validity",
    summary: "Soft targeting finds the nearest living hostile in weapon selection range regardless of facing. Each attack separately validates range, angle, collision, and line of sight.",
    lines: ["Gather hostiles", "Filter living and targetable", "Rank by distance with hysteresis", "Select", "Validate per attack"],
  },
  {
    id: "authority-map",
    category: "Architecture",
    title: "Server authority boundary",
    summary: "The client owns camera and presentation. The server owns final movement, combat, AI, loot, inventory, progression, and persistence.",
    lines: ["Client input intent", "Server fixed tick", "Authoritative resolution", "Snapshot/event", "Client presentation"],
  },
  {
    id: "network-baseline",
    category: "Networking",
    title: "Starting simulation profile",
    summary: "Profile these values; do not treat them as universal constants.",
    lines: ["30 Hz authoritative simulation", "20 Hz nearby combat snapshots", "5–10 Hz distant relevance", "Local prediction", "Remote interpolation"],
  },
  {
    id: "ownership-boundary",
    category: "Architecture",
    title: "Own versus borrow",
    summary: "Own the systems that define this ARPG. Integrate mature low-level infrastructure instead of rebuilding an engine.",
    lines: ["Own: combat, abilities, AI rules, loot, replication", "Borrow: SDL3, bgfx, Jolt, Recast, ozz, RmlUi, GNS"],
  },
  {
    id: "early-access",
    category: "Release",
    title: "Early Access evidence",
    summary: "The build must be worth playing now. Store communication describes current reality, not guaranteed future promises.",
    lines: ["Playable and replayable", "Stable saves", "Repeatable packaging", "Support workflow", "Honest scope"],
  },
] as const;

export const glossary = [
  ["Authority", "The process that owns the final truth for a piece of game state."],
  ["Fixed timestep", "A simulation that advances in equal time increments independent of rendering."],
  ["Interpolation", "Rendering between known snapshots to make remote motion appear smooth."],
  ["Reconciliation", "Correcting predicted local state from the server and replaying unacknowledged inputs."],
  ["ECS", "Entity-component-system: a data composition model useful for many simulation-heavy game concerns."],
  ["RLS", "Postgres Row Level Security policies that constrain which rows a requester can access."],
  ["Telegraph", "A readable visual or audio cue that communicates an upcoming gameplay action."],
  ["Affix", "A generated item modifier selected from a validated weighted family and tier."],
] as const;
