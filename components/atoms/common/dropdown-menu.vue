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
const openMenu = () => {
    visibility.value = true
}

const closeMenu = () => {
    visibility.value = false
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
    <div class="flex items-start justify-start w-fit z-0">
        <div @mouseover="openMenu(); setReleaseWrapperHeight();" @mouseout="closeMenu();">
            <slot name="parent" />
        </div>
        <div :class="visibility ? '' : 'opacity-0 pointer-events-none'" class="relative transition-all duration-200 z-0 " ref="element" >
            <div class="fixed z-20 overflow-hidden shadow-[1px_1px_3px_0px_rgb(0,0,0,0.1)] rounded-md " :style="{top: floatingElementChildTop + 'px', left: floatingElementChildLeft + 'px'}"  :class="'bg-' + bgColor + ' bg-opacity-' + bgOpacity + ' border-' + borderThickness + ' border-' + borderColor" @mouseover="openMenu();" @mouseout="closeMenu();" @click="closeMenu();">
                <div class="flex flex-col " >
                    <slot name="menu" />
                </div>
            </div>
        </div>
    </div>
        
</template>

<style scoped></style>
