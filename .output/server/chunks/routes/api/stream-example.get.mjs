import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const streamExample_get = defineEventHandler(
  async (event) => {
    const { req, res } = event.node;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`data: ${JSON.stringify({ message: "Connection established" })}

`);
    const intervalId = setInterval(() => {
      const payload = { time: /* @__PURE__ */ new Date() };
      res.write(`data: ${JSON.stringify(payload)}

`);
    }, 1e3);
    req.on("close", () => {
      clearInterval(intervalId);
    });
    return new Promise(() => {
    });
  }
);

export { streamExample_get as default };
//# sourceMappingURL=stream-example.get.mjs.map
