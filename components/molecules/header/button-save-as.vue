<script setup lang="ts">
    import { type FlowItem } from '~/types/item/flow';
    const props = defineProps({
        flowItem: {
        type: Object as PropType<FlowItem>,
        required: true
        }
    });
    const flowStore = useFlowStore();
    const name = ref('');
    const description = ref('')
    const modalwindow = ref(null);

    function closeModal() {
        if (modalwindow.value) {
            modalwindow.value.changeVisibility(); // 子コンポーネントのメソッドを実行
        }
    }

    name.value = props.flowItem.name;
    description.value = props.flowItem.description;

    const setFlowInfo = () => {
        name.value = props.flowItem.name;
        description.value = props.flowItem.description;

    }

    const saveFlow = () => {
        props.flowItem.name = name.value
        props.flowItem.description = description.value
        flowStore.saveFlow(props.flowItem, true)
    }

</script>
<template>
    <AtomsCommonModalWindow ref="modalwindow">
        <template v-slot:button>
            <button class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-start items-center transition-all duration-300 w-full" @click="setFlowInfo();">
                <font-awesome-icon :icon="['fas', 'floppy-disk']" />
                <p class="max-xl:hidden ml-2">
                別名で保存
                </p>
            </button>
        </template>
        <template v-slot:modal>
            <div class=" flex flex-col items-center justify-center text-xs">
                <div class="flex items-center justify-center mb-4">
                    <p class="mr-4">
                        名前
                    </p>
                    <input v-model="name" placeholder="名前を入力してください" class="outline-1 outline-gray-200 px-2" />
                </div>
                <div class="flex items-center justify-center mb-4">
                    <p class="mr-4">
                        説明
                    </p>
                    <input v-model="description" placeholder="説明を入力してください" class="outline-1 outline-gray-200 px-2" />
                </div>
                <button @click="saveFlow(); closeModal();" class="px-2 py-2  hover:bg-gray-200 rounded-lg mr-2 flex justify-center items-center transition-all duration-300 w-full">
                    <font-awesome-icon :icon="['fas', 'floppy-disk']" />
                    <p class="max-xl:hidden ml-2">
                    保存
                    </p>
                </button>
            </div>
        </template>
    </AtomsCommonModalWindow>
</template>