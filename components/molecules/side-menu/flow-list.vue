<script setup lang="ts">
  const flowStore = useFlowStore();
</script> 
<template>
  <div class="w-full  bg-white  bg-opacity-50 border-gray-300 border rounded-2xl py-4 px-4 flex flex-col justify-start items-center overflow-hidden">
    <AtomsCommonDynamicSizeWrapper id-name="flow-list" class=" w-full" >
      <div class="w-full flex flex-col items-start justify-center" >
        <p class="mb-3">
          Flowリスト
        </p>
        <AtomsCommonModalButton class="" >
          <template v-slot:button>
            <button class="rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white mb-2 px-3 py-1 transition duration-100 ">
              <font-awesome-icon :icon="['fas', 'plus']" class="" />
              アイテムを追加
            </button>
          </template>
          <template v-slot:modal>
            <MoleculesFlowAddItemMenu :flow-item="flowStore.masterFlow" />
          </template>
        </AtomsCommonModalButton>
        <div class="w-full">
          <MoleculesSideMenuDraggableFlowList :flow-item="flowStore.masterFlow" />
        </div>
      </div>
    </AtomsCommonDynamicSizeWrapper>
  </div>
</template>
