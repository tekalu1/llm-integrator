<template>
  <div v-if="authStore.isLoggedIn()" class="flex items-start justify-center w-full h-full  text-[#183153]">
    <OrganismsFlowView v-if="uiStore.getViewMode() === 'Flow'" :flowItem="flowStore.masterFlow" />
    <div v-show="uiStore.getViewMode() === 'Laboratory'" class="flex items-start justify-center w-full h-full ">
      <div class="max-xl:w-[50vw] xl:w-[25vw] h-full">
        <OrganismsSideMenu />
      </div>
      <div class="w-full h-full flex-grow relative"> 
        <AtomsCommonCoolScrollBarContainer class="max-h-full px-2 rounded-lg flex flex-col" bg-color="none">
          <div v-for="(flowItem, index) in flowStore.masterFlow.flowItems" :key="flowItem.id" class="flex flex-col items-center justify-center">
            <MoleculesFlowItem :flow-item="flowItem" class=" w-full " />
          </div>
        </AtomsCommonCoolScrollBarContainer>
      </div>
    </div>
    
  </div>
</template>
  
<script setup lang="ts">
  const flowStore = useFlowStore();
  const uiStore = useUiStore();
  const authStore = useAuthStore()

  await authStore.fetchUser()

  onBeforeMount(() => {
  })

  onMounted(async() => {
    if(!authStore.isLoggedIn()){
      window.location.href = '/login'
    }
  })
</script>
  