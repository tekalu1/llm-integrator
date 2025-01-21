<template>
    <div>
        <h1>File to Markdown Converter</h1>
        <form ref="formElement">
            <input type="file" ref="fileInput" accept=".pdf,.txt,.docx" />
            <button type="button" @click="handleSubmit">Convert</button>
        </form>
        <div>
            <!-- 後で、https://js.langchain.com/docs/concepts/text_splitters/　を参照して、splitのチャンクを種類を選択できるようにしたい -->
            <div v-for="(text, index) in splitText" :key="index" class="flex flex-col items-start justify-center p-1 m-1 border border-black">
                {{ text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import { CharacterTextSplitter } from "@langchain/textsplitters";
    const textSplitter = new CharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 0,
    });

    const splitText= ref([])

    const onSplitTextClicked = async() => {
        splitText.value =  await textSplitter.splitText(markdown.value);
    }

    const fileInput = ref(null);
    const markdown = ref('');
    const formElement = ref(null);

    const handleSubmit = async (event) => {
    event?.preventDefault(); // デフォルト動作を防ぐ（念のため）
    console.log('Form submitted'); // デバッグ用

    if (!fileInput.value || !fileInput.value.files.length) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.value.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await $fetch('/api/convert-to-markdown-v2', {
            method: 'POST',
            body: formData,
        });
        if (response.error) {
            console.error(response.error);
        } else {
            markdown.value = response.markdown;
            await onSplitTextClicked()
        }
    } catch (error) {
        console.error('Error:', error);
    }
    };
</script>
  