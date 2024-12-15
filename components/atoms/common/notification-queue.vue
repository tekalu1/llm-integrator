<template>
    <div class="fixed bottom-4 right-4 space-y-2">
      <div
        v-for="message in messageQueue"
        :key="message.id"
        :class="getClass(message.type)"
        class="p-4 rounded shadow"
      >
        <p>{{ message.content }}</p>
        <button @click="removeMessage(message.id)" class="mt-2 underline">
          閉じる
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useMessageQueue } from '~/composables/useMessageQueue';
  
  const { messageQueue, removeMessage } = useMessageQueue();
  
  // メッセージタイプごとにクラスを切り替える
  function getClass(type: 'error' | 'success' | 'info' | 'warning') {
    switch (type) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
    }
  }
  </script>
  
  <style scoped>
  /* 必要に応じてスタイルをカスタマイズ */
  </style>
  