<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
const props = defineProps({
    modalPossition: {
        type: String,
        default: "bottom",
    },
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
        default: "[#842ff7]",
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

const element = ref<HTMLElement | null>(null);
const visibility = ref(false)
const changeVisibility = () => {
    visibility.value = !visibility.value
}

const floatingElementChildTop = ref(0)
const floatingElementChildLeft = ref(0)

const setReleaseWrapperHeight = () => {
    try{
        const rect = element.value.getBoundingClientRect(); // 現在の位置を取得
        floatingElementChildTop.value = rect.top;
        floatingElementChildLeft.value = rect.left;
    }catch(e){
        console.error(e)
    }
  }
</script>

<template>
    <div class="flex flex-col items-start justify-center w-fit">
        <div @click="changeVisibility(); setReleaseWrapperHeight();" class="">
            <slot name="button" />
        </div>
        <div :class="visibility ? '' : 'opacity-0 pointer-events-none'" class="relative transition-all duration-200 " ref="element" >
            <div class="fixed left-0 top-0 items-center w-full h-full z-10"
                @click="changeVisibility">
            </div>
            <div class=" p-1 rounded-md overflow-hidden shadow-[1px_1px_3px_0px_rgb(0,0,0,0.1)] z-20" :style="{top: floatingElementChildTop + 'px', left: floatingElementChildLeft + 'px', position: 'fixed'}"  :class="'bg-' + bgColor + ' bg-opacity-' + bgOpacity + ' border-' + borderThickness + ' border-' + borderColor"  @click="changeVisibility">
                <div class="flex flex-col " >
                    <slot name="modal" />
                </div>
            </div>
        </div>
    </div>
        
</template>

<style scoped></style>
