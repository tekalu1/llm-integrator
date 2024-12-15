<script setup lang="ts">
    const props = defineProps({
    bgColor: {
        type: String,
        default: 'white',
    },
    });
</script>
<template>
    <div class="absolute max-h-full h-fit  inset-0 flex flex-row scroll-smooth overflow-y-auto 
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-thumb]:bg-[#c397fb]
        [&::-webkit-scrollbar-thumb:hover]:bg-[#842ff7]
        [&::-webkit-scrollbar-track]:bg-opacity-0
        [&::-webkit-scrollbar-thumb]:bg-opacity-50
        [&::-webkit-scrollbar-thumb]:rounded-md
        [&::-webkit-scrollbar-thumb]:transition-all
        [&::-webkit-scrollbar-thumb]:duration-300
        transition-all duration-300"
        :class="bgColor === 'white' ? 'bg-white bg-opacity-50 border-gray-300 border rounded-xl':''"
        >
        <slot />
    </div>
</template>