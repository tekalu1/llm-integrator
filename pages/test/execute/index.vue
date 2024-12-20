<script setup lang="ts">

const flowStore = useFlowStore();

// // 送信するflowItemとvariablesのダミー例
// const flowItemReactive = ref(flowStore.masterFlow);
// const variablesReactive = ref(flowStore.masterFlow.variables);
// const flowItem = flowItemReactive.value
// const variables = variablesReactive.value

const messages = ref<any[]>([]);
const status = ref('connecting');

// 汎用的なストリーム処理関数
async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onData: (data: any) => void
) {
  const decoder = new TextDecoder("utf-8");
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split('\n');
    buffer = lines.pop() || ''; 

    for (const line of lines) {
      if (line.trim()) {
        const jsonData = JSON.parse(line);
        onData(jsonData);
      }
    }
  }
}

// 元のAPI呼び出し関数
const callApi = async () => {
  try {
    const response = await fetch('/api/execute/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flowItem: flowStore.masterFlow,
        variables: flowStore.masterFlow.variables
      })
    });

    if (!response.body) {
      throw new Error('No response body');
    }

    status.value = 'streaming';

    const reader = response.body.getReader();

    // 汎用処理関数を使用
    await processStream(reader, (jsonData) => {
      console.log('Received:', jsonData);
      messages.value.push(jsonData);
    });

    status.value = 'completed';
  } catch (error: any) {
    status.value = 'error';
    console.error('Streaming error:', error);
  }
};


onMounted(async () => {
  
});
</script>

<template>
    <button @click="callApi" class="border rounded-md px-2 py-1" >
        start
    </button>
    <div>
        <h1>POST + ReadableStream Example</h1>
        <p>Status: {{ status }}</p>
        <ul>
            <li v-for="(m, index) in messages" :key="index">
            {{ m }}
            </li>
        </ul>
    </div>
</template>
