<script lang="ts" setup>

  const flowStore = useFlowStore();
  const isLoading = ref(true)

  onMounted(async() => {
    await flowStore.loadFlows()
    isLoading.value = false
  })
</script>

<template>
  <div class="w-screen h-screen flex flex-col items-center justify-center text-xs bg-gray-200">
    <OrganismsCommonLoading :is-loading="isLoading" class="" />
    <OrganismsHeader class="" />
    <div class="relative flex-grow w-full">
      <slot  />
    </div>
    <div class="absolute bottom-[2%] left-0 w-full flex flex-col items-center justify-center pointer-events-none">
      <AtomsCommonNotificationQueue />
      <OrganismsCommander />
    </div>
  </div>
</template>

<style>
</style>
