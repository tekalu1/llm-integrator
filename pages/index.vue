<template>
  <div class="flex flex-col items-center justify-items-center h-screen w-full bg-gray-200 text-sm">
    <OrganismsHeader />
    <div class="flex items-center justify-center flex-grow w-full  text-[#183153]">
      <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] w-96 pl-8 pt-2 pb-8 rounded-lg">
        <OrganismsFlowList class="" />
      </AtomsCommonCoolScrollBarContainer>
      <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] mx-8 p-2 rounded-lg">
        <OrganismsFlowItem :flow-item="flowStore.masterFlow" class=" w-full " />
      </AtomsCommonCoolScrollBarContainer>
      <AtomsCommonCoolScrollBarContainer class="h-[calc(100vh-128px)] w-96 pr-8 pt-2 pb-8 rounded-lg">
        <OrganismsVariableList class="" />
      </AtomsCommonCoolScrollBarContainer>
    </div>

  </div>
</template>
  
<script setup lang="ts">
  const flowStore = useFlowStore();

  onMounted(() => {
    flowStore.loadFlows()
  })
</script>
  