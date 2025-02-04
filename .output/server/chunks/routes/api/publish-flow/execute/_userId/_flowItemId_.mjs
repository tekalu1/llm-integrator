import { d as defineEventHandler } from '../../../../../nitro/nitro.mjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync } from 'fs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

async function processStream(reader, onData) {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.trim()) {
        const jsonData = JSON.parse(line);
        onData(jsonData);
      }
    }
  }
}

const _flowItemId_ = defineEventHandler(async (event) => {
  try {
    const { req, res } = event.node;
    const { flowItemId, userId } = event.context.params;
    const dir = "./server/db/publish-flow/";
    const file = dir + userId + ".json";
    let retData = [];
    if (!existsSync(dir)) {
      return { error: "userId not found" };
    }
    console.log("aaa");
    const adapter = new JSONFile(file);
    const db = new Low(adapter, adapter);
    await db.read();
    console.log("db.data : " + JSON.stringify(db.data));
    if (!db.data[flowItemId]) {
      return { error: "Flow not found" };
    }
    const controller = new AbortController();
    const response = await fetch("http://localhost:3000/api/execute/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flowItem: db.data[flowItemId][db.data[flowItemId].length - 1].flowItem,
        variables: db.data[flowItemId][db.data[flowItemId].length - 1].variables
      }),
      signal: controller.signal
    });
    console.log("response : " + JSON.stringify(response));
    const reader = response.body?.getReader();
    await processStream(reader, (jsonData) => {
      console.log("Received:", jsonData);
      retData.push(jsonData);
    });
    return { success: true, response: retData };
  } catch (e) {
    console.error(e);
  }
});

export { _flowItemId_ as default };
//# sourceMappingURL=_flowItemId_.mjs.map
