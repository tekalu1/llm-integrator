<script setup lang="ts">
const flowStore = useFlowStore();
const authStore = useAuthStore()
const url = useRequestURL()

const status = ref('')

const responseRegister = ref()
const responseExecute = ref()

const register = async () => {
  try {
    await authStore.fetchUser()

    if(authStore.user.id){
      responseRegister.value = await fetch('/api/publish-flow/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowItem: flowStore.masterFlow,
          variables: flowStore.masterFlow.variables,
          userId: authStore.user.id
        })
      });

      if (!responseRegister.value.body) {
        throw new Error('No response body');
      }

      status.value = 'streaming';

      // const reader = response.body.getReader();

      // // 汎用処理関数を使用
      // await processStream(reader, (jsonData) => {
      //   console.log('Received:', jsonData);
      //   messages.value.push(jsonData);
      // });

      status.value = 'completed';

    }

  } catch (error: any) {
    status.value = 'error';
    console.error('Streaming error:', error);
  }
};

// 元のAPI呼び出し関数
const publish = async () => {
  try {
    await authStore.fetchUser()

    if(authStore.user.id){
      const { data, error: fetchError } = await useFetch('/api/publish-flow/execute/' + authStore.user.id + '/' + flowStore.masterFlow.id, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      responseExecute.value = data
      console.log(JSON.stringify(data))
      // if (!responseExecute.value.body) {
      //   throw new Error('No response body');
      // }

      // status.value = 'streaming';

      // const reader = response.body.getReader();

      // // 汎用処理関数を使用
      // await processStream(reader, (jsonData) => {
      //   console.log('Received:', jsonData);
      //   messages.value.push(jsonData);
      // });

      // status.value = 'completed';

    }

  } catch (error: any) {
    status.value = 'error';
    console.error('Streaming error:', error);
  }
};


onMounted(async () => {
  
});
</script>

<template>
  <button @click="register" class="border border-gray-200 hover:border-[#842ff7] transition-all duration-200 rounded-2xl px-2 py-1 mb-2" >
      登録
  </button>
  <div class="mb-8 max-w-96">
    <p>
      エンドポイント
    </p>
    
    <p v-if="authStore.user" >
      {{ url.protocol + '//' + url.host + '/api/publish-flow/execute/' + authStore.user.id + '/' + flowStore.masterFlow.id }}
    </p>
  </div>
  <button @click="publish" class="border border-gray-200 hover:border-[#842ff7] transition-all duration-200 rounded-2xl px-2 py-1 mb-2" >
      テスト実行
  </button>
  <div class="h-96 overflow-auto border w-96">
      {{ JSON.stringify(responseExecute) }}
  </div>
</template>
