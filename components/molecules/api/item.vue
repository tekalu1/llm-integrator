<template>
    <div v-if="uiStore.getItemDisplayMode(apiItem) === 'default'">
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
    <div v-else-if="uiStore.getItemDisplayMode(apiItem) === 'script'" class="flex flex-col items-start justify-start">
      <label class="inline-flex items-center cursor-pointer p-1">
        <input type="checkbox" v-model="apiItem.isScriptEnabled" class="sr-only peer">
        <div class="relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300"></div>
        <span class="ms-3  dark:text-gray-300">スクリプトを有効にする</span>
      </label>
      <div class="flex flex-col items-start justify-center  p-2 rounded-lg overflow-hidden w-full transition-all duration-200 relative bg-white z-0" :class="apiItem.isScriptEnabled ? '':'pointer-events-none'">
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none bg-black z-10 duration-150 transition-all" :class="apiItem.isScriptEnabled ? 'opacity-0':'opacity-10'">

        </div>
        <div class="flex flex-col items-start justify-start" >
          <button @click="APIExecution.executeScript(apiItem)" class=" hover:bg-gray-200 px-2 rounded-md transition-all duration-150 mb-4" >
            <font-awesome-icon :icon="['fas', 'play']" />
            テスト実行
          </button>
        </div>
        <MonacoEditor v-model="apiItem.script" lang="json" class="h-72 w-full" />
      </div>
    </div>
    <div v-if="uiStore.getItemDisplayMode(apiItem) === 'result'"  class="w-full">
      
      <div v-if="APIExecution.isExecuting" class="flex items-center justify-center p-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500">
            </div>
        </div>
      <div v-if="apiItem.executionResults.length > 0 ">
        <p class="font-bold mb-4">
          最新の実行
        </p>
        <AtomsApiResultCard :execution-result="apiItem.executionResults[apiItem.executionResults.length - 1]" />
      </div>
      
      <div v-if="apiItem.executionResults.length > 1 " class="w-full">
        <AtomsCommonAccordion :id-name="'result-list'" >
          <template v-slot:summary>
            <button class="flex items-center justify-start mt-2 hover:bg-gray-200 p-2 rounded-md transition duration-150">
                <font-awesome-icon :icon="['fas', 'chevron-down']" />
                <p class="font-bold ml-2">
                  過去の実行
                </p>
            </button>
          </template>
          <template v-slot:detail>
            <div  class="flex flex-col-reverse items-center justify-center mt-4 w-full">
              <div v-for="(executionResult, index) in apiItem.executionResults" :key="index" class="mb-2 w-full">
                <div v-if="index !== apiItem.executionResults.length - 1 " class="w-full">
                  <AtomsApiResultCard :execution-result="executionResult" />
                </div>
              </div>
            </div>
          </template>
        </AtomsCommonAccordion>
      </div>
    </div>
</template>

<script setup lang="ts">
  import { type ApiItem } from '@/types/api';
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  const props = defineProps({
      apiItem: {
          type: Object as PropType<ApiItem>,
          default: 0,
      },
  })
  const formatResponse = (response: any) => {
    try {
      return JSON.stringify(response, null, 2);
    } catch {
      return response;
    }
  };
</script>