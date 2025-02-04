import { d as defineEventHandler, r as readBody, s as setCookie } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const login_post = defineEventHandler(async (event) => {
  const adapter = new JSONFile("./server/db/auth.json");
  const db = new Low(adapter, adapter);
  await db.read();
  const body = await readBody(event);
  const { username, password } = body;
  if (!username || !password) {
    return { error: "Invalid credentials" };
  }
  const user = db.data.users.find((u) => u.username === username);
  if (!user) {
    return { error: "User not found" };
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { error: "Incorrect password" };
  }
  const token = jwt.sign({ id: user.id, username: user.username }, "60a56575f10741403c4a7f0c4ecd71d96dd421f740b3e9b25335493f8a78682a8d701edde79043adc5ad14e41c611fc33506ec77cf2c00d192e9461ce917e635", {
    expiresIn: "1d"
  });
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24
  });
  return { success: true };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
