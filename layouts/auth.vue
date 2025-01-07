<script lang="ts" setup>
  const isLoading = ref(true)

  onMounted(() => {
    isLoading.value = false
  })
</script>

<template>
  <div class="w-screen h-screen flex flex-col items-center justify-center text-xs bg-gray-200">
    <slot />
    <AtomsCommonNotificationQueue />
  </div>
</template>
<style>
</style>
