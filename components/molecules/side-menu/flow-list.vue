<template>
  <div class="w-full  bg-white backdrop-blur-md bg-opacity-50 border-gray-300 border rounded-2xl py-4 px-4 flex flex-col justify-start items-center z-10">
    <AtomsCommonDynamicSizeWrapper id-name="flow-list" class=" w-full" >
      <div class="w-full flex flex-col items-start justify-center" >
        <p >
          Flowリスト
        </p>
        <div class="w-full">
          <MoleculesApiDraggableFlowList :flow-item="flowStore.masterFlow" />
        </div>
      </div>
    </AtomsCommonDynamicSizeWrapper>
  </div>
</template>

<script setup lang="ts">
  const flowStore = useFlowStore();

</script> 