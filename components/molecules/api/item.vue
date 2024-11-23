<template>
    <div v-if="uiStore.getItemDisplayMode(apiItem.id) === 'request'">
      <div class="flex items-center justify-start my-2 w-full  rounded-lg border overflow-hidden">
        <div class="border-r border-gray-200">
          <select
            v-model="apiItem.method"
            class="w-full py-1 px-2 outline-none font-bold"
            :style="{ color: uiStore.methodColor[apiItem.method] }"
          >
            <option class="bg-white text-[#183153]">GET</option>
            <option class="bg-white text-[#183153]">POST</option>
            <option class="bg-white text-[#183153]">PUT</option>
            <option class="bg-white text-[#183153]">DELETE</option>
          </select>
        </div>
        <input v-model="apiItem.endpoint" placeholder="endpoint" class="flex-grow outline-none px-2 py-1" />
      </div>
      <div class="mt-6 mb-4 w-full flex justify-start items-center">
        <p class="mr-6">
          入力モード
        </p>
        <button @click="uiStore.setEditModeStatus(apiItem.id,'form')" :class="uiStore.getEditModeStatus(apiItem.id) === 'form' ? 'bg-[#842ff7]  text-white' : ''" class="mr-1 px-3 py-1 rounded-2xl transition-all duration-300">
          Form
        </button>
        <button @click="uiStore.setEditModeStatus(apiItem.id,'code')" :class="uiStore.getEditModeStatus(apiItem.id) === 'code' ? 'bg-[#842ff7]  text-white  ' : ''" class="px-3 py-1 rounded-2xl transition-all duration-300">
          Raw
        </button>
      </div>
      <MoleculesApiFormEditor v-if="uiStore.getEditModeStatus(apiItem.id) === 'form'" :api-item="apiItem" />
      <MoleculesApiCodeEditor v-else-if="uiStore.getEditModeStatus(apiItem.id) === 'code'" :api-item="apiItem" />
    </div>
    <div v-else-if="uiStore.getItemDisplayMode(apiItem.id) === 'script'" class="flex flex-col items-start justify-start">
      <label class="inline-flex items-center cursor-pointer p-1">
        <input type="checkbox" v-model="apiItem.isScriptEnabled" class="sr-only peer">
        <div class="relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300"></div>
        <span class="ms-3  dark:text-gray-300">スクリプトを有効にする</span>
      </label>
      <div class="flex flex-col items-start justify-center bg-white p-2 rounded-lg overflow-hidden w-full">
        <div class="flex items-center justify-start" >
          <p class="m-2">
            スクリプト
          </p>
          <button @click="APIExecution.executeScript(apiItem)" >
            テスト実行
          </button>
        </div>
        <MonacoEditor v-model="apiItem.script" lang="json" class="h-72 w-full" />
      </div>
    </div>
    <div v-if="uiStore.getItemDisplayMode(apiItem.id) === 'result'">
      <div v-for="(executionResult, index) in apiItem.executionResults" :key="index">
        {{ executionResult }}
      </div>
    </div>
</template>

<script setup lang="ts">
  import { type ApiItem } from '@/types/ApiItem';
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  const props = defineProps({
      apiItem: {
          type: Object as PropType<ApiItem>,
          default: 0,
      },
  })
</script>