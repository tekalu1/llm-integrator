<template>
    <div class="pl-4 border-l-2 border-[#842ff7] py-[2px] w-full">
      <div class="grid grid-cols-12 gap-2 w-full">
        <input
          v-model="parameter.key"
          placeholder="キー"
          class="col-span-3 px-2 outline-none rounded border bg-white focus:bg-white"
        />
        
        <select
          v-model="parameter.type"
          class="col-span-2 px-2 outline-none rounded border bg-white focus:bg-white"
        >
          <option value="string">文字列</option>
          <option value="number">数値</option>
          <option value="boolean">真偽値</option>
          <option value="object">オブジェクト</option>
          <option value="array">配列</option>
        </select>
        
        <div class="col-span-7">
          <div
            class="flex justify-end items-center h-full "
          >
            <div class="flex-grow h-full ">
              <template v-if="parameter.type === 'boolean'">
                <select
                  v-model="parameter.value"
                  class="w-full px-2 outline-none rounded border h-full"
                >
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
              </template>
              
              <template v-else-if="parameter.type === 'object' || parameter.type === 'array'">
                <div class="flex justify-start items-center h-full">
                  <p class="mr-2">
                    子要素
                  </p>
                  <button
                    @click="addChild"
                    class="text-xs text-[#842ff7] hover:bg-[#842ff7] active:bg-purple-900 hover:text-white transition-all duration-200 aspect-square px-1 border border-[#842ff7] rounded-full flex justify-center items-center"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </div>
              </template>
              
              <template v-else>
                <input
                  v-model="parameter.value"
                  :type="parameter.type === 'number' ? 'number' : 'text'"
                  class="w-full h-full px-2 py-1 outline-none rounded border bg-white focus:bg-white"
                />
              </template>
            </div>
            
            <button
            @click="$emit('remove')"
            class="ml-2 mr-1"
            >
              <p class=" text-red-500 hover:text-red-700 transition-all duration-300">
                <font-awesome-icon :icon="['fas', 'minus']" />
              </p>
            </button>
          </div>
        </div>
      </div>
  
      <div v-if="parameter.children && parameter.children.length > 0" class="pl-4">
        <div
          v-for="(child, index) in parameter.children"  
          :key="index"
        >
          <MoleculesApiRequestParameterEditor
            :model-value="child"
            @remove="removeChild(index)"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { type RequestParameter } from '@/types/item/api';
  const props = defineProps<{
    modelValue: RequestParameter;
  }>();
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: RequestParameter): void;
    (e: 'remove'): void;
  }>();
  
  const parameter = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });
  
  const addChild = () => {
    if (!parameter.value.children) {
      parameter.value.children = [];
    }
    parameter.value.children.push({
      key: '',
      type: 'string',
      value: '',
    });
  };
  
  const removeChild = (index: number) => {
    parameter.value.children?.splice(index, 1);
  };
  
  watch(() => parameter.value.type, (newType) => {
    if (newType === 'object' || newType === 'array') {
      parameter.value.value = undefined;
      if (!parameter.value.children) {
        parameter.value.children = [];
      }
    } else {
      parameter.value.children = undefined;
      parameter.value.value = '';
    }
  });
  </script>