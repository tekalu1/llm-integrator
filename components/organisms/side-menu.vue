<script setup lang="ts">
    const uiStore = useUiStore();
</script> 
<template>
    <div class="flex items-start justify-start h-full w-full pb-2">
        <div class="flex flex-col items-center justify-start text-2xl  border-r border-gray-300 h-full mr-2 px-2 w-[96px]">
            <button @click="uiStore.setSideMenuStatus('Flow List')" class="p-2 w-full mb-2 flex flex-col items-center justify-center  rounded-lg transition-all duration-150" :class="uiStore.getSideMenuStatus() === 'Flow List'? 'bg-[#e5daf3] text-[#862ff7] font-bold':'hover:bg-[#e5daf3] text-gray-500 scale-90 hover:scale-100'">
                <font-awesome-icon :icon="['far', 'chart-bar']" />
                <p class="text-xs mt-2">
                    Flowリスト
                </p>
            </button>
            <button @click="uiStore.setSideMenuStatus('Variable List')" class="p-2 w-full mb-2 flex flex-col items-center justify-center rounded-lg transition-all duration-150" :class="uiStore.getSideMenuStatus() === 'Variable List'? 'bg-[#e5daf3] text-[#862ff7] font-bold':'hover:bg-[#e5daf3] text-gray-500 scale-90 hover:scale-100'">
                <div v-pre class=" font-normal">
                    {{x}}
                </div>
                <p class="text-xs mt-2">
                    変数
                </p>
            </button>
        </div>
        <div class="relative flex flex-col items-center justify-center w-[calc(100%-96px)] h-full max-h-full">
            <AtomsCommonCoolScrollBarContainer class="max-h-full pl-2 rounded-lg w-full">
                <MoleculesSideMenuFlowList v-show="uiStore.getSideMenuStatus() === 'Flow List'" class="w-full" />
                <MoleculesSideMenuVariableList v-show="uiStore.getSideMenuStatus() === 'Variable List'" class="w-full" />
            </AtomsCommonCoolScrollBarContainer>
        </div>
    </div>
</template>