<template>
    <div class=" m-2 p-1">
        <h1 class="text-sm">
            登録済みのノウハウ
        </h1>
        <div class="relative h-[40vh] ">
            <AtomsCommonCoolScrollBarContainer class="h-full flex flex-col">
                <div class="flex flex-wrap ">
                    <div v-for="(document, index) in documentListWithMetaData" :key="document.documentId" class="lg:w-1/6 w-1/3 h-64 bg-white border-gray-300 m-2 p-2 rounded-md flex flex-col items-start justify-center transition-all duration-150" :class="selectedDocumentId === document.documentId ? 'outline outline-blue-500':'outline-none'" @click="onDocumentSelected(document.documentId, document.version)">
                        <div class="flex items-center justify-center">
                            <!-- <div class="h-3 w-3 mr-2" :class="selectedDocumentId === document.documentId ? 'bg-blue-500':'bg-gray-500'">
                            </div> -->
                            <h1 class="flex-grow">
                                {{ document.name }}
                            </h1>

                        </div>
                        <div class="flex-grow overflow-hidden text-ellipsis">
                            <div v-for="(metaDataElement, index) in document.metaData" :key="index" class="mb-2 p-1 rounded-md bg-gray-200">
                                <span class="bg-purple-500 text-white px-1 rounded-md">
                                    {{ `#chank-${index + 1}` }}
                                </span>
                                {{ metaDataElement }}

                            </div>
                        </div>
                    </div>
                </div>
            </AtomsCommonCoolScrollBarContainer>
        </div>
    </div>
    <div class=" m-2 p-1">
        <h1 class="text-sm">登録</h1>
        
        <!-- <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
        <input class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"  accept=".pdf,.txt,.docx" @click="handleSubmit"> -->

        <form ref="formElement" class="flex flex-col">
            <input type="file" ref="fileInput" accept=".pdf,.txt,.docx" class="mb-2"  />
            <div class="mb-2">
                <button class="bg-blue-500 rounded-md px-2 py-1 relative z-0 overflow-hidden  text-white" @click="handleSubmit">
                    チャンクに変換
                </button>
            </div>
        </form>
        <div class="relative h-[20vh] mb-2 ">
            <AtomsCommonCoolScrollBarContainer class="h-full flex flex-col p-2">

                <div v-for="(text, index) in splitText" :key="index" class="mb-2 p-1 rounded-md bg-gray-200">
                    <span class="bg-purple-500 text-white px-1 rounded-md">
                        {{ `#chank-${index + 1}` }}
                    </span>
                    {{ text }}

                </div>
            </AtomsCommonCoolScrollBarContainer>
        </div>
        <div>
            <button @click="upsertChunks" class="bg-blue-500 transit duration-200 rounded-md px-2 py-1 relative z-0 overflow-hidden  text-white">
                登録
            </button>

            <!-- 成功メッセージ表示 -->
            <p v-if="upsertCount !== null">
            結果：Upserted {{ upsertCount }} chunks!
            </p>
        </div>
    </div>


    <div class="border border-black m-2 p-1">
        <h1>RAG Demo</h1>
        <input v-model="userQuery" placeholder="質問を入力" />
        <button @click="ask">Ask</button>

        <div v-if="answer">
        <h2>回答</h2>
        <p>{{ answer }}</p>
        <h3>参照コンテキスト</h3>
        <ul>
            <li v-for="(ctx, idx) in context" :key="idx">
            {{ ctx }}
            </li>
        </ul>
        </div>
    </div>
</template>

<script setup lang="ts">

    const authStore = useAuthStore()
    const selectedDocumentId = ref('')
    const selectedVersion = ref('')
    const flowStore = useFlowStore()

    const onDocumentSelected = (documentId: string, version) => {
        selectedDocumentId.value = documentId
        selectedVersion.value = version
    }

    const documentList = ref()
    // 登録済みデータ取得
    const getDocumentList = async() => {
        await authStore.fetchUser()

        if(!authStore.user){
            throw new Error('no userId')
        }

        // ドキュメントリスト取得
        const response = await $fetch('/api/rag/get-document-list', {
            method: 'POST',
            body: { 
                userId: authStore.user.id
            }
        })
        if (response.error) {
            throw new Error(response.error.message)
        }else{
            documentList.value = JSON.parse(JSON.stringify(response))
        }

    }

    const documentListWithMetaData = ref([])

    // ドキュメントのメタ情報取得
    const getDocumentMetaData = async() => {
        try{
            await getDocumentList()
        documentListWithMetaData.value = []
        for(const document of documentList.value){
            console.log('document : ' + JSON.stringify(document))
            const response = await $fetch('/api/rag/get-document-meta-data', {
                method: 'POST',
                body: { 
                    userId: authStore.user.id, 
                    documentId: document.documentId, 
                    version: document.version
                }
            })
            if (document.error) {
                throw new Error(document.error.message)
            }else{
                documentListWithMetaData.value.push(
                    {
                        documentId: document.documentId,
                        version: document.version,
                        name: response.documentName,
                        metaData: response.metaData
                    }
                )
            }
        }
        }catch(e){
            console.error(e.message)
        }
    }
    
    await getDocumentMetaData()

    import { CharacterTextSplitter } from "@langchain/textsplitters";
    const textSplitter = new CharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 0,
    });

    const splitText= ref([])

    const fileInput = ref(null);
    const markdown = ref('');
    const formElement = ref(null);

    const onSplitTextClicked = async() => {
        splitText.value =  await textSplitter.splitText(markdown.value);
    }


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

    // upsert
    // テキストの入力状態を保持
    const text = ref('')
    // API 呼び出し後、アップサートしたチャンク数を表示するための状態
    const upsertCount = ref<number | null>(null)

    async function upsertChunks() {
        try {

            await authStore.fetchUser()

            if(!authStore.user){
                throw new Error('Error upserting chunks: no userId')
            }

            // テキストを改行で分割し、空行を取り除いて配列化
            const chunks = splitText.value
            
            // /api/upsert-chunks API に chunks を送信
            const result = await $fetch('/api/rag/upsert-chunks', {
                method: 'POST',
                body: { 
                    apiKey: flowStore.masterFlow.variables['openAiApiKey'],
                    chunks: chunks, 
                    userId: authStore.user.id 
                }
            })

            // 結果を受け取って表示
            upsertCount.value = result.upserted
            
            await getDocumentMetaData()
        } catch (error) {
            throw new Error('Error upserting chunks:' + error.message)
        }
    }


    // RAG実行
    const userQuery = ref('')
    const answer = ref('')
    const context = ref<string[]>([])

    async function ask() {
    try {
        await authStore.fetchUser()

        if(!authStore.user){
            throw new Error('no userId')
        }
        if(selectedDocumentId.value === ''){
            throw new Error('no selectedDocumentId')
        }
        if(selectedVersion.value === ''){
            throw new Error('no selectedVersion')
        }
        const res = await $fetch('/api/rag/execute', {
        method: 'POST',
        body: { 
            apiKey: flowStore.masterFlow.variables['openAiApiKey'],
            query: userQuery.value,
            userId: authStore.user.id, 
            documentId: selectedDocumentId.value, 
            version: selectedVersion.value
        }
        })
        answer.value = res.answer
        context.value = res.context
    } catch (error) {
        console.error(error)
    }
    }
</script>
  