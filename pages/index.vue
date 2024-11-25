<template>
  <div class="flex flex-col items-center justify-items-center h-screen w-full bg-gray-200 text-sm">
    <OrganismsHeader />
    <div class="flex items-center justify-center flex-grow w-full  text-[#183153]">
      <div class="">
        <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] pt-2 pb-8 pl-2 rounded-lg">
          <OrganismsSideMenu />
        </AtomsCommonCoolScrollBarContainer>
      </div>
      <div class=" flex-grow">
        <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] p-2 rounded-lg">
          <OrganismsFlowItem :flow-item="flowStore.masterFlow" class=" w-full " />
        </AtomsCommonCoolScrollBarContainer>

      </div>
    </div>

  </div>
</template>
  
<script setup lang="ts">
  const flowStore = useFlowStore();

  onMounted(() => {
    flowStore.loadFlows()
  })
</script>
  