<template>
  <div class=" z-10 py-2 w-full px-2  grid md:grid-cols-7 max-md:flex max-md:justify-center max-md:items-center h-16">
    <div class="col-span-2 flex items-center justify-start ml-4">
      <img src="~/assets/logo.webp" class="w-8 rounded-md mr-2" />
      <p class="font-bold max-md:hidden">
        API Labo
      </p>
    </div>
    <!-- フロー設定部分 -->
    <div class="col-span-3">
      <div class="">
        <div class="flex justify-center items-center w-full">
          <div class="flex justify-center items-center flex-grow">
            <!-- フロー名 -->
            <div class="flex items-center justify-center px-4 py-2">
              <input
                v-model="flowStore.masterFlow.name"
                type="text"
                placeholder="Untitled"
                class="mx-2 px-2 focus:bg-white bg-transparent rounded-md duration-300 transition-all border-gray-300 outline-none w-full font-bold" 
              />
            </div>
            <AtomsCommonModalButton >
              <template v-slot:button >
                <button>
                  <font-awesome-icon :icon="['fas', 'chevron-down']" />
                </button>
              </template>
              <template v-slot:modal >
                <OrganismsFlowMenu />
              </template>
            </AtomsCommonModalButton>
            <div class="max-md:flex-grow w-full flex justify-end items-center">
              <!-- 保存ボタン -->
              <button @click="flowStore.saveFlow(flowStore.masterFlow)" class="px-2 py-2  hover:bg-white rounded-lg mr-2 flex justify-center items-center transition-all duration-300">
                <img src="~/assets/save.svg" class="" />
                <p class="max-xl:hidden">
                  保存
                </p>
              </button>

              <!-- インポート/エクスポートボタン -->
              <button
                @click="flowStore.exportFlow(flowStore.masterFlow)"
                class="px-2 py-2  hover:bg-white rounded-lg mr-2 flex justify-center items-center transition-all duration-300"
              >
                <img src="~/assets/output.svg" class="" />
                <p class="max-xl:hidden">
                  エクスポート
                </p>
              </button>
              <input
                type="file"
                ref="fileInput"
                accept=".json"
                @change="importFlow"
                class="hidden"
              />
              <button
                @click="$refs.fileInput.click()"
                class="px-2 py-2  hover:bg-white rounded-lg mr-2 flex justify-center items-center transition-all duration-300"
              >
                <img src="~/assets/input.svg" class="" />
                <p class="max-xl:hidden">
                  インポート
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-2">

    </div>
  </div>
</template>

<script setup lang="ts">
const flowStore = useFlowStore();

const fileInput = ref<HTMLInputElement | null>(null);

const importFlow = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const flowData = JSON.parse(e.target?.result as string);
      flowStore.importFlow(flowData);
    } catch (error) {
      console.error('Failed to import flow:', error);
    }
  };
  reader.readAsText(file);
};
</script> 