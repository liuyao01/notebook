(() => {
const STORAGE_KEY = "zhijian-notes-v1";
const THEME_KEY = "zhijian-theme-v1";

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function nextTheme(theme) {
  return normalizeTheme(theme) === "light" ? "dark" : "light";
}

function createNote(now = Date.now()) {
  return { id: crypto.randomUUID(), title: "", content: "", createdAt: now, updatedAt: now };
}

function sanitizeNotes(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((note) => note && typeof note.id === "string" && typeof note.title === "string" && typeof note.content === "string")
    .map((note) => ({ ...note, createdAt: Number(note.createdAt) || Date.now(), updatedAt: Number(note.updatedAt) || Date.now() }));
}

function orderNotes(notes) {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

function updateNote(notes, id, changes, now = Date.now()) {
  return notes.map((note) => note.id === id ? { ...note, ...changes, updatedAt: now } : note);
}

function deleteNote(notes, id) {
  return notes.filter((note) => note.id !== id);
}

function findNotes(notes, query) {
  const keywords = query.trim().toLocaleLowerCase();
  if (!keywords) return notes;
  return notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase().includes(keywords));
}

function noteLabel(note) {
  return note.title.trim() || "无标题笔记";
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function renderInline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let codeLines = [];
  let listType = null;
  const closeList = () => { if (listType) { output.push(`</${listType}>`); listType = null; } };
  const closeCode = () => { if (codeLines.length) { output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`); codeLines = []; } };

  for (const line of lines) {
    if (line.startsWith("```")) { if (codeLines.length || output.at(-1) === "<pre-marker>") { closeCode(); } else { output.push("<pre-marker>"); } continue; }
    if (output.at(-1) === "<pre-marker>") { output.pop(); codeLines = []; codeLines.push(line); continue; }
    if (codeLines.length) { codeLines.push(line); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (heading) { closeList(); output.push(`<h${heading[1].length}>${renderInline(heading[2])}</h${heading[1].length}>`); }
    else if (/^\s*([-*_])\1\1+\s*$/.test(line)) { closeList(); output.push("<hr>"); }
    else if (line.startsWith("> ")) { closeList(); output.push(`<blockquote>${renderInline(line.slice(2))}</blockquote>`); }
    else if (unordered || ordered) { const type = unordered ? "ul" : "ol"; if (listType !== type) { closeList(); output.push(`<${type}>`); listType = type; } output.push(`<li>${renderInline((unordered || ordered)[1])}</li>`); }
    else if (!line.trim()) { closeList(); }
    else { closeList(); output.push(`<p>${renderInline(line)}</p>`); }
  }
  if (output.at(-1) === "<pre-marker>") output.pop();
  closeCode(); closeList();
  return output.join("");
}

function highlightMarkdown(markdown) {
  return markdown.split("\n").map((line) => {
    const safe = escapeHtml(line);
    if (/^#{1,6}\s/.test(line)) return `<span class="md-token md-heading">${safe}</span>`;
    if (/^\s*([-*+]\s|\d+\.\s|&gt;\s)/.test(safe)) return `<span class="md-token md-marker">${safe}</span>`;
    return safe.replace(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|!?\[[^\]]*\]\([^)]*\))/g, '<span class="md-token">$1</span>');
  }).join("\n");
}

window.NotesCore = { STORAGE_KEY, THEME_KEY, createNote, deleteNote, findNotes, nextTheme, normalizeTheme, noteLabel, orderNotes, sanitizeNotes, updateNote, renderMarkdown, highlightMarkdown };
})();
