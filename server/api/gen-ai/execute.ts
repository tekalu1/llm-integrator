const runtimeConfig = useRuntimeConfig()
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { prompt, token } = body

    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: {
            "model": "gpt-4o-mini", 
            "response_format":{
                "type": "json_object"
            },
            "messages": [
                {
                "role": "user",
                "content": `${prompt}`
                }
            ]
        },
    });

    return response;
});