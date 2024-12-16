<script setup lang="ts">
import { VueFlow, Panel } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import type { FlowItem } from '~/types/item/flow';
// import CustomNode from './molecules/flow-view/custom-node.vue'

const flowStore = useFlowStore()

const props = defineProps({
    flowItem: {
      type: Object as PropType<FlowItem>,
      required: true
    }
  });


const latestY = ref(50)

const nodes = ref([]);

function addNode(name: string = 'Untitled', flowItem: FlowItem) {
  const id = uuidv4()
  latestY.value += 100
  
  nodes.value.push({
    id,
    position: { x: 150, y: latestY.value },
    type: 'custom',
    data: { 
      label: `${name}`,
      flowItem: flowItem as FlowItem,
    }
  })
}

function setNode() {
  for(const flowItemChild of props.flowItem.flowItems){
    console.log(flowItemChild.flowItems.length)
    addNode(flowItemChild.name, flowItemChild)
  }
}

onMounted(()=>{
    setNode()
})

watch(flowStore.masterFlow,()=>{
  latestY.value = 50
  nodes.value = []
  setNode()
})

</script>
<template>
    <ClientOnly>
        <VueFlow v-model="nodes">
            <!-- <Panel>
                <button type="button" @click="addNode()">Add a node</button>
            </Panel> -->
            <template #node-custom="props">
              <!-- <MoleculesCustomNode v-bind="props" /> -->
              <div class="bg-white flex flex-col rounded-xl text-sm scale-90 hover:scale-100 transition-all duration-200">
                <div class="flex items-center justify-center p-2">
                 <div class="w-6 aspect-square rounded-lg overflow-hidden">
                    <AtomsCommonItemLogo size="small" :item-type="props.data.flowItem.type" class="h-full" />
                  </div>
                  <p class="flex-grow ml-2">
                    {{ props.data.flowItem.name ? props.data.flowItem.name:'Untitled' }}
                  </p>
                  <!-- {{ JSON.stringify(props.data.flowItem) }} -->
                  <!-- <template v-if="props.data.flowItem.flowItems.length > 0">
                    <OrganismsFlowView :flowItem="props.data.flowItem" />
                  </template> -->

                </div>
                <!-- {{ JSON.stringify(props.data.label) }}
                {{ JSON.stringify(props.data.flowItem.name) }} -->
                <!-- {{ props.data.flowItem.type }} -->
              </div>
            </template>
        </VueFlow>
    </ClientOnly>
</template>
