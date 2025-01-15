<script setup lang="ts">
  const flowStore = useFlowStore();
  const uiStore = useUiStore();
  const APIExecution = useAPIExecution();
  import { type FlowItem } from '~/types/item/flow';

  const props = defineProps({
    flowItem: {
      type: Object as PropType<FlowItem>,
      required: true
    }
  });

  const modalwindow = ref<HTMLElement | null>(null);

  function closeModal() {
      if (modalwindow.value) {
          modalwindow.value.changeVisibility(); // 子コンポーネントのメソッドを実行
      }
  }
  const userPrompt = ref('')

  const promptApi = computed(()=>{
    return `
        # 前提
            APIフロー作成アプリについて、フローアイテムのデータを自動的に生成することを手伝っていただきたいです。
            下記の型構造(ApiItem)のデータをお送りしますので、指示に合わせて、修正したデータのみを返却してください。（json形式で、それ以外の文字列は返答しないでください）
            import { type FlowItem } from '~/types/item/flow';

            export type ApiItem = FlowItem & {
                endpoint: string;
                method: Method;
                headers: RequestParameter[];
                body: RequestParameter[];
                script: string;
                isScriptEnabled: boolean;
            }

            export type RequestParameter = {
                key?: string;
                type: 'string' | 'number' | 'boolean' | 'object' | 'array';
                value: any;
                children?: RequestParameter[];
            }

            export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

            参考
            export type FlowItem = {
            id: string;
            name: string;
            type: 'flow'|'api'|'condition'|'loop'|'script'|'end'|'wait';
            description: string;
            isItemActive: boolean;
            variables: {};
            executionResults: ExecutionResult[];
            flowItems: FlowItem[];
            }

            scriptに記載したスクリプトは、APIの実行後に実行されます。
            フローの変数を使用したいときはscript内でvariables[\${キー名}]を使用できます。
            また、実行結果を利用したい場合は、script内でresult.data.data　でアクセスできます。
            例えば、APIの実行結果を保持したい場合はvariables['result'] = result.data.data.保持したいプロパティ のようにすることで、保持できます。

        # 指示
            下記のデータについて、${userPrompt.value}
            ${JSON.stringify(props.flowItem)}
        
    `
  })

  const promptScript = computed(()=>{
    return `
        # 前提
            APIフロー作成アプリについて、フローアイテムのデータを自動的に生成することを手伝っていただきたいです。
            下記の型構造(ScriptItem)のデータをお送りしますので、指示に合わせて、修正したデータのみを返却してください。（json形式で、それ以外の文字列は返答しないでください）
            import { type FlowItem } from '~/types/item/flow';

            export type ScriptItem = FlowItem & {
                script: string;
            }


            参考
            export type FlowItem = {
            id: string;
            name: string;
            type: 'flow'|'api'|'condition'|'loop'|'script'|'end'|'wait';
            description: string;
            isItemActive: boolean;
            variables: {};
            executionResults: ExecutionResult[];
            flowItems: FlowItem[];
            }

            scriptはtype scriptの形式でお願いします。
            フローの変数を使用したいときはvariables[\${キー名}]を使用できます。
            例えば、variables['result'] = 'test'のようにすることで、保持できます。
            ※FlowItem内のvariablesプロパティは無視してください。

        # 指示
            下記のデータについて、${userPrompt.value}
            ${JSON.stringify(props.flowItem)}
        
    `
  })

    const onGenerateFlowButtonClicked = async () => {
      uiStore.setIsGenerating(props.flowItem.id, true)
      if(props.flowItem.type === 'api'){
        console.log(promptApi.value)
        const getGenaratedDataByAi = await flowStore.generateFlowItem(promptApi.value)
        console.log(JSON.stringify(getGenaratedDataByAi))
        flowStore.changeFlowItemById(props.flowItem.id, JSON.parse(getGenaratedDataByAi.value?.choices[0].message?.content))
      }else if(props.flowItem.type === 'script'){
        console.log(promptScript.value)
        const getGenaratedDataByAi = await flowStore.generateFlowItem(promptScript.value)
        console.log(JSON.stringify(getGenaratedDataByAi))
        flowStore.changeFlowItemById(props.flowItem.id, JSON.parse(getGenaratedDataByAi.value?.choices[0].message?.content))
        
      }
      uiStore.setIsGenerating(props.flowItem.id, false)
    }
    

