<template>
    <div class="flex items-center justify-start">
        {{ JSON.stringify(apiItem.headers) }}
        <p class="mr-2">
            headers
        </p>
        <button @click="flowStore.addHeader(apiItem)" class="text-sm text-white aspect-square px-1 bg-[#842ff7] rounded-full flex justify-center items-center">
            <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
    </div>
    <div class="flex items-center justify-start">
        <div class="flex flex-col">
            <div v-for="(header, index) in apiItem.headers" :key="index">
                <MoleculesApiRequestParameterEditor :model-value="header" @remove="flowStore.removeHeader(apiItem,index)" />
            </div>
        </div>
    </div>
    <div class="flex items-center justify-start mt-4">
        <p class="mr-2">
            body
        </p>
        <button @click="flowStore.addBodyParam(apiItem)" class="text-sm text-white aspect-square px-1 bg-[#842ff7] rounded-full flex justify-center items-center">
            <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
    </div>
    <div class="flex items-center justify-start">
        <div class="flex flex-col">
            <div v-for="(body, index) in apiItem.body" :key="index">
                <MoleculesApiRequestParameterEditor :model-value="body" @remove="flowStore.removeBodyParam(apiItem,index)" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { type ApiItem } from '@/types/item/api';
    const props = defineProps({
        apiItem: {
            type: Object as PropType<ApiItem>,
            default: 0,
        },
    })
    const flowStore = useFlowStore();

</script>