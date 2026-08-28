import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sandbox = { window: {}, crypto: globalThis.crypto };
vm.runInNewContext(fs.readFileSync(new URL("./notes-core.js", import.meta.url), "utf8"), sandbox);
const { createNote, deleteNote, findNotes, highlightMarkdown, nextTheme, normalizeTheme, noteLabel, orderNotes, renderMarkdown, sanitizeNotes, updateNote } = sandbox.window.NotesCore;

const first = { id: "first", title: "购物清单", content: "咖啡和面包", createdAt: 1, updatedAt: 10 };
const second = { id: "second", title: "会议记录", content: "周五讨论方案", createdAt: 2, updatedAt: 20 };

const created = createNote(100);
assert.equal(created.title, "");
assert.equal(created.updatedAt, 100);
assert.ok(created.id);
assert.deepEqual(Array.from(orderNotes([first, second]), (note) => note.id), ["second", "first"]);
assert.equal(updateNote([first], "first", { title: "新标题" }, 30)[0].title, "新标题");
assert.equal(updateNote([first], "first", { title: "新标题" }, 30)[0].updatedAt, 30);
assert.deepEqual(Array.from(deleteNote([first, second], "first"), (note) => note.id), ["second"]);
assert.deepEqual(Array.from(findNotes([first, second], "咖啡"), (note) => note.id), ["first"]);
assert.equal(noteLabel({ ...first, title: "  " }), "无标题笔记");
assert.deepEqual(Array.from(sanitizeNotes([{ id: "ok", title: "x", content: "y", createdAt: 1, updatedAt: 2 }, null]), (note) => note.id), ["ok"]);
assert.equal(normalizeTheme("dark"), "dark");
assert.equal(normalizeTheme("invalid"), "light");
assert.equal(nextTheme("light"), "dark");
assert.equal(nextTheme("dark"), "light");
assert.match(renderMarkdown("# 标题\n\n**重点** 和 [链接](https://example.com)"), /<h1>标题<\/h1>.*<strong>重点<\/strong>.*<a href="https:\/\/example\.com"/s);
assert.match(renderMarkdown("<script>alert(1)</script>"), /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
assert.match(highlightMarkdown("# 标题\n**粗体**"), /md-heading.*md-token/s);

console.log("全部 15 项逻辑测试通过");
