<template>
    <draggable ref="el" v-model="flowItem.flowItems" :animation="150" easing="ease" group="flow" ghostClass="ghost" :swapThreshold="0.1" class=" my-[1px] w-full flex flex-col items-center justify-center"   >
      <template v-for=" (flowItemChild,index) in flowItem.flowItems" :key="flowItem.id" >
        <a :href="'#dynmcwrpr_' + flowItemChild.id" class="flex w-full mb-[2px]">
          <div class="flex rounded-lg w-full overflow-hidden pr-1 transition-all duration-150" :class="[uiStore.focusedItemId === flowItemChild.id ? 'border-2 border-blue-500':'border border-gray-200', flowItemChild.isItemActive? 'bg-white':'bg-gray-300']"  @click.stop="uiStore.setFocusedItemId(flowItemChild.id)">
            <AtomsCommonItemLogo :item-type="flowItemChild.type" size="small" />
            <div class="flex flex-col items-start justify-center w-full ml-1">
              <div class="flex items-center justify-center w-full pt-1">
                <div v-if="uiStore.getIsExecutedFlow(flowItemChild.id) === 'Done' && flowItemChild.type === 'api'" class="flex flex-col items-center justify-center">
                  <font-awesome-icon v-if="uiStore.getExecutionResults(flowItemChild.id)[uiStore.getExecutionResults(flowItemChild.id).length - 1]?.success " :icon="['fas', 'circle-check']" class="text-green-600" />
                  <font-awesome-icon v-if="!uiStore.getExecutionResults(flowItemChild.id)[uiStore.getExecutionResults(flowItemChild.id).length - 1]?.success " :icon="['fas', 'circle-exclamation']" class="text-red-600" />
                </div>
                <div v-else-if="uiStore.getIsExecutedFlow(flowItemChild.id) === 'In progress'" class="flex flex-col items-center justify-center">
                  <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-2 w-2 border-b-2 border-green-500">
                    </div>
                  </div>
                </div>
                <div class="flex items-center justify-start flex-grow">
                  <input
                    v-model="flowItemChild.name"
                    type="text"
                    placeholder="Untitled"
                    class="px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full" 
                  />
                </div>
                <AtomsCommonModalButton ref="modalButton" >
                  <template v-slot:button>
                    <button class="rounded-md mr-1 hover:bg-gray-200 px-1 transition-all duration-150 ">
                      <font-awesome-icon :icon="['fas', 'plus']" class="" />
                    </button>
                  </template>
                  <template v-slot:modal>
                    <MoleculesFlowAddItemMenu :flow-item="flowItemChild" @click="closeModal" />
                  </template>
                </AtomsCommonModalButton>
                <button class="flex items-center justify-center mr-1 hover:bg-gray-200 p-1 rounded-md transition-all duration-150" @click="flowStore.duplicateFlowItem(flowItem,flowItemChild)">
                  <font-awesome-icon :icon="['far', 'clone']" />
                </button>
                <button @click="flowStore.removeFlowItemById(flowItemChild.id)" class="flex items-center justify-center text-red-500 hover:text-red-700  mr-4 hover:bg-gray-200 p-1 rounded-md transition-all duration-150">
                  <font-awesome-icon :icon="['fas', 'xmark']" />
                </button>
              </div>
              <MoleculesSideMenuDraggableFlowList :flow-item="flowItemChild" />
            </div>
          </div>
        </a>
      </template>
    </draggable>
</template>

<script setup lang="ts">
import { type FlowItem } from '~/types/item/flow';
  const props = defineProps({
    flowItem: {
      type: Object as PropType<FlowItem>,
      required: true
    }
  });

  const uiStore = useUiStore();
  const flowStore = useFlowStore();


  const modalButton = ref<HTMLElement | null>(null);

  function closeModal() {
      if (modalButton.value) {
        console.log(JSON.stringify(modalButton.value))
        modalButton.value.changeVisibility(); // 子コンポーネントのメソッドを実行
      }
  }

</script> 