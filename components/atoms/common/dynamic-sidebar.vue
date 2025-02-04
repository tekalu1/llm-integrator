<script setup lang="ts">
const defalutSidebarWidth = ref(100)
const maxSidebarWidth = ref(600)
const cookieSidebarWidth = useCookie("sidebarWidth")
const sidebarWidth = ref(Number(cookieSidebarWidth.value) || defalutSidebarWidth.value)
const isDragging = ref(false)

onMounted(()=>{
    maxSidebarWidth.value = window.innerWidth - 100
})
const dragStart = (e: MouseEvent) => {
  isDragging.value = true
  const startX = e.clientX
  const startWidth = sidebarWidth.value
  document.body.style.userSelect = 'none'
  const onMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      const newWidth = startWidth + (e.clientX - startX)
      sidebarWidth.value = Math.max(defalutSidebarWidth.value, Math.min(maxSidebarWidth.value, newWidth))
      cookieSidebarWidth.value = String(sidebarWidth.value)
    }
  }
  const onMouseUp = () => {
    isDragging.value = false
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
    <div class="flex items-center justify-start h-full">
        <div name="sidebar" :style="{ width: sidebarWidth + 'px'}" class="h-full ">
            <slot />
        </div>
        <div class="group px-1 h-full cursor-col-resize" @mousedown="dragStart($event)">
            <div class="w-[1px] rounded-md  group-hover:bg-blue-600 bg-gray-300 group-active:bg-blue-600 h-full transition duration-300 mx-1"></div>
        </div>
    </div>

</template>