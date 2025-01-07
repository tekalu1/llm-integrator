<template>
      <div class="space-y-2 mb-2">
        <div
          v-for="message in messageQueue.messageQueue"
          :key="message.id"
          :class="getClass(message.type)"
          class="p-4 rounded-lg shadow transition-all duration-300 fade-in-out flex items-center justify-center"
        >
          <p>{{ message.content }}</p>
          <button @click="messageQueue.removeMessage(message.id)" class="underline h-full flex items-center justify-start ml-2">
            <font-awesome-icon class="hover:opacity-50 transition-all duration-300 cursor-pointer"
                :icon="['fas', 'xmark']" />
          </button>
        </div>
      </div>
  </template>
  
  <script setup lang="ts">
  const messageQueue = useMessageQueue();
  
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
    @keyframes fadeInOut {
      0% {
        opacity: 0;
      }
      5% {
        opacity: 1;
      }
      95% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    .fade-in-out {
      animation: fadeInOut 5s ease-in-out forwards; /* 5秒間のアニメーション */
    }


  </style>
  