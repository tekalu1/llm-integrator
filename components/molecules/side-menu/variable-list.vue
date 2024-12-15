<template>
  <div class="w-full  h-fit  py-4 px-4 flex flex-col justify-start items-center">
    <AtomsCommonDynamicSizeWrapper id-name="variable-list" class="w-full" >
      <div class="rounded-md w-full ">
        <div class="w-full flex items-center justify-start">
          <p class="mr-2">
            変数
          </p>
          <button
            @click="addKey('','')"
            class="text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </div>
        <div v-for=" (value,id,index) in flowStore.masterFlow.variables" :key="id" class="mt-1 flex items-center justify-center w-full">
          <input
            :value="id"
            @change="updateKey(id,  $event.target.value)"
            type="text"
            placeholder="key"
            class="mr-1 px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full" 
          />
          <input type="text" v-model="flowStore.masterFlow.variables[id]"
            class="mr-1 px-2 duration-300 transition-all rounded-md border-gray-300 outline-none w-full" >
            
            <button
              @click="deleteKey(id)"
              class="ml-2 mr-1"
              >
              <p class=" text-red-500 hover:text-red-700 transition-all duration-300">
                <font-awesome-icon :icon="['fas', 'minus']" />
              </p>
            </button>
        </div>
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