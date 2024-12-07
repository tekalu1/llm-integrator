<template>
    <div class="h-full">
        <div class="rounded-lg bg-white overflow-hidden py-4 mb-4">
            <p class="px-2 ml-2 mb-2">
                ヘッダー
            </p>
            <div class="rounded-lg bg-white overflow-hidden py-8">
                <MonacoEditor" v-model="valueHeaders" @focusout="setHeadersValueToStore" lang="json" :options="{ scrollbar: {alwaysConsumeMouseWheel: false} }" class="h-64" />
            </div>
        </div>
        <div class="rounded-lg bg-white overflow-hidden py-4">
            <p class="px-2 ml-2 mb-2">
                ボディ
            </p>
            <div class="rounded-lg bg-white overflow-hidden py-8">
                <MonacoEditor v-model="valueBody" @focusout="setBodyValueToStore" lang="json" :options="{ scrollbar: {alwaysConsumeMouseWheel: false} }" class="h-64" />
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
    const APIExecution = useAPIExecution();

    const valueHeaders = ref('')
    const valueBody = ref('')


    const formatResponse = (response: any) => {
        try {
            return JSON.stringify(response, null, 2);
        } catch {
            return JSON.stringify(response);
        }
    };

    valueHeaders.value = formatResponse(APIExecution.reverseTransformToRequestParameterArray(props.apiItem.headers))
    valueBody.value = formatResponse(APIExecution.reverseTransformToRequestParameterArray(props.apiItem.body))

    const setHeadersValueToStore = () => {
        try{
            props.apiItem.headers = APIExecution.transformEntriesArray(JSON.parse(valueHeaders.value))
            console.log("called setHeadersValueToStore")
        }catch(e){
            console.error(e.message)
        }
    }
    const setBodyValueToStore = () => {
        try{
            console.log("called setBodyValueToStore")
            props.apiItem.body = APIExecution.transformEntriesArray(JSON.parse(valueBody.value))

        }catch(e){
            console.error(e.message)
        }
    }

    onMounted(() => {

    })

</script>