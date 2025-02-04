import { d as defineEventHandler, g as getCookie, c as createError } from '../../../nitro/nitro.mjs';
import jwt from 'jsonwebtoken';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const me_get = defineEventHandler(async (event) => {
  try {
    const adapter = new JSONFile("./server/db/auth.json");
    const db = new Low(adapter, adapter);
    await db.read();
    const token = getCookie(event, "auth_token");
    if (!token) {
      throw createError({
        statusCode: 403,
        statusMessage: "Not authenticated"
      });
    }
    try {
      const decoded = jwt.verify(token, "60a56575f10741403c4a7f0c4ecd71d96dd421f740b3e9b25335493f8a78682a8d701edde79043adc5ad14e41c611fc33506ec77cf2c00d192e9461ce917e635");
      const user = db.data.users.find((u) => u.id === decoded.id);
      if (!user) {
        throw createError({
          statusCode: 404,
          statusMessage: "User not found"
        });
      }
      return { id: user.id, username: user.username, email: user.email };
    } catch (e) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid token"
      });
    }
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server error"
    });
  }
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
