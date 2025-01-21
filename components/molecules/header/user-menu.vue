<template>
  <div class="w-full h-full rounded-2xl flex flex-col justify-center items-center z-10 p-2">
    <div class="flex items-center justify-center">
      
      <div class="bg-white text-[#842ff7] text-xl aspect-square px-2 py-1 rounded-full border mr-2">
        <font-awesome-icon :icon="['fas', 'user']" />
      </div>
      <div class="flex flex-col items-start justify-center">
        <p v-if="authStore.user" class="text-sm">
          {{ authStore.user.username }}
        </p>
        <p v-if="authStore.user" class="text-gray-500">
          {{ authStore.user.email }}
        </p>
      </div>

    </div>
    <button class="w-full hover:bg-gray-200 m-1 px-2 py-1 rounded-sm text-red-500 font-bold mt-2" @click="onClickLogout">
      ログアウト
    </button>
  </div>
</template>

<script setup lang="ts">
  const flowStore = useFlowStore();
  const authStore = useAuthStore();

  const error = ref(null)

  const onClickLogout = async () => {
        error.value = null
        try {
          const { data, error: fetchError } = await useFetch('/api/auth/logout', {
              method: 'POST',
              body: {  }
          })
          if (fetchError.value) {
              error.value = fetchError.value.data.error
              return
          }
          // ログイン成功後、ユーザー情報を取得
          await authStore.fetchUser()
          navigateTo('/login')
        } catch (e) {
          error.value = 'An error occurred'
        }
    }

  onMounted(() => {
    document.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setDragImage(new Image(), 0, 0); // 空の画像をセットして非表示にする
    });
  });

</script> 