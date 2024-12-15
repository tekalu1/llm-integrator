<script setup lang="ts">
    const props = defineProps({
        isLoading: {
            type: Boolean,
            required: true
        }
    });
</script>
<template>
    <div class="fixed h-screen w-full bg-gray-200 z-50 transition-all duration-300 flex flex-col items-center justify-center" :class="isLoading ? 'opacity-100  ':'opacity-0 pointer-events-none'" >
        <p>
            Loading...
        </p>
        <div class="flex items-center justify-center p-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500">
            </div>
        </div>
    </div>
</template>