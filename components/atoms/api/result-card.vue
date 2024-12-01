<script setup lang="ts">
  import { type ExecutionResult } from '~/types/item/flow';
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  const props = defineProps({
    executionResult: {
          type: Object as PropType<ExecutionResult>,
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
<template>
    <div class="flex flex-col items-start justify-center bg-white backdrop-blur-md bg-opacity-50 border-gray-300 border rounded-lg p-2 w-full ">
        <p :class="executionResult.success?'text-green-600':'text-red-600'" class="font-bold">
        {{ executionResult.success ? '成功' : '失敗' }}
        </p>
        <p>
        実行日時：{{ new Date(executionResult.executionDate).toLocaleString() }}
        </p>
        <p>
        実行時間：{{ executionResult.duration }} ms
        </p>
        <AtomsCommonModalWindow>
        <template v-slot:button>
            <button class="hover:underline text-blue-600">
            実行結果を確認する
            </button>
        </template>
        <template v-slot:modal>

            <div class="flex flex-col items-start justify-center">
            <pre v-if="executionResult.success" class="bg-gray-50 p-4 rounded overflow-y-scroll relative w-[600px] max-h-60 text-sm">{{ formatResponse(executionResult.data) }}</pre>
            <p v-if="!executionResult.success">
                エラー内容：{{ executionResult.error }}
            </p>
            </div>
        </template>
        </AtomsCommonModalWindow>
    </div>
</template>