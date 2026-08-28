export const STORAGE_KEY = "zhijian-notes-v1";

export function createNote(now = Date.now()) {
  return { id: crypto.randomUUID(), title: "", content: "", createdAt: now, updatedAt: now };
}

export function sanitizeNotes(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((note) => note && typeof note.id === "string" && typeof note.title === "string" && typeof note.content === "string")
    .map((note) => ({ ...note, createdAt: Number(note.createdAt) || Date.now(), updatedAt: Number(note.updatedAt) || Date.now() }));
}

export function orderNotes(notes) {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function updateNote(notes, id, changes, now = Date.now()) {
  return notes.map((note) => note.id === id ? { ...note, ...changes, updatedAt: now } : note);
}

export function deleteNote(notes, id) {
  return notes.filter((note) => note.id !== id);
}

export function findNotes(notes, query) {
  const keywords = query.trim().toLocaleLowerCase();
  if (!keywords) return notes;
  return notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase().includes(keywords));
}

export function noteLabel(note) {
  return note.title.trim() || "无标题笔记";
}
