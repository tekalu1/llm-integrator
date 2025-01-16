<script setup lang="ts">
    import { v4 as uuidv4 } from 'uuid';
    const props = defineProps({
        modalPossition: {
            type: String,
            default: "bottom",
        },
        modalPossitionHorizonal: {
            type: String,
            default: "left",
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
        closeOnClick: {
            type: Boolean,
            default: true,
        },
    })

    const element = ref<HTMLElement | null>(null);
    const content = ref<HTMLElement | null>(null);
    const button = ref<HTMLElement | null>(null);
    const visibility = ref(false)
    const changeVisibility = () => {
        visibility.value = !visibility.value
    }

    const changeVisibilityOnModal = () => {
        if(props.closeOnClick){
            visibility.value = !visibility.value

        }
    }

    const floatingElementChildTop = ref(0)
    const floatingElementChildLeft = ref(0)
    const floatingElementChildRight = ref(0)
    const buttonRight = ref(0)
    const contentHeight = ref(0)
    const contentWidth = ref(0)


    const setReleaseWrapperHeight = () => {
        try{
            const rect = element.value.getBoundingClientRect(); // 現在の位置を取得
            const rectButton = button.value.getBoundingClientRect(); // 現在の位置を取得
            contentHeight.value = content.value?.clientHeight;
            contentWidth.value =  content.value?.clientWidth;
            floatingElementChildTop.value = rect.top;
            floatingElementChildLeft.value = rect.left;
            buttonRight.value = rectButton.right;
        }catch(e){
            console.error(e)
        }
    }

    const getTop = computed(()=>{
        if(props.modalPossition === 'bottom'){
            return floatingElementChildTop.value
        }else if(props.modalPossition === 'top'){
            return floatingElementChildTop.value - contentHeight.value
        }
    })
    
    const getLeft = computed(()=>{
        if(props.modalPossitionHorizonal === 'left'){
            return floatingElementChildLeft.value
        }else if(props.modalPossitionHorizonal === 'right' && buttonRight.value){
            return buttonRight.value - contentWidth.value
        }
    })

    defineExpose({
        changeVisibility,
    });
</script>

<template>
    <div class="flex items-start justify-center w-fit" :class="modalPossition === 'bottom' ? 'flex-col':'flex-col-reverse'">
        <div @click="changeVisibility(); setReleaseWrapperHeight();" class=""  ref="button">
            <slot name="button" />
        </div>
        <div :class="visibility ? '' : 'opacity-0 pointer-events-none'" class="relative transition-all duration-200 " ref="element" >
            <div class="fixed left-0 top-0 items-center w-full h-full z-10"
                @click="changeVisibility">
            </div>
            <div class=" p-1 rounded-md overflow-hidden shadow-[1px_1px_3px_0px_rgb(0,0,0,0.1)] z-20" :style="{top: getTop + 'px', left: getLeft + 'px', position: 'fixed'}"  :class="'bg-' + bgColor + ' bg-opacity-' + bgOpacity + ' border-' + borderThickness + ' border-' + borderColor" @click="changeVisibilityOnModal" >
                <div class="flex flex-col " ref="content" >
                    <slot name="modal" />
                </div>
            </div>
        </div>
    </div>
        
</template>

<style scoped></style>
