<template>
    <div>
      <h1>ストリーム結果</h1>
      <div style="margin-bottom: 1em;">
        <button @click="startStream" :disabled="streaming">開始</button>
        <button @click="stopStream" :disabled="!streaming">停止</button>
      </div>
      <ul>
        <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const messages = ref<string[]>([])
  const streaming = ref(false)
  let abortController: AbortController | null = null
  
  async function startStream() {
    if (streaming.value) return
    streaming.value = true
    messages.value = []
  
    abortController = new AbortController()
  
    try {
      const response = await fetch('/api/stream-example', { signal: abortController.signal })
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
  
      if (!reader) {
        streaming.value = false
        return
      }
  
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          // ストリーム終了
          break
        }
  
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
        for (const line of lines) {
          const data = line.replace(/^data:\s*/, '')
          messages.value.push(data)
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('通信はユーザーによって中断されました')
      } else {
        console.error('ストリーム読み込み中にエラーが発生しました', error)
      }
    } finally {
      streaming.value = false
    }
  }
  
  function stopStream() {
    if (abortController) {
      abortController.abort()
    }
  }
  </script>
  