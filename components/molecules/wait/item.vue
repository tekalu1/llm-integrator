<template>
  <div class="flex flex-col items-start justify-start my-2  rounded-lg ">
    <p class="mb-2">
      待機時間
    </p>
    <div class="flex">
      <input
        v-model="waitItem.waitTime"
        type="number"
        placeholder="待機時間を入力してください"
        class="mr-1 px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full" 
      />
      <p>
        ms
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { WaitItem } from '~/types/item/wait';
  const props = defineProps({
      waitItem: {
          type: Object as PropType<WaitItem>,
          default: 0,
      },
  })
</script>