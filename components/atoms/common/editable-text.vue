<script setup lang="ts">

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});

</script>

<template>
  <input
    :value="text"
    type="text"
    class="w-full focus:bg-white bg-transparent rounded-sm border-gray-300 outline-none" 
  />
</template>