</script>
<template>
  <div class="py-1 px-2 rounded-xl  mb-2 overflow-hidden transition-all duration-150" :class="[flowItem.isItemActive ? 'bg-[#f2f3f5]':'bg-gray-300 ', uiStore.focusedItemId === flowItem.id ? 'border-2 border-blue-500':'border border-gray-300']" @click.stop="uiStore.setFocusedItemId(flowItem.id)" >
    <AtomsCommonDynamicSizeWrapper :id-name="'dynmcwrpr_' + flowItem.id">
      <div v-if="flowItem" class="w-full">
        <div class="flex items-center justify-center">
          <AtomsCommonItemLogo :item-type="flowItem.type" :rounded="true" />
          <div class="flex items-center justify-start flex-grow ml-2">
            <input
              v-model="flowItem.name"
              type="text"
              placeholder="Untitled"
              class="px-2 focus:bg-white duration-300 transition-all bg-transparent rounded-md border-gray-300 outline-none w-full" 
            />
          </div>
          <div>
            <AtomsCommonModalWindow ref="modalwindow">
              <template #modal>
                <div class="flex flex-col items-center justify-center text-xs">
                  <h1 class="mb-2">
                    {{ `${flowItem.type} アイテムを自動生成します`  }}
                  </h1>
                  <textarea v-model="userPrompt" class="outline-none border rounded-sm mb-2 w-full" placeholder="指示を入力してください">
                  </textarea>
                  <AtomsCommonButton @click="[onGenerateFlowButtonClicked(),closeModal()]">
                    <font-awesome-icon :icon="['fas', 'wand-sparkles']" />
                    生成
                  </AtomsCommonButton>

                </div>
              </template>
              <template #button>
                <AtomsCommonButton>
                  <font-awesome-icon :icon="['fas', 'wand-sparkles']" />
                  生成
                </AtomsCommonButton>
              </template>
            </AtomsCommonModalWindow>
          </div>
          <!-- 実行ボタン -->
          <div class="pr-2 py-1 flex items-center justify-center h-full">
            <button @click="APIExecution.runFlow(flowItem); uiStore.setItemDisplayMode(flowItem, 'result') "  :class="flowItem.isItemActive ? '':'pointer-events-none opacity-40'" class="group overflow-hidden hover:bg-white rounded-xl transition-all duration-300 px-2 flex flex-col items-center justify-center">
              <div class="flex items-center justify-center">
                <img src="~/assets/play.svg" class="w-8" />
                <div class="mr-4">
                  実行
                  <div class="w-0 group-hover:w-full opacity-0 group-hover:opacity-100 h-[2px] rounded-md bg-[#842ff7] transition-all duration-500"></div>
                </div>
              </div>
            </button>
          </div>
          <!-- フローの有効化・無効化トグル -->
          <label class="inline-flex items-center cursor-pointer mt-1 mr-2 p-1">
            <input type="checkbox" v-model="flowItem.isItemActive" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#842ff7] hover:ring-1 hover:ring-[#842ff7] transition-all duration-300"></div>

          </label>
          <button @click="flowStore.removeFlowItemById(flowItem.id)" class="px-2 m-1">
            <p class=" text-red-500 text-lg hover:text-red-700 transition-all duration-200">
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </p>
          </button>

        </div>
        
        <div class="flex w-full justify-start items-center mb-4 px-2">
          <button @click="uiStore.setItemDisplayMode(flowItem,'default')" class="mr-4 flex flex-col items-center justify-center">
            <p>
              リクエスト
            </p>
            <div :class="uiStore.getItemDisplayMode(flowItem) == 'default' ? ' opacity-100' : ' opacity-0' " class="w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500">

            </div>
          </button>
          <button @click="uiStore.setItemDisplayMode(flowItem,'script')" class="mr-4 flex flex-col items-center justify-center">
            <p>
              スクリプト
            </p>
            <div :class="uiStore.getItemDisplayMode(flowItem) == 'script' ? ' opacity-100' : ' opacity-0' " class="w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500">
            </div>
          </button>
          <button @click="uiStore.setItemDisplayMode(flowItem,'result')" class="mr-4 flex flex-col items-center justify-center ">
            <p>
              実行結果
            </p>
            <div :class="uiStore.getItemDisplayMode(flowItem) == 'result' ? ' opacity-100' : ' opacity-0' " class="w-full h-[1px] bg-[#842ff7] rounded-md transition-all duration-500">
            </div>
          </button>
        </div>
        <div v-if="uiStore.getIsGenerating(flowItem.id)" class="shadow rounded-md p-4 w-full mx-auto bg-white">
          <div class="animate-pulse flex space-x-4 w-full">
            <div class="flex-1 space-y-6 py-1">
              <div class="h-2 bg-slate-200 rounded"></div>
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div class="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div class="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="flowItem.type == 'api'">
            <MoleculesApiItem :api-item="flowItem" />
          </div>
          <div v-if="flowItem.type == 'condition'">
            <MoleculesConditionItem :condition-item="flowItem" />
          </div>
          <div v-if="flowItem.type == 'loop'">
            <MoleculesLoopItem :loop-item="flowItem" />
          </div>
          <div v-if="flowItem.type == 'script'">
            <MoleculesScriptItem :script-item="flowItem" />
          </div>
          <div v-if="flowItem.type == 'end'">
            <MoleculesEndItem :end-item="flowItem" />
          </div>
          <div v-if="flowItem.type == 'wait'">
            <MoleculesWaitItem :wait-item="flowItem" />
          </div>
        </div>
        <AtomsCommonModalButton class="mt-4 " >
          <template v-slot:button>
            <button class="rounded-xl border-[#842ff7] border hover:bg-[#842ff7] hover:text-white px-3 py-1 transition duration-100 mb-2">
              <font-awesome-icon :icon="['fas', 'plus']" class="" />
              子アイテムを追加
            </button>
          </template>
          <template v-slot:modal>
            <MoleculesFlowAddItemMenu :flow-item="flowItem" />
          </template>
        </AtomsCommonModalButton>
        <div v-for="(flowItemChild, index) in flowItem.flowItems" :key="flowItemChild.id">
          <MoleculesFlowItem :flow-item="flowItemChild" />
        </div>
      </div>

    </AtomsCommonDynamicSizeWrapper>
  </div>
</template>