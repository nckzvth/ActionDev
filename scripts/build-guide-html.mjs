import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { marked } from "marked";

const root = resolve(import.meta.dirname, "..");
const sourcePath = resolve(root, "docs/ActionDev-Master-Learning-Guide.md");
const outputPaths = [
  resolve(root, "docs/ActionDev-Master-Learning-Guide.html"),
  resolve(root, "docs/index.html"),
];
const rawMarkdown = await readFile(sourcePath, "utf8");

const resourceLinks = {
  "R-CPPREF": ["cppreference", "https://en.cppreference.com/"],
  "R-CORE": ["C++ Core Guidelines", "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines"],
  "R-CMAKE": ["CMake tutorial", "https://cmake.org/cmake/help/latest/guide/tutorial/"],
  "R-CTEST": ["CTest manual", "https://cmake.org/cmake/help/latest/manual/ctest.1.html"],
  "R-VCPKG": ["vcpkg CMake integration", "https://learn.microsoft.com/en-us/vcpkg/users/buildsystems/cmake-integration"],
  "R-PROGIT": ["Pro Git", "https://git-scm.com/book/en/v2"],
  "R-GHLFS": ["Git LFS", "https://git-lfs.com/"],
  "R-ASAN": ["AddressSanitizer", "https://clang.llvm.org/docs/AddressSanitizer.html"],
  "R-TSAN": ["ThreadSanitizer", "https://clang.llvm.org/docs/ThreadSanitizer.html"],
  "R-LIBFUZZ": ["libFuzzer", "https://llvm.org/docs/LibFuzzer.html"],
  "R-GTEST": ["GoogleTest", "https://google.github.io/googletest/"],
  "R-GPP": ["Game Programming Patterns", "https://gameprogrammingpatterns.com/"],
  "R-DOD": ["Data-Oriented Design", "https://www.dataorienteddesign.com/dodbook/"],
  "R-SDL": ["SDL3 Wiki", "https://wiki.libsdl.org/SDL3/"],
  "R-MINIAUDIO": ["miniaudio manual", "https://miniaud.io/docs/manual/"],
  "R-BGFX": ["bgfx documentation", "https://bkaradzic.github.io/bgfx/"],
  "R-RENDERDOC": ["RenderDoc", "https://renderdoc.org/"],
  "R-TRACY": ["Tracy profiler", "https://github.com/wolfpld/tracy"],
  "R-GLTF": ["glTF 2.0 specification", "https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html"],
  "R-BLENDER": ["Blender glTF exporter", "https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html"],
  "R-ENTT": ["EnTT", "https://github.com/skypjack/entt"],
  "R-JSON": ["JSON for Modern C++", "https://github.com/nlohmann/json"],
  "R-JOLT": ["Jolt Physics", "https://jrouwe.github.io/JoltPhysics/"],
  "R-OZZ": ["ozz-animation", "https://guillaumeblanc.github.io/ozz-animation/documentation/"],
  "R-RECAST": ["Recast Navigation", "https://recastnav.com/"],
  "R-IMGUI": ["Dear ImGui", "https://github.com/ocornut/imgui/wiki/Getting-Started"],
  "R-RMLUI": ["RmlUi manual", "https://mikke89.github.io/RmlUiDoc/pages/cpp_manual.html"],
  "R-GAFFER-TIME": ["Fix Your Timestep", "https://gafferongames.com/post/fix_your_timestep/"],
  "R-GAFFER-NET": ["Networked Physics", "https://gafferongames.com/categories/networked-physics/"],
  "R-GAFFER-SNAPSHOT": ["Snapshot Interpolation", "https://gafferongames.com/post/snapshot_interpolation/"],
  "R-GNS": ["GameNetworkingSockets", "https://github.com/ValveSoftware/GameNetworkingSockets"],
  "R-BT-SURVEY": ["behavior-tree survey", "https://arxiv.org/abs/2005.05842"],
  "R-GAIPRO": ["Game AI Pro", "https://www.gameaipro.com/"],
  "R-XAG": ["Xbox Accessibility Guidelines", "https://learn.microsoft.com/en-us/gaming/accessibility/guidelines"],
  "R-GAG": ["Game Accessibility Guidelines", "https://gameaccessibilityguidelines.com/"],
  "R-CRASHPAD": ["Crashpad", "https://chromium.googlesource.com/crashpad/crashpad/"],
  "R-OTEL": ["OpenTelemetry C++", "https://opentelemetry.io/docs/languages/cpp/"],
  "R-D2": ["Chapter 6 buildcraft design summary", "#6-abilities-progression-loot-navigation-and-encounters"],
  "R-STEAMINPUT": ["Steam Input", "https://partner.steamgames.com/doc/features/steam_controller"],
  "R-STEAMLOBBY": ["Steam lobbies", "https://partner.steamgames.com/doc/features/multiplayer/matchmaking"],
  "R-STEAMAUTH": ["Steam authentication", "https://partner.steamgames.com/doc/features/auth"],
  "R-STEAMAC": ["Steam anti-cheat guidance", "https://partner.steamgames.com/doc/features/anticheat"],
  "R-SPACEWAR": ["Steamworks Spacewar example", "https://partner.steamgames.com/doc/sdk/api/example"],
  "R-STEAMSERVER": ["Steam game servers", "https://partner.steamgames.com/doc/features/multiplayer/game_servers"],
  "R-STEAMUPLOAD": ["SteamPipe uploading", "https://partner.steamgames.com/doc/sdk/uploading"],
  "R-STEAMCLOUD": ["Steam Cloud", "https://partner.steamgames.com/doc/features/cloud"],
  "R-STEAMSTATS": ["Steam stats and achievements", "https://partner.steamgames.com/doc/features/achievements"],
  "R-STEAMEA": ["Steam Early Access rules", "https://partner.steamgames.com/doc/store/earlyaccess"],
  "R-STEAMSTORE": ["Steam store presence", "https://partner.steamgames.com/doc/store"],
};

