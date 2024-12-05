<template>
  <div class="flex flex-col items-start justify-start my-2 rounded-lg w-full ">
    <div class="flex flex-col items-start justify-start w-full">
      <div class="flex flex-col items-start justify-center  p-2 rounded-lg overflow-hidden w-full transition-all duration-200 relative bg-white z-0" >
        <div class="flex flex-col items-start justify-start w-full" >
          <button @click="APIExecution.executeScript(scriptItem)" class=" hover:bg-gray-200 px-2 rounded-md transition-all duration-150 mb-4" >
            <font-awesome-icon :icon="['fas', 'play']" />
            テスト実行
          </button>
        </div>
        <MonacoEditor v-model="scriptItem.script" lang="json" :options="{ scrollbar: {alwaysConsumeMouseWheel: false} }" class="h-72 w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ScriptItem } from '~/types/item/script';
  const uiStore = useUiStore();
  const loopStore = useLoopStore();
  const APIExecution = useAPIExecution();
  const props = defineProps({
    scriptItem: {
          type: Object as PropType<ScriptItem>,
          default: 0,
      },
  })
</script>