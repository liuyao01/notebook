import { STORAGE_KEY, THEME_KEY, createNote, deleteNote, findNotes, nextTheme, normalizeTheme, noteLabel, orderNotes, sanitizeNotes, updateNote } from "./notes-core.js";

const elements = {
  newButton: document.querySelector("#new-note"), emptyNewButton: document.querySelector("#empty-new-note"),
  deleteButton: document.querySelector("#delete-note"), search: document.querySelector("#search-input"),
  list: document.querySelector("#note-list"), count: document.querySelector("#note-count"),
  title: document.querySelector("#note-title"), content: document.querySelector("#note-content"),
  updatedAt: document.querySelector("#updated-at"), status: document.querySelector("#save-status"),
  themeToggle: document.querySelector("#theme-toggle"), themeLabel: document.querySelector("#theme-label"),
  fields: document.querySelector("#editor-fields"), empty: document.querySelector("#empty-state"), template: document.querySelector("#note-item-template"),
};

let notes = loadNotes();
let selectedId = orderNotes(notes)[0]?.id ?? null;
let saveTimer;
let theme = normalizeTheme(localStorage.getItem(THEME_KEY));

function loadNotes() {
  try { return sanitizeNotes(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return []; }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  elements.status.textContent = "已保存";
}

function applyTheme() {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#1e211f" : "#f6f4ef";
  elements.themeToggle.setAttribute("aria-pressed", String(isDark));
  elements.themeToggle.title = isDark ? "切换浅色模式" : "切换深色模式";
  elements.themeToggle.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
  elements.themeLabel.textContent = isDark ? "浅色模式" : "深色模式";
}

function selectedNote() { return notes.find((note) => note.id === selectedId); }

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(timestamp);
}

function render() {
  const selected = selectedNote();
  const visibleNotes = orderNotes(findNotes(notes, elements.search.value));
  elements.list.replaceChildren();
  elements.count.textContent = notes.length;
  visibleNotes.forEach((note) => {
    const item = elements.template.content.firstElementChild.cloneNode(true);
    item.dataset.id = note.id;
    item.classList.toggle("selected", note.id === selectedId);
    item.querySelector(".note-item-title").textContent = noteLabel(note);
    item.querySelector(".note-item-preview").textContent = note.content.trim() || "暂无内容";
    item.querySelector(".note-item-date").textContent = formatDate(note.updatedAt);
    item.addEventListener("click", () => { selectedId = note.id; render(); elements.title.focus(); });
    elements.list.append(item);
  });
  elements.empty.hidden = Boolean(selected);
  elements.fields.hidden = !selected;
  elements.deleteButton.hidden = !selected;
  if (selected) {
    elements.title.value = selected.title;
    elements.content.value = selected.content;
    elements.updatedAt.textContent = `最后编辑于 ${formatDate(selected.updatedAt)}`;
  }
}

function addNote() {
  const note = createNote();
  notes = [note, ...notes];
  selectedId = note.id;
  persist(); render(); elements.title.focus();
}

function queueSave() {
  const current = selectedNote();
  if (!current) return;
  elements.status.textContent = "保存中…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    notes = updateNote(notes, current.id, { title: elements.title.value, content: elements.content.value });
    persist(); render();
  }, 250);
}

elements.newButton.addEventListener("click", addNote);
elements.emptyNewButton.addEventListener("click", addNote);
elements.search.addEventListener("input", render);
elements.themeToggle.addEventListener("click", () => {
  theme = nextTheme(theme);
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
});
elements.title.addEventListener("input", queueSave);
elements.content.addEventListener("input", queueSave);
elements.deleteButton.addEventListener("click", () => {
  const current = selectedNote();
  if (!current || !confirm(`要删除“${noteLabel(current)}”吗？`)) return;
  notes = deleteNote(notes, current.id);
  selectedId = orderNotes(notes)[0]?.id ?? null;
  persist(); render();
});
window.addEventListener("beforeunload", () => {
  if (!saveTimer) return;
  clearTimeout(saveTimer);
  const current = selectedNote();
  if (!current) return;
  notes = updateNote(notes, current.id, { title: elements.title.value, content: elements.content.value });
  persist();
});

applyTheme();
render();
