<template>
  <div class="w-full h-full  rounded-2xl flex flex-col justify-center items-center z-10">
      <div class="w-full flex items-start justify-center h-full">
        <div class="flex-grow">
          <div v-if="flowStore.savedFlowItems.length > 0">
              <draggable ref="el" v-model="flowStore.savedFlowItems" :animation="150" easing="ease" class=" m-1" >
                <template v-for="(savedFlow, index) in flowStore.savedFlowItems" :key="savedFlow.id"  >
                  <div  class="px-2 py-1 cursor-pointer group/flow flex justify-center items-center ">
                    <div class="flex flex-col justify-center items-center rounded-lg px-3 py-1 hover:bg-opacity-10" @click="flowStore.loadFlow(savedFlow)"  :class="savedFlow.id === flowStore.uuuidOfLoadedSavedFlow ? 'bg-white  text-[#842ff7] shadow-[1px_1px_3px_0px_rgb(0,0,0,0.1)]  bg-opacity-100 hover:bg-opacity-80':'bg-black  bg-opacity-0 '">
                      <div class="font-medium">
                        <p v-if="savedFlow.flowItem?.name">
                          {{ savedFlow.flowItem?.name }}
                        </p>
                        <p v-else class="text-gray-500 font-normal">
                          Untitled
                        </p>
                      </div>
                      <!-- <div class="text-sm ">{{ savedFlow.flowItem?.description }}</div> -->
                      <div class="text-xs ">
                        更新日: {{ new Date(savedFlow.updatedAt).toLocaleString() }}
                      </div>
                    </div>
                    <AtomsCommonComfirmDialog bg-color="white">
                      <template v-slot:modal>
                        <div class="px-4 py-4 w-full h-full flex flex-col justify-center items-center">
                          <p class="mb-5">
                            削除してもよろしいですか？
                          </p>

                        </div>

                      </template>
                      
                      <template v-slot:yes>
                        <button 
                          @click="flowStore.deleteSavedFlow(index)"
                          class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300 mr-5">
                          はい
                        </button>
                      </template>
                      <template v-slot:no>
                        <button 
                          class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300">
                          いいえ
                        </button>
                      </template>
                      <template v-slot:button >
                        <button 
                          class="flex items-center justify-end ml-3"
                        >
                          <p class=" text-red-500 hover:text-red-700 text-sm transition-all duration-200">
                            <font-awesome-icon :icon="['fas', 'trash-can']" />
                          </p>
                        </button>
                      </template>
                    </AtomsCommonComfirmDialog>

                  </div>
                </template>
              </draggable>
            </div>
            
          </div>
        </div>
  </div>
</template>

<script setup lang="ts">
  const flowStore = useFlowStore();
  onMounted(() => {
    document.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setDragImage(new Image(), 0, 0); // 空の画像をセットして非表示にする
    });
  });

</script> 