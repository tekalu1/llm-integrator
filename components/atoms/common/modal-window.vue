<script setup lang="ts">
const visibility = ref(false)
const changeVisibility = () => {
    visibility.value = !visibility.value
}

const props = defineProps({
    bgColor: {
        type: String,
        default: "white",
    },
    bgOpacity: {
        type: String,
        default: "100",
    },
    buttonColor: {
        type: String,
        default: "red-500",
    },
    borderThickness : {
        type: String,
        default: null,
    },
    borderColor: {
        type: String,
        default: null,
    },
})


defineExpose({
    changeVisibility,
});

</script>

<template>
    <div @click="changeVisibility">
        <slot name="button" />
    </div>
    <Teleport to="body">
        <div :class="visibility ? '' : 'opacity-0 pointer-events-none'"
            class="fixed left-0 top-0 w-full h-full transition-all duration-300 z-50">
            <div class="absolute left-0 top-0 items-center w-full h-full bg-gray-500 bg-opacity-50 transition-all duration-300"
                @click="changeVisibility">
            </div>
            <div class="flex flex-col z-20 items-center justify-center h-full w-full ">
                <div :class="'bg-' + bgColor + ' bg-opacity-' + bgOpacity + ' border-' + borderThickness + ' border-' + borderColor"
                    class="flex flex-col items-center justify-center drop-shadow-lg rounded-lg md:max-h-screen transition-all duration-300 overflow-auto">
                    <div class="flex flex-col w-full ">
                        <div class="flex justify-end w-full">
                            <font-awesome-icon class="m-2 hover:opacity-50 transition-all duration-300 cursor-pointer"
                                :class="'text-' + buttonColor"
                                :icon="['fas', 'xmark']" @click="changeVisibility" />
                        </div>
                        <div
                            class="relative flex flex-col items-center justify-center pb-5 px-5 md:px-5 transition-all duration-300">
                            <slot name="modal" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped></style>
