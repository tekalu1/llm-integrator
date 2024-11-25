<template>
  <div class="flex flex-col items-start justify-start my-2 w-full  overflow-hidden bg-white bg-opacity-50 border-gray-300 border rounded-2xl p-1">
    <!-- leftSide -->
    <div class="flex justify-center items-center bg-white bg-opacity-50 border-gray-300 border rounded-xl px-2 py-1 mb-2">
      <div v-if="typeof condition.leftSide === 'object'">
        <MoleculesCondition :condition="condition.leftSide" />
      </div>
      <div v-else>
        <input v-model="condition.leftSide" class="outline-none" placeholder="値を入力してください" />
      </div>
      <AtomsCommonModalButton >
        <template v-slot:button >
          <button class=" hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150">
            <font-awesome-icon :icon="['fas', 'chevron-down']" />
          </button>
        </template>
        <template v-slot:modal >
          <div class="bg-white rounded-md flex flex-col items-start justify-center">
            <button @click="flowStore.changeConditionType(condition, 'condition', 'left')" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                条件分岐をネスト
              </p>
            </button>
            <button @click="flowStore.changeConditionType(condition, 'string', 'left')" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                文字列
              </p>
            </button>
            <button @click="flowStore.changeConditionType(condition, 'number', 'left')" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                数値
              </p>
            </button>
            <button @click="flowStore.resetCondition(condition)" class="px-2 py-2  hover:bg-gray-200 text-red-500 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                条件をリセット
              </p>
            </button>
          </div>
        </template>
      </AtomsCommonModalButton>
    </div>
    <!-- 演算子 -->
    <div class="flex justify-center items-center mb-2">
      <select
        v-model="condition.comparisonOperator"
        class="flex justify-center items-center px-2 py-1 outline-none rounded border text-center"
      >
        <option v-for="(operator, index) in operators" :value="operator" :key="index" class="flex justify-center items-center">
          {{ operator }}
        </option>
      </select>
    </div>
    <!-- rightSide -->
     
    <div class="flex justify-center items-center bg-white bg-opacity-50 border-gray-300 border rounded-xl px-2 py-1">
      <div v-if="typeof condition.rightSide === 'object'">
        <MoleculesCondition :condition="condition.rightSide" />
      </div>
      <div v-else>
        <input v-model="condition.rightSide" class="outline-none" placeholder="値を入力してください" />
      </div>
      <AtomsCommonModalButton >
        <template v-slot:button >
          <button class=" hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150">
            <font-awesome-icon :icon="['fas', 'chevron-down']" />
          </button>
        </template>
        <template v-slot:modal >
          <div class="bg-white rounded-md flex flex-col items-start justify-center">
            <button @click="flowStore.changeConditionType(condition, 'condition', 'right')" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                条件分岐をネスト
              </p>
            </button>
            <button @click="flowStore.changeConditionType(condition, 'string', 'right')" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                文字列
              </p>
            </button>
            <button @click="flowStore.changeConditionType(condition, 'number', 'right')" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                数値
              </p>
            </button>
            <button @click="flowStore.resetCondition(condition)" class="px-2 py-2  hover:bg-gray-200 text-red-500 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
              <p class="max-xl:hidden ml-2">
                条件をリセット
              </p>
            </button>
          </div>
        </template>
      </AtomsCommonModalButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type Condition } from '@/types/condition';
  const operators = ref([
    '&','|','=','!=','<','>','>=','<=','contain'
  ])
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  const flowStore = useFlowStore();
  const props = defineProps({
      condition: {
          type: Object as PropType<Condition>,
          default: 0,
      },
  })
</script>