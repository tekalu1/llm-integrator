import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const signup_post = defineEventHandler(async (event) => {
  const dir = "./server/db/";
  const file = dir + "auth.json";
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const adapter = new JSONFile(file);
  const db = new Low(adapter, adapter);
  const body = await readBody(event);
  const { username, password, email } = body;
  if (!username || !password) {
    return { error: "Invalid input" };
  }
  await db.read();
  console.log("db.data : " + JSON.stringify(db.data));
  if (!db.data.users) {
    db.data = { users: [] };
    await db.write();
  }
  const userExists = db.data.users.find((u) => u.username === username);
  if (userExists) {
    return { error: "Username already exists" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: db.data.users.length + 1,
    username,
    password: hashedPassword,
    email
  };
  db.data.users.push(newUser);
  await db.write();
  return { success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email } };
});

export { signup_post as default };
//# sourceMappingURL=signup.post.mjs.map
