<template>
  <div class=" z-10 py-2 w-full px-2  grid md:grid-cols-7 max-md:flex max-md:justify-center max-md:items-center h-20">
    <div class="col-span-2 flex items-center justify-start ml-2 text-[#842ff7] ">
      <AtomsCommonAppLogo />
    </div>
    <!-- フロー設定部分 -->
    <div class="col-span-3 flex items-center justify-center">
      <div class="flex justify-center items-center flex-grow">
        <!-- フロー名 -->
        <div class="flex items-center justify-center px-4 py-2">
          <input
            v-model="flowStore.masterFlow.name"
            type="text"
            placeholder="Untitled"
            class="mx-2 px-2 focus:bg-white bg-transparent rounded-md duration-300 transition-all border-gray-300 outline-none w-full text-sm" 
          />
        </div>
        <AtomsCommonModalButton >
          <template v-slot:button >
            <button class=" hover:bg-gray-400 px-[6px] py-1 rounded-md transition-all duration-150">
              <font-awesome-icon :icon="['fas', 'chevron-down']" />
            </button>
          </template>
          <template v-slot:modal >
            <div class="bg-white rounded-md flex flex-col items-start justify-center">
              <AtomsCommonDropdownMenu>
                <template v-slot:parent >
                  <div  class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
                    <font-awesome-icon :icon="['far', 'folder-open']" />
                    <p class="max-xl:hidden ml-2 mr-4">
                      フローを開く
                    </p>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" />
                  </div>
                </template>
                <template v-slot:menu >
                  <OrganismsFlowMenu class="" />
                </template>
              </AtomsCommonDropdownMenu>
              <!-- 保存ボタン -->
              <button @click="flowStore.saveFlow(flowStore.masterFlow)" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full">
                <font-awesome-icon :icon="['fas', 'floppy-disk']" />
                <p class="max-xl:hidden ml-2">
                  保存
                </p>
              </button>

              <!-- 保存ボタン -->
              <div class="w-full">
                <MoleculesHeaderButtonSaveAs :flow-item="flowStore.masterFlow" />
              </div>

              <!-- インポート/エクスポートボタン -->
              <button
                @click="flowStore.exportFlow(flowStore.masterFlow)"
                class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
              >
                <font-awesome-icon :icon="['fas', 'download']" />
                <p class="max-xl:hidden ml-2">
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
                class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full"
              >
                <font-awesome-icon :icon="['fas', 'file-import']" />
                <p class="max-xl:hidden ml-2">
                  インポート
                </p>
              </button>

            </div>
          </template>
        </AtomsCommonModalButton>
      </div>
    </div>
    <div class="col-span-2 flex items-center justify-end mr-2">
      <button class="px-4 py-2 text-white rounded-xl font-bold border border-gray-300 bg-gradient-to-r from-[#6e7af8] from-5% via-[#6c56e4] via-30% to-[#842ff7] to-80% transition duration-300 hover:shadow-[0px_0px_12px_0px_rgb(255,255,255,1)]" >
        公開する
        <font-awesome-icon :icon="['fas', 'chevron-down']" />
      </button>
      
      <AtomsCommonModalButton modal-possition-horizonal="right" >
        <template v-slot:button >
          <div class="flex justify-center items-center px-2 ml-4">
            <div class=" rounded-xl px-2 hover:bg-gray-300 transition-all duration-150 flex justify-center items-center py-1">
              <div class="bg-white text-[#842ff7] text-xl aspect-square px-2 py-1 rounded-full">
                <font-awesome-icon :icon="['fas', 'user']" />
              </div>
              <p v-if="authStore.user" class="mr-2 px-2">
                {{ authStore.user.username }}
              </p>
              <font-awesome-icon :icon="['fas', 'chevron-down']" />

            </div>
          </div>
        </template>
        <template v-slot:modal >
          <MoleculesHeaderUserMenu />
        </template>
      </AtomsCommonModalButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const flowStore = useFlowStore();
const authStore = useAuthStore();

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