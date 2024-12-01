<template>
  <div class="flex flex-col items-center justify-start my-2  rounded-lg">
    <MoleculesCondition :condition="conditionItem.condition" />
  </div>
</template>

<script setup lang="ts">
  import { type ConditionItem } from '~/types/item/condition';
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  const flowStore = useFlowStore();
  const props = defineProps({
      conditionItem: {
          type: Object as PropType<ConditionItem>,
          default: 0,
      },
  })
</script>