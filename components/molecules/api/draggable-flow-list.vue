<template>
  <div  class="flex flex-col items-center justify-center w-full">
    <draggable ref="el" v-model="flowItem.flowItems" :animation="150" easing="ease" group="flow" ghostClass="ghost" class=" my-1 w-full flex flex-col items-center justify-center" >
      <template v-for=" (flowItemChild,index) in flowItem.flowItems" :key="flowItem.id" >
          <div class="flex border bg-white bg-opacity-50 border-gray-300 rounded-lg mb-1 w-full overflow-hidden pr-1">
            <AtomsCommonItemLogo :item-type="flowItemChild.type" size="small" />
            <div class="flex flex-col items-start justify-center w-full ml-1">
              <div class="flex items-center justify-center w-full pt-2">
                <div class="flex items-center justify-start flex-grow">
                  <input
                    v-model="flowItemChild.name"
                    type="text"
                    placeholder="Untitled"
                    class="px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full" 
                  />
                </div>
                <div @click="uiStore.setFocusedItemId(flowItemChild.id)" class="hover:bg-gray-200 p-1 rounded-md transition-all duration-150  mr-2">
                  <a :href="'#dynmcwrpr_' + flowItemChild.id"  class="flex items-center justify-center" >
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </a>
                </div>
                <AtomsCommonModalButton class="" >
                  <template v-slot:button>
                    <button class="rounded-md mr-2 hover:bg-gray-200 px-2 py-1 transition-all duration-150 ">
                      <font-awesome-icon :icon="['fas', 'plus']" class="" />
                    </button>
                  </template>
                  <template v-slot:modal>
                    <MoleculesFlowAddItemMenu :flow-item="flowItemChild" />
                  </template>
                </AtomsCommonModalButton>
                <button class="flex items-center justify-center mr-2 hover:bg-gray-200 p-1 rounded-md transition-all duration-150" @click="flowStore.duplicateFlowItem(flowItem,flowItemChild)">
                  <font-awesome-icon :icon="['far', 'clone']" />
                </button>
                <button @click="flowStore.removeFlowItemById(flowItemChild.id)" class="flex items-center justify-center text-red-500 hover:text-red-700  mr-4 hover:bg-gray-200 p-1 rounded-md transition-all duration-150">
                  <font-awesome-icon :icon="['fas', 'xmark']" />
                </button>
              </div>
              <draggable-flow-list :flow-item="flowItemChild" />
            </div>
          </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { type FlowItem } from '@/types/flow';
  const props = defineProps({
    flowItem: {
      type: Object as PropType<FlowItem>,
      required: true
    }
  });
  const uiStore = useUiStore();
  const flowStore = useFlowStore();
  

</script> 