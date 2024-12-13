<script setup lang="ts">
  const flowStore = useFlowStore();
  const uiStore = useUiStore();
  const loopStore = useLoopStore();
  const scriptStore = useScriptStore();
  const endStore = useEndStore();
  const waitStore = useWaitStore();
  const APIExecution = useAPIExecution();
  import { type FlowItem } from '~/types/item/flow';

  const props = defineProps({
    flowItem: {
      type: Object as PropType<FlowItem>,
      required: true
    }
  });
</script>
<template>
    <div class="flex flex-col items-center justify-center w-full">
        <button @click="flowStore.addFlowItem(flowItem.flowItems)" class="rounded-sm px-2  hover:bg-black hover:bg-opacity-10 w-full flex items-center justify-start py-1" >
            <AtomsCommonItemLogo item-type="flow" size="small" :rounded="true" />
            <p class="ml-2">
                Flow
            </p>
        </button>
        <button @click="flowStore.addApiItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
            <AtomsCommonItemLogo item-type="api" size="small" :rounded="true" />
            <p class="ml-2">
                APIリクエスト
            </p>
        </button>
        <button @click="flowStore.addConditionItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
            <AtomsCommonItemLogo item-type="condition" size="small" :rounded="true" />
            <p class="ml-2">
                条件
            </p>
        </button>
        <button @click="loopStore.addLoopItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
            <AtomsCommonItemLogo item-type="loop" size="small" :rounded="true" />
            <p class="ml-2">
                ループ
            </p>
        </button>
        <button @click="scriptStore.addScriptItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
            <AtomsCommonItemLogo item-type="script" size="small" :rounded="true" />
            <p class="ml-2">
                スクリプト
            </p>
        </button>
        <button @click="endStore.addEndItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
            <AtomsCommonItemLogo item-type="end" size="small" :rounded="true" />
            <p class="ml-2">
                終了
            </p>
        </button>
        <button @click="waitStore.addEndItem(flowItem.flowItems)" class="rounded-sm  px-2  hover:bg-black hover:bg-opacity-10 w-full  flex items-center justify-start py-1">
            <AtomsCommonItemLogo item-type="wait" size="small" :rounded="true" />
            <p class="ml-2">
                待機
            </p>
        </button>
    </div>
</template>