import assert from "node:assert/strict";
import { createNote, deleteNote, findNotes, noteLabel, orderNotes, sanitizeNotes, updateNote } from "./notes-core.js";

const first = { id: "first", title: "购物清单", content: "咖啡和面包", createdAt: 1, updatedAt: 10 };
const second = { id: "second", title: "会议记录", content: "周五讨论方案", createdAt: 2, updatedAt: 20 };

const created = createNote(100);
assert.equal(created.title, "");
assert.equal(created.updatedAt, 100);
assert.ok(created.id);
assert.deepEqual(orderNotes([first, second]).map((note) => note.id), ["second", "first"]);
assert.equal(updateNote([first], "first", { title: "新标题" }, 30)[0].title, "新标题");
assert.equal(updateNote([first], "first", { title: "新标题" }, 30)[0].updatedAt, 30);
assert.deepEqual(deleteNote([first, second], "first").map((note) => note.id), ["second"]);
assert.deepEqual(findNotes([first, second], "咖啡").map((note) => note.id), ["first"]);
assert.equal(noteLabel({ ...first, title: "  " }), "无标题笔记");
assert.deepEqual(sanitizeNotes([{ id: "ok", title: "x", content: "y", createdAt: 1, updatedAt: 2 }, null]).map((note) => note.id), ["ok"]);

console.log("全部 8 项逻辑测试通过");
