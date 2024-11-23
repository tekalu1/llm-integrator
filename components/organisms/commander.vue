<template>
    <div class="w-full  bg-white backdrop-blur-md bg-opacity-50 border-gray-300 border  rounded-2xl py-2 px-2 flex justify-center items-center z-10">
      <button @click="APIExecution.runFlow(); stepStore.setDisplayStatus('result');" class="group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center">
        <div class="flex items-center justify-center">
          <img src="~/assets/play.svg" class="w-8" />
          <div class="mr-4">
            実行
            <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <div class="bg-gray-300 w-[1px] h-8 mx-1">
      </div>
      <button class="group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center" @click="stepStore.setDisplayStatus('flow')">
        <div class="flex items-center justify-center">
          <!-- <img src="~/assets/play.svg" class="w-8" /> -->
          <div class="">
            フロー
            <div :class="stepStore.flow.displayStatus === 'flow' ? 'opacity-100 bg-[#842ff7]': 'opacity-0 '" class="hover:bg-[#842ff7]  w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <button class="group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center" @click="stepStore.setDisplayStatus('result')">
        <div class="flex items-center justify-center">
          <!-- <img src="~/assets/play.svg" class="w-8" /> -->
          <div class="">
            実行結果
            <div :class="stepStore.flow.displayStatus === 'result' ? 'opacity-100 bg-[#842ff7]': 'opacity-0 '" class="hover:bg-[#842ff7]  w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <button class="group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 p-2 flex flex-col items-center justify-center" @click="stepStore.setDisplayStatus('history')">
        <div class="flex items-center justify-center">
          <!-- <img src="~/assets/play.svg" class="w-8" /> -->
          <div class="">
            履歴
            <div :class="stepStore.flow.displayStatus === 'history' ? 'opacity-100 bg-[#842ff7]': 'opacity-0 '" class="hover:bg-[#842ff7]  w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
          </div>
        </div>
      </button>
      <button
        @click="stepStore.addStep()"
        class="px-4 py-2 font-bold bg-white backdrop-blur-md bg-opacity-50 rounded-full border-gray-300 hover:border-[#842ff7] border transition-all duration-300"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        <span>
          ステップを追加

        </span>
      </button>
    </div>
</template>

<script setup lang="ts">
  const APIExecution = useAPIExecution();
  const stepStore = useStepStore();
</script>
  