import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const executeFlow_post = defineEventHandler(async (event) => {
  const { apiItem } = await readBody(event);
  let res = {};
  let retRes = {};
  try {
    console.log(apiItem.id);
    if (!apiItem.endpoint || !/^https?:\/\//.test(apiItem.endpoint)) {
      throw new Error(`\u7121\u52B9\u306A\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u3067\u3059: ${apiItem.endpoint}`);
    }
    const requestOptions = {
      method: apiItem.method,
      headers: apiItem.headers,
      ...apiItem.method !== "GET" && {
        body: apiItem.body ? apiItem.body : void 0
      }
    };
    console.log(JSON.stringify(requestOptions));
    const response = await $fetch(apiItem.endpoint, {
      ...requestOptions,
      onResponse({ response: response2 }) {
        console.log(`Status Code: ${JSON.stringify(response2.status)}`);
        res = response2;
      }
    });
    retRes.status = res.status;
    retRes.data = res._data;
    return { success: true, data: retRes };
  } catch (e) {
    const errorResponse = {
      success: false,
      message: e.message,
      status: e.status,
      response: e.response
    };
    return { success: false, error: errorResponse };
  }
});

export { executeFlow_post as default };
//# sourceMappingURL=execute-flow.post.mjs.map
