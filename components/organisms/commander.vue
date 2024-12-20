<template>
    <div class=" bg-white border-gray-300 border rounded-2xl px-2 flex justify-center items-center z-10 shadow-[4px_4px_24px_0px_rgb(0,0,0,0.2)] pointer-events-auto">
      <button @click="APIExecution.runFlow(flowStore.masterFlow); uiStore.setItemDisplayMode(flowStore.masterFlow, 'result');" class="group overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center" :class="APIExecution.isExecuting ? 'pointer-events-none text-gray-300':''">
        <div class="flex items-center justify-center px-4">
          <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
          <div class="">
            実行
            <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <button @click="APIExecution.stopFlow();" class="group overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center" :class="!APIExecution.isExecuting ? 'pointer-events-none text-gray-300':''">
        <div class="flex items-center justify-center px-4">
          <font-awesome-icon :icon="['fas', 'stop']" class="mr-2" />
          <div class="">
            停止
            <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <div class="bg-gray-300 w-[1px] h-8 mx-1">
      </div>
      <button class="group/flow overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center" @click="uiStore.setItemDisplayMode(flowStore.masterFlow, 'default')">
        <div class="flex items-center justify-center">
          <!-- <img src="~/assets/play.svg" class="w-8" /> -->
          <div class="">
            フロー
            <div :class="uiStore.getItemDisplayMode(flowStore.masterFlow) === 'flow' ? 'opacity-100 bg-[#842ff7] w-full': 'opacity-0 '" class="group-hover/flow:bg-[#842ff7]  w-0 group-hover/flow:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <button class="group/result overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center" @click="uiStore.setItemDisplayMode(flowStore.masterFlow, 'result')">
        <div class="flex items-center justify-center">
          <!-- <img src="~/assets/play.svg" class="w-8" /> -->
          <div class="">
            実行結果
            <div :class="uiStore.getItemDisplayMode(flowStore.masterFlow) === 'result' ? 'opacity-100 bg-[#842ff7] w-full': 'opacity-0 '" class="group-hover/result:bg-[#842ff7]  w-0 group-hover/result:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <AtomsCommonModalWindow>
        <template v-slot:button>
          <button class="group/history overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center" @click="uiStore.setItemDisplayMode(flowStore.masterFlow, 'history')">
            <div class="flex items-center justify-center">
              <!-- <img src="~/assets/play.svg" class="w-8" /> -->
              <div class="">
                バージョン履歴
                <div :class="uiStore.getItemDisplayMode(flowStore.masterFlow) === 'history' ? 'opacity-100 bg-[#842ff7] w-full': 'opacity-0 '" class="group-hover/history:bg-[#842ff7] w-0 group-hover/history:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
              </div>
            </div>
          </button>
        </template>
        <template v-slot:modal>
          <div v-if="flowStore.histories.length > 3" class="flex flex-col items-center justify-center">
            <button v-for="(history, index) in flowStore.histories" :key="history.id" @click="flowStore.loadHistory(history);">
              <div v-if="index > 2" class="flex  p-2 m-1 border">
                <p class="mr-2">{{ index - 2 }}</p>
                <p>{{ history.name? history.name:'Untitled' }}</p>
              </div>
            </button>
          </div>
        </template>
      </AtomsCommonModalWindow>
      <!-- 重すぎるので蓋閉じ -->
      <!-- <AtomsCommonModalWindow>
        <template v-slot:button>
          <button class="group/history overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center" @click="uiStore.setItemDisplayMode(flowStore.masterFlow, 'history')">
            <div class="flex items-center justify-center">
              <div class="">
                バージョン履歴
                <div :class="uiStore.getItemDisplayMode(flowStore.masterFlow) === 'history' ? 'opacity-100 bg-[#842ff7] w-full': 'opacity-0 '" class="group-hover/history:bg-[#842ff7] w-0 group-hover/history:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
              </div>
            </div>
          </button>
        </template>
        <template v-slot:modal>
          <div v-if="flowStore.histories.length > 3" class="flex flex-col items-center justify-center">
            <button v-for="(history, index) in flowStore.histories" :key="history.id" @click="flowStore.loadHistory(history);">
              <div v-if="index > 2" class="flex  p-2 m-1 border">
                <p class="mr-2">{{ index - 2 }}</p>
                <p>{{ history.name? history.name:'Untitled' }}</p>
              </div>
            </button>
          </div>
        </template>
      </AtomsCommonModalWindow> -->
      <button class="group/history overflow-hidden hover:bg-gray-100 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center" @click="uiStore.setViewMode(uiStore.getViewMode() === 'Flow' ? 'Laboratory': 'Flow')">
        <div class="flex items-center justify-center">
          <div class="">
            表示変更
          </div>
        </div>
      </button>
      <AtomsCommonModalButton class="p-2" modal-possition="top" >
        <template v-slot:button>
          <button
            class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span>
              アイテムを追加
            </span>
          </button>
        </template>
        <template v-slot:modal>
          <MoleculesFlowAddItemMenu :flow-item="flowStore.masterFlow" />
        </template>
      </AtomsCommonModalButton>
    </div>
</template>

<script setup lang="ts">
  const APIExecution = useAPIExecution();
  const flowStore = useFlowStore();
  const uiStore = useUiStore();
</script>
  