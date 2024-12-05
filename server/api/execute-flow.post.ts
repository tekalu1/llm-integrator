export default defineEventHandler(async (event) => {
  const { apiItem } = await readBody(event);

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
        console.log(`Status Code: ${response.status}`);
      },
    });

    return { success: true, data: response };

  } catch (e: any) {
    const errorResponse = {
      success: false,
      message: e.message,
      status: e.response
    };

    return { success: false, error: errorResponse};
  }
});