const markdown = rawMarkdown.split(/\r?\n/).map((line) => {
  if (!line.includes("Optional:") || !/`R-/.test(line)) return line;
  return line.replace("Optional:", "If stuck, use:").replace(/`(R-[A-Z0-9-]+)`/g, (full, key) => {
    const resource = resourceLinks[key];
    return resource ? `[${resource[0]}](${resource[1]})` : full;
  });
}).join("\n");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const headingText = (value) => value
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[`*_~]/g, "")
  .trim();

const slugCounts = new Map();
const headings = [];
let inFence = false;

for (const line of markdown.split(/\r?\n/)) {
  if (/^~~~/.test(line)) {
    inFence = !inFence;
    continue;
  }
  if (inFence) continue;
  const match = line.match(/^(#{1,3})\s+(.+)$/);
  if (!match) continue;
  const level = match[1].length;
  const label = headingText(match[2]);
  const base = label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
  const count = slugCounts.get(base) ?? 0;
  slugCounts.set(base, count + 1);
  headings.push({ level, label, id: count ? `${base}-${count + 1}` : base });
}

let headingIndex = 0;
let body = marked.parse(markdown, { gfm: true, breaks: false });
body = body.replace(/<h([1-3])>([\s\S]*?)<\/h\1>/g, (full, level, content) => {
  const heading = headings[headingIndex++];
  if (!heading) return full;
  return `<h${level} id="${heading.id}" tabindex="-1">${content}<a class="heading-anchor" href="#${heading.id}" aria-label="Link to ${escapeHtml(heading.label)}">#</a></h${level}>`;
});

body = body
  .replace(/<pre><code class="language-mermaid">/g, '<div class="diagram-source"><div class="block-label">Architecture diagram</div><pre><code class="language-mermaid">')
  .replace(/<pre><code(?! class="language-mermaid")/g, '<div class="code-block"><button class="copy-code" type="button">Copy</button><pre><code')
  .replace(/<\/code><\/pre>/g, "</code></pre></div>");

const tocItems = headings
  .filter(({ level }) => level === 2 || level === 3)
  .map(({ level, label, id }) => `<li class="toc-level-${level}"><a href="#${id}">${escapeHtml(label)}</a></li>`)
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>ActionDev Master Learning Guide</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f7f5;
      --surface: #ffffff;
      --surface-2: #efefeb;
      --text: #1c1d20;
      --muted: #646870;
      --border: #d9d9d3;
      --accent: #2367d1;
      --accent-soft: #e5efff;
      --code-bg: #17191d;
      --code-text: #eef2f8;
      --mark: #ffe58a;
      --shadow: 0 12px 40px rgba(20, 24, 32, 0.09);
      --sidebar: 310px;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    html[data-theme="dark"] {
      color-scheme: dark;
      --bg: #0c0e12;
      --surface: #13161c;
      --surface-2: #1b1f27;
      --text: #eef1f6;
      --muted: #a5acb8;
      --border: #2a303a;
      --accent: #75a9ff;
      --accent-soft: #182944;
      --code-bg: #080a0e;
      --code-text: #edf2fa;
      --mark: #775f00;
      --shadow: 0 16px 48px rgba(0, 0, 0, 0.34);
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 88px; }
    body { margin: 0; background: var(--bg); color: var(--text); line-height: 1.68; }
    button, input { font: inherit; }
    a { color: var(--accent); text-underline-offset: 0.18em; }

    .progress {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 100;
      height: 3px;
      background: transparent;
    }
    .progress span { display: block; width: 0; height: 100%; background: var(--accent); }

    .topbar {
      position: fixed;
      inset: 3px 0 auto 0;
      z-index: 90;
      height: 61px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      background: color-mix(in srgb, var(--surface) 92%, transparent);
      backdrop-filter: blur(16px);
    }
    .brand { font-weight: 760; letter-spacing: -0.02em; white-space: nowrap; }
    .topbar-spacer { flex: 1; }
    .icon-button, .print-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      height: 38px;
      padding: 0 11px;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
    }
    .icon-button:hover, .print-button:hover { border-color: var(--accent); }
    .menu-button { display: none; }

    .search-wrap { position: relative; width: min(420px, 42vw); }
    .search-wrap input {
      width: 100%;
      height: 38px;
      padding: 0 86px 0 36px;
      border: 1px solid var(--border);
      border-radius: 9px;
      outline: none;
      color: var(--text);
      background: var(--surface-2);
    }
    .search-wrap input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
    .search-icon { position: absolute; left: 12px; top: 8px; color: var(--muted); pointer-events: none; }
    .search-count { position: absolute; right: 9px; top: 9px; color: var(--muted); font-size: 0.78rem; }

    .sidebar {
      position: fixed;
      inset: 64px auto 0 0;
      z-index: 70;
      width: var(--sidebar);
      padding: 20px 12px 40px 18px;
      overflow-y: auto;
      border-right: 1px solid var(--border);
      background: var(--surface);
    }
    .toc-title { margin: 0 8px 12px; color: var(--muted); font-size: 0.76rem; font-weight: 750; letter-spacing: 0.09em; text-transform: uppercase; }
    .toc { margin: 0; padding: 0; list-style: none; }
    .toc li { margin: 1px 0; }
    .toc a {
      display: block;
      padding: 6px 8px;
      border-radius: 7px;
      color: var(--muted);
      font-size: 0.83rem;
      line-height: 1.25;
      text-decoration: none;
    }
    .toc-level-3 a { padding-left: 22px; font-size: 0.78rem; }
    .toc a:hover { color: var(--text); background: var(--surface-2); }
    .toc a.active { color: var(--accent); background: var(--accent-soft); font-weight: 680; }

    .page { margin-left: var(--sidebar); padding: 102px 30px 100px; }
    article { max-width: 900px; margin: 0 auto; }
    article > h1:first-child { margin-top: 0; font-size: clamp(2.1rem, 5vw, 3.7rem); letter-spacing: -0.045em; line-height: 1.03; }
    h1, h2, h3 { position: relative; color: var(--text); line-height: 1.2; }
    h1 { margin: 2.4em 0 0.7em; font-size: 2.3rem; letter-spacing: -0.035em; }
    h2 { margin: 2.4em 0 0.65em; padding-top: 0.2em; font-size: clamp(1.55rem, 3vw, 2.15rem); letter-spacing: -0.028em; border-top: 1px solid var(--border); }
    h3 { margin: 1.9em 0 0.55em; font-size: 1.2rem; letter-spacing: -0.012em; }
    p { margin: 0.7em 0 1em; }
    strong { font-weight: 730; }
    hr { margin: 3rem 0; border: 0; border-top: 1px solid var(--border); }
    .heading-anchor { margin-left: 0.4em; opacity: 0; font-size: 0.7em; text-decoration: none; }
    h1:hover .heading-anchor, h2:hover .heading-anchor, h3:hover .heading-anchor, .heading-anchor:focus { opacity: 1; }

    blockquote {
      margin: 1.5rem 0;
      padding: 0.35rem 1.1rem;
      border-left: 4px solid var(--accent);
      background: var(--accent-soft);
      color: var(--muted);
    }
    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.3rem 0; }
    li::marker { color: var(--accent); }

    table {
      width: 100%;
      margin: 1.5rem 0 2rem;
      border-collapse: collapse;
      font-size: 0.9rem;
      background: var(--surface);
    }
    th, td { padding: 10px 12px; border: 1px solid var(--border); text-align: left; vertical-align: top; }
    th { background: var(--surface-2); font-weight: 720; }
    tr:nth-child(even) td { background: color-mix(in srgb, var(--surface-2) 44%, transparent); }

    :not(pre) > code {
      padding: 0.14em 0.38em;
      border: 1px solid var(--border);
      border-radius: 5px;
      background: var(--surface-2);
      color: var(--text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.88em;
    }
    .code-block, .diagram-source { position: relative; margin: 1.4rem 0 1.8rem; }
    pre {
      margin: 0;
      padding: 18px 20px;
      overflow-x: auto;
      border: 1px solid color-mix(in srgb, var(--border) 60%, #000);
      border-radius: 10px;
      background: var(--code-bg);
      color: var(--code-text);
      box-shadow: var(--shadow);
      tab-size: 2;
    }
    pre code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.84rem; line-height: 1.55; }
    .copy-code {
      position: absolute;
      right: 8px;
      top: 8px;
      z-index: 2;
      padding: 4px 8px;
      border: 1px solid #414854;
      border-radius: 6px;
      color: #d8dee9;
      background: #252a32;
      cursor: pointer;
      font-size: 0.74rem;
    }
    .block-label { margin-bottom: 6px; color: var(--muted); font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    mark { padding: 0 0.08em; background: var(--mark); color: inherit; border-radius: 2px; }
    mark.current { outline: 2px solid var(--accent); }
    .backdrop { display: none; }

    .footer-note { margin: 5rem auto 0; max-width: 900px; color: var(--muted); font-size: 0.82rem; text-align: center; }

    @media (max-width: 900px) {
      .menu-button { display: inline-flex; }
      .print-button { display: none; }
      .sidebar { transform: translateX(-105%); transition: transform 180ms ease; box-shadow: var(--shadow); }
      body.nav-open .sidebar { transform: translateX(0); }
      .backdrop { position: fixed; inset: 64px 0 0; z-index: 60; background: rgba(0, 0, 0, 0.42); }
      body.nav-open .backdrop { display: block; }
      .page { margin-left: 0; padding-inline: 18px; }
      .search-wrap { width: min(100%, 360px); }
      .brand { display: none; }
    }

    @media (max-width: 600px) {
      .topbar { padding-inline: 10px; gap: 8px; }
      .search-wrap { flex: 1; width: auto; }
      .search-wrap input { padding-right: 68px; }
      .page { padding-top: 88px; }
      article > h1:first-child { font-size: 2rem; }
      h2 { font-size: 1.45rem; }
      table { display: block; overflow-x: auto; white-space: normal; }
      pre { border-radius: 8px; padding: 16px 14px; }
    }

    @media print {
      .topbar, .sidebar, .progress, .backdrop, .copy-code, .heading-anchor, .footer-note { display: none !important; }
      .page { margin: 0; padding: 0; }
      article { max-width: none; }
      body { background: #fff; color: #000; font-size: 10pt; }
      h1, h2, h3 { break-after: avoid; }
      pre, table, blockquote { break-inside: avoid; box-shadow: none; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <div class="progress" aria-hidden="true"><span id="progress-bar"></span></div>
  <header class="topbar">
    <button class="icon-button menu-button" id="menu-button" type="button" aria-label="Open table of contents">☰</button>
    <div class="brand">ActionDev Guide</div>
    <div class="search-wrap">
      <span class="search-icon" aria-hidden="true">⌕</span>
      <label class="sr-only" for="guide-search" hidden>Search guide</label>
      <input id="guide-search" type="search" placeholder="Search this guide…" autocomplete="off">
      <span class="search-count" id="search-count" aria-live="polite"></span>
    </div>
    <div class="topbar-spacer"></div>
    <button class="print-button" type="button" id="print-button">Print</button>
    <button class="icon-button" id="theme-button" type="button" aria-label="Toggle color theme">◐</button>
  </header>

  <aside class="sidebar" id="sidebar" aria-label="Table of contents">
    <p class="toc-title">Contents</p>
    <ol class="toc">${tocItems}</ol>
  </aside>
  <button class="backdrop" id="backdrop" type="button" aria-label="Close table of contents"></button>

  <main class="page">
    <article id="guide-content">${body}</article>
    <p class="footer-note">Generated from ActionDev-Master-Learning-Guide.md. This HTML file works without a server.</p>
  </main>

  <script>
    (() => {
      const root = document.documentElement;
      const body = document.body;
      const article = document.getElementById('guide-content');
      const search = document.getElementById('guide-search');
      const searchCount = document.getElementById('search-count');
      const progress = document.getElementById('progress-bar');
      const originalArticle = article.innerHTML;
      let matches = [];
      let currentMatch = -1;
      let headingObserver;

      const tocLinks = new Map(
        [...document.querySelectorAll('.toc a')].map((link) => [link.getAttribute('href').slice(1), link])
      );
      const observeHeadings = () => {
        headingObserver?.disconnect();
        headingObserver = new IntersectionObserver((entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (!visible.length) return;
          document.querySelectorAll('.toc a.active').forEach((link) => link.classList.remove('active'));
          const link = tocLinks.get(visible[0].target.id);
          if (link) {
            link.classList.add('active');
            link.scrollIntoView({ block: 'nearest' });
          }
        }, { rootMargin: '-72px 0px -75% 0px' });
        document.querySelectorAll('article h2, article h3').forEach((heading) => headingObserver.observe(heading));
      };

      const preferredTheme = localStorage.getItem('actiondev-guide-theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      root.dataset.theme = preferredTheme;

      document.getElementById('theme-button').addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        localStorage.setItem('actiondev-guide-theme', next);
      });
      document.getElementById('print-button').addEventListener('click', () => window.print());

      const closeMenu = () => body.classList.remove('nav-open');
      document.getElementById('menu-button').addEventListener('click', () => body.classList.toggle('nav-open'));
      document.getElementById('backdrop').addEventListener('click', closeMenu);
      document.querySelector('.toc').addEventListener('click', (event) => {
        if (event.target.closest('a')) closeMenu();
      });

      document.addEventListener('click', async (event) => {
        const button = event.target.closest('.copy-code');
        if (!button) return;
        const code = button.parentElement.querySelector('code');
        const value = code?.textContent || '';
        try {
          if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
          await navigator.clipboard.writeText(value);
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.append(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy'; }, 1200);
      });

      const updateProgress = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const value = max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0;
        progress.style.width = value + '%';
      };
      addEventListener('scroll', updateProgress, { passive: true });
      addEventListener('resize', updateProgress);
      updateProgress();

      const activateMatch = (index) => {
        if (!matches.length) return;
        matches.forEach((mark) => mark.classList.remove('current'));
        currentMatch = (index + matches.length) % matches.length;
        matches[currentMatch].classList.add('current');
        matches[currentMatch].scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchCount.textContent = (currentMatch + 1) + '/' + matches.length;
      };

      const runSearch = () => {
        article.innerHTML = originalArticle;
        matches = [];
        currentMatch = -1;
        const query = search.value.trim();
        if (query.length < 2) {
          searchCount.textContent = '';
          observeHeadings();
          return;
        }

        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) {
          const parent = walker.currentNode.parentElement;
          if (!parent || parent.closest('pre, code, script, style, .copy-code')) continue;
          nodes.push(walker.currentNode);
        }

        const lowerQuery = query.toLocaleLowerCase();
        for (const node of nodes) {
          const text = node.nodeValue;
          const lower = text.toLocaleLowerCase();
          let cursor = 0;
          let hit = lower.indexOf(lowerQuery, cursor);
          if (hit < 0) continue;
          const fragment = document.createDocumentFragment();
          while (hit >= 0) {
            fragment.append(text.slice(cursor, hit));
            const mark = document.createElement('mark');
            mark.textContent = text.slice(hit, hit + query.length);
            fragment.append(mark);
            cursor = hit + query.length;
            hit = lower.indexOf(lowerQuery, cursor);
          }
          fragment.append(text.slice(cursor));
          node.replaceWith(fragment);
        }

        matches = [...article.querySelectorAll('mark')];
        searchCount.textContent = matches.length ? '1/' + matches.length : '0';
        if (matches.length) activateMatch(0);
        observeHeadings();
      };

      let searchTimer;
      search.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(runSearch, 180);
      });
      search.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && matches.length) {
          event.preventDefault();
          activateMatch(currentMatch + (event.shiftKey ? -1 : 1));
        }
        if (event.key === 'Escape') {
          search.value = '';
          runSearch();
          search.blur();
        }
      });

      observeHeadings();
    })();
  </script>
</body>
</html>`;

await Promise.all(outputPaths.map((outputPath) => writeFile(outputPath, html, "utf8")));
for (const outputPath of outputPaths) console.log(`Generated ${outputPath}`);
