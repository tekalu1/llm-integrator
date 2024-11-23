<script setup lang="ts">

const props = defineProps({
  idName: {
    type: String,
    default: '',
  },
});
const getReleaseWrapperHeight = computed(() => {
  try{
    return document.getElementById(props.idName).clientHeight;
  }catch(e){
    return 0
  }
})



  const releaseWrapperHeight = ref(0)
  const resizeObserver = ref()
  const setReleaseWrapperHeight = () => {
    try{
      releaseWrapperHeight.value = document.getElementById(props.idName).clientHeight;
    }catch(e){
      return []
    }
  }
  onMounted(() => {
    resizeObserver.value = new ResizeObserver(entries => {
      for (let entry of entries) {
        setReleaseWrapperHeight();
      }
    })
    const observedElement = document.getElementById(props.idName);
    // ResizeObserverを作成し、コールバックを設定
    try{
      // 要素の監視を開始
      resizeObserver.value.observe(observedElement)
    }catch(e){
    }
  })

  onBeforeUnmount(() => {
    if (resizeObserver.value) {
      resizeObserver.value.disconnect();
    }
  })
</script>

<template>
  <div class="transition-all duration-150" :style="{ height: releaseWrapperHeight + 'px' }">
    <div :id="idName" class="flex">
        <slot  />
    </div>
  </div>
</template>