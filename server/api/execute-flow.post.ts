export default defineEventHandler(async (event) => {
  const { apiItem } = await readBody(event);

  let res = {}
  let retRes = {}

  try {
    console.log(apiItem.id);

    if (!apiItem.endpoint || !/^https?:\/\//.test(apiItem.endpoint)) {
      throw new Error(`無効なエンドポイントです: ${apiItem.endpoint}`);
    }

    const requestOptions = {
      method: apiItem.method,
      headers: apiItem.headers,
      ...(apiItem.method !== 'GET' && {
        body: apiItem.body ? apiItem.body : undefined,
      }),
    };

    console.log(requestOptions);

    const response = await $fetch(apiItem.endpoint, {
      ...requestOptions,
      onResponse({ response }) {
        console.log(`Status Code: ${JSON.stringify(response.status)}`);
        res = response
      },
    });
    retRes.status = res.status
    retRes.data = res._data
    return { success: true, data: retRes };

  } catch (e: any) {
    const errorResponse = {
      success: false,
      message: e.message,
      status: e.status,
      response: e.response
    };

    return { success: false, error: errorResponse};
  }
});
