<template>
  <div class="flex flex-col items-center justify-items-center h-screen w-full bg-gray-200 text-sm" @keydown="onKeyDown">
    <OrganismsHeader />
    <!-- <div class="fixed h-64" >
      {{ flowStore.history }}
    </div> -->
    <div class="flex items-center justify-center flex-grow w-full  text-[#183153]">
      <div class="">
        <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] pb-8 pl-2 rounded-lg">
          <OrganismsSideMenu />
        </AtomsCommonCoolScrollBarContainer>
      </div>
      <div class=" flex-grow">
        <div class="relative w-full  h-full">
          <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] px-2 rounded-lg">
              <div v-for="(flowItem, index) in flowStore.masterFlow.flowItems" :key="flowItem.id" class="flex flex-col items-center justify-center">
                <OrganismsFlowItem :flow-item="flowItem" class=" w-full " />
              </div>
          </AtomsCommonCoolScrollBarContainer>
          <div class="absolute bottom-0 left-0 w-full flex items-center justify-center pointer-events-none">
            <OrganismsCommander />
          </div>
        </div>

      </div>
    </div>
    <!-- {{ JSON.stringify(flowStore.history) }} -->
  </div>
</template>
  
<script setup lang="ts">
  const flowStore = useFlowStore();
  flowStore.setupWatcher()

  // const onKeyDown = (event) => {
  //   console.log('keydown')
  //   if (event.ctrlKey && event.key === 'z') {
  //     console.log('z')
  //     event.preventDefault(); // デフォルトのアンドゥ動作を無効化
  //     flowStore.undoHistory();
  //   }else if (event.ctrlKey && event.key === 'y') {
  //     event.preventDefault(); // デフォルトのアンドゥ動作を無効化
  //     flowStore.redoHistory();
  //   }
  // }

  onMounted(() => {
    flowStore.loadFlows()
  })
</script>
  