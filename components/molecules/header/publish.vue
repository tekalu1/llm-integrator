<script setup lang="ts">
const flowStore = useFlowStore();
const authStore = useAuthStore()
const url = useRequestURL()

const status = ref('')
const isFlowRegistered = ref(false)

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

const existCheck = async () => {
  await authStore.fetchUser()
  const { data, error} = await useFetch('/api/publish-flow/exist-check/' + authStore.user.id + '/' + flowStore.masterFlow.id, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if(data.value.success){
    isFlowRegistered.value = true
  }else{
    isFlowRegistered.value = false
  }
}


onMounted(async () => {
  await existCheck()
});
</script>

<template>
  
  <AtomsCommonModalButton modal-possition-horizonal="right" >
    <template v-slot:button >
      <button @click="existCheck()" class="px-4 py-2 text-white rounded-xl font-bold border border-gray-300 bg-gradient-to-r from-[#6e7af8] from-5% via-[#6c56e4] via-30% to-[#842ff7] to-80% transition duration-300 hover:shadow-[0px_0px_12px_0px_rgb(255,255,255,1)]" >
        公開する
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </button>
    </template>
    <template v-slot:modal >
      <button @click="register" v-if="!isFlowRegistered" class="border border-gray-200 hover:border-[#842ff7] transition-all duration-200 rounded-2xl px-2 py-1 mb-2" >
          登録
      </button>
      <div v-if="isFlowRegistered" class="mb-8 max-w-96">
        <p>
          エンドポイント
        </p>
        
        <p v-if="authStore.user" >
          {{ url.protocol + '//' + url.host + '/api/publish-flow/execute/' + authStore.user.id + '/' + flowStore.masterFlow.id }}
        </p>
      </div>
      <button @click="publish" v-if="isFlowRegistered" class="border border-gray-200 hover:border-[#842ff7] transition-all duration-200 rounded-2xl px-2 py-1 mb-2" >
          テスト実行
      </button>
      <div class="overflow-auto border w-96">
          {{ JSON.stringify(responseExecute) }}
      </div>
    </template>
  </AtomsCommonModalButton>
</template>
