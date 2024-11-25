<script setup lang="ts">
  const flowStore = useFlowStore();
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  import { type FlowItem } from '@/types/flow';

  const props = defineProps({
    flowItem: {
      type: Object as PropType<FlowItem>,
      required: true
    }
  });
</script>
<template>
  <div class="p-2 rounded-2xl  mt-2 overflow-hidden transition-all duration-150" :class="[flowItem.isItemActive ? 'bg-white bg-opacity-50 ':'bg-black bg-opacity-10', uiStore.focusedItemId === flowItem.id ? 'border-2 border-blue-500':'border border-gray-300']" @click.stop="uiStore.setFocusedItemId(flowItem.id)" >
    <AtomsCommonDynamicSizeWrapper :id-name="'dynmcwrpr_' + flowItem.id">
      <div v-if="flowItem" class="w-full">
        <div class="flex items-center justify-center mb-4">
          <AtomsCommonItemLogo :item-type="flowItem.type" :rounded="true" />
          <div class="flex items-center justify-start flex-grow">
            <input
              v-model="flowItem.name"
              type="text"
              placeholder="Untitled"
              class="px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full" 
            />
          </div>
          <!-- 実行ボタン -->
          <div class="pr-2 py-1 flex items-center justify-center h-full">
            <button @click="APIExecution.runFlow(flowItem); uiStore.setItemDisplayMode(flowItem.id, 'result') "  :class="flowItem.isItemActive ? '':'pointer-events-none opacity-40'" class="group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 px-2 flex flex-col items-center justify-center">
              <div class="flex items-center justify-center">
                <img src="~/assets/play.svg" class="w-8" />
                <div class="mr-4">
                  実行
                  <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div>
                </div>
              </div>
            </button>
          </div>
          <!-- フローの有効化・無効化トグル -->
          <label class="inline-flex items-center cursor-pointer mt-1 mr-4 p-1">
            <input type="checkbox" v-model="flowItem.isItemActive" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300"></div>

          </label>
          <button @click="flowStore.removeFlowItemById(flowItem.id)" class="px-2 m-1">
            <p class=" text-red-500 hover:text-red-700 text-lg transition-all duration-200">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </p>
          </button>

        </div>
        
        <div  v-if="flowItem.type === 'api'" class="flex w-full justify-start items-center mb-4 px-2">
          <button v-if="flowItem.type === 'api'" @click="uiStore.setItemDisplayMode(flowItem.id,'request')" class="mr-4 flex flex-col items-center justify-center">
            <p>
              リクエスト
            </p>
            <div :class="uiStore.getItemDisplayMode(flowItem.id) == 'request' ? ' opacity-100' : ' opacity-0' " class="w-full h-[2px] bg-[#842ff7] rounded-md transition-all duration-500">

            </div>
          </button>
          <button v-if="flowItem.type === 'api'" @click="uiStore.setItemDisplayMode(flowItem.id,'script')" class="mr-4 flex flex-col items-center justify-center">
            <p>
              スクリプト
            </p>
            <div :class="uiStore.getItemDisplayMode(flowItem.id) == 'script' ? ' opacity-100' : ' opacity-0' " class="w-full h-[2px] bg-[#842ff7] rounded-md transition-all duration-500">
            </div>
          </button>
          <button v-if="flowItem.type === 'api'" @click="uiStore.setItemDisplayMode(flowItem.id,'result')" class="mr-4 flex flex-col items-center justify-center ">
            <p>
              実行結果
            </p>
            <div :class="uiStore.getItemDisplayMode(flowItem.id) == 'result' ? ' opacity-100' : ' opacity-0' " class="w-full h-[2px] bg-[#842ff7] rounded-md transition-all duration-500">
            </div>
          </button>
        </div>
        <div v-if="flowItem.type == 'api'">
          <MoleculesApiItem :api-item="flowItem" />
        </div>
        <div v-if="flowItem.type == 'condition'">
          <MoleculesConditionItem :condition-item="flowItem" />
        </div>
        <AtomsCommonModalButton class="mt-4 " >
          <template v-slot:button>
            <button class="rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white px-3 py-1 transition duration-100 ">
              <font-awesome-icon :icon="['fas', 'plus']" class="" />
              子アイテムを追加
            </button>
          </template>
          <template v-slot:modal>
            <div class="flex flex-col items-center justify-center w-full">
              <button @click="flowStore.addFlowItem(flowItem.flowItems)" class="rounded-sm px-2  hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1" >
                <AtomsCommonItemLogo item-type="flow" size="small" :rounded="true" />
                <p class="ml-2">
                  Flow
                </p>
              </button>
              <button @click="flowStore.addApiItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
                <AtomsCommonItemLogo item-type="api" size="small" :rounded="true" />
                <p class="ml-2">
                  APIリクエスト
                </p>
              </button>
              <button @click="flowStore.addConditionItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
                <AtomsCommonItemLogo item-type="condition" size="small" :rounded="true" />
                <p class="ml-2">
                  条件
                </p>
              </button>
            </div>
          </template>
        </AtomsCommonModalButton>
        <div v-for="(flowItemChild, index) in flowItem.flowItems" :key="flowItemChild.id">
          <OrganismsFlowItem :flow-item="flowItemChild" />
        </div>
      </div>

    </AtomsCommonDynamicSizeWrapper>
  </div>
</template>