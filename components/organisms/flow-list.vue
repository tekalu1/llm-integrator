<template>
  <div class="w-full  bg-white backdrop-blur-md bg-opacity-50 border-gray-300 border rounded-2xl py-4 px-4 flex flex-col justify-start items-center z-10">
    <AtomsCommonDynamicSizeWrapper id-name="variable-list" class="w-full" >
      <div class="rounded-md w-full h-full">
        <div class="w-full flex items-center justify-start">
          <p class="mr-2">
            フロー一覧
          </p>
          <!-- <button
            @click="addKey('','')"
            class="text-sm text-white aspect-square px-1 bg-[#842ff7] rounded-full flex justify-center items-center"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button> -->
        </div>
        <draggable ref="el" v-model="flowStore.masterFlow.flowItems" :animation="150" easing="ease" class=" m-1" >
          <template v-for=" (flowItem,index) in flowStore.masterFlow.flowItems" :key="flowItem.id" >
            <div class="border p-2 mb-2 border-black">
              <p>
                {{ flowItem.name }}
              </p>
              
              <template v-for=" (flowItemChild,index) in flowItem.flowItems" :key="flowItemChild.id" >
                <div class="border p-2 mb-2 border-black">
                  {{ flowItemChild.name }}
                </div>
              </template>
            </div>
          </template>
        </draggable>
      </div>
    </AtomsCommonDynamicSizeWrapper>
  </div>
</template>

<script setup lang="ts">
  const flowStore = useFlowStore();

  const updateKey = (oldKey, newKey) =>{
    flowStore.masterFlow.variables[newKey] = flowStore.masterFlow.variables[oldKey]
    delete flowStore.masterFlow.variables[oldKey]
  }

  const addKey = (key,value) => {
    flowStore.masterFlow.variables[key] = value;
  }

  const deleteKey = (key) => {
    delete flowStore.masterFlow.variables[key]
  }

</script> 