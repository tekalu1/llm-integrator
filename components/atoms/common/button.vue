<!-- <script setup lang="ts">
    const isButtonMousseOver = ref(false)
    const onMousseOver = () =>{
        isButtonMousseOver.value = !isButtonMousseOver.value
    }
</script> -->
<template>
    <button class="group/history overflow-hidden hover:bg-gray-200 rounded-xl transition-all duration-300 py-2 px-3 flex flex-col items-center justify-center">
        <div class="flex items-center justify-center">
            <div class="">
                <slot />
                <div class="group-hover/history:bg-[#842ff7] w-0 group-hover/history:w-full opacity-100 h-[2px] rounded-md transition-all duration-500"></div>
            </div>
        </div>
    </button>
</template>