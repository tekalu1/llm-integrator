<template>
    <div>
      <h1>Document to Markdown</h1>
      <input type="file" @change="onFileChange" />
      <button @click="convertToMarkdown">Convert to Markdown</button>
      <pre v-if="markdown">{{ markdown }}</pre>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const file = ref(null);
  const markdown = ref('');
  
  const onFileChange = (event) => {
    file.value = event.target.files[0];
  };
  
  const convertToMarkdown = async () => {
    if (!file.value) {
      alert('Please select a file');
      return;
    }
  
    try {
      // ファイルデータをArrayBufferに変換
      const arrayBuffer = await file.value.arrayBuffer();
      const fileType = file.value.name.split('.').pop(); // ファイルの拡張子
  
      // サーバーにリクエストを送信
      const response = await fetch('/api/convert-to-markdown', {
        method: 'POST',
        body: JSON.stringify({
          fileBuffer: Array.from(new Uint8Array(arrayBuffer)), // ArrayBufferを数値配列に変換
          fileType,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        markdown.value = data.markdown;
      }
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };
  </script>
  