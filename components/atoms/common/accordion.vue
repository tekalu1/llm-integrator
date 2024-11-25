<script setup lang="ts">

const props = defineProps({
  idName: {
    type: String,
    default: '',
  },
});

const isOpening = ref(false)
const changeOpeningStatus = () => {
  isOpening.value = !isOpening.value;
}

defineExpose({
  isOpening
})
</script>

<template class="w-full">
    <div class="border-y overflow-hidden transition-all duration-500 py-4 w-full">
      <div @click="changeOpeningStatus">
        <slot name="summary" />
      </div>
      <AtomsCommonDynamicSizeWrapper :id-name="idName" >
        <div :class="!isOpening ? 'h-0' : 'h-fit'" class="w-full">
          <slot name="detail"  />

        </div>
      </AtomsCommonDynamicSizeWrapper>
    </div>
</template>