import { d as defineEventHandler, r as readBody, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

useRuntimeConfig();
const execute = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, token } = body;
  const response = await $fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: {
      "model": "gpt-4o-mini",
      "response_format": {
        "type": "json_object"
      },
      "messages": [
        {
          "role": "user",
          "content": `${prompt}`
        }
      ]
    }
  });
  return response;
});

export { execute as default };
//# sourceMappingURL=execute.mjs.map
