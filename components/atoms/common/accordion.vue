<script setup lang="ts">

const props = defineProps({
  idName: {
    type: String,
    default: '',
  },
});

import { v4 as uuidv4 } from 'uuid';

const id = ref(uuidv4())
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
      <AtomsCommonDynamicSizeWrapper :id-name="'acd-' + id" >
        <div :class="!isOpening ? 'h-0' : 'h-fit'" class="w-full">
          <slot name="detail"  />

        </div>
      </AtomsCommonDynamicSizeWrapper>
    </div>
</template>