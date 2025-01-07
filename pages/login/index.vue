<template>
    <!-- <div v-if="!authStore.isLoggedIn()" class="w-full h-full flex flex-col items-center justify-center"> -->
    <div class="w-full h-full flex items-center justify-center">
        <div class="md:h-[40%] w-full h-full md:w-[40%] flex max-md:flex-col-reverse max-md:justify-end items-center justify-center bg-white rounded-xl shadow-[0px_0px_24px_0px_rgb(0,0,0,0.2)] overflow-hidden">
            <div class="flex flex-col items-center justify-center px-8 md:px-36 py-16"> 
                <div class="flex flex-col items-start justify-center flex-grow"> 
                    <h1 class="border-l-2 border-[#842ff7] px-2 text-2xl mb-4">
                        Login
                    </h1>
                    <form @submit.prevent="onSubmit" class="text-base">
                        <div class="mb-2">
                            <input v-model="username" placeholder="Username" required class="outline-none" />
                        </div>
                        <div>
                            <input type="password" v-model="password" placeholder="Password" required class="outline-none" />
                        </div>
                        <button type="submit" class="bg-[#6e7af8] border border-gray-200 rounded-lg text-white text-lg px-3 py-1 w-full mt-4">Login</button>
                    </form>
                    <p v-if="error" style="color:red;">{{ error }}</p>
                </div>
                <a href="/signup" class="mt-4">
                    <p class="text-gray-500 underline">
                        登録はこちら
                    </p>
                </a>
            </div>
            <div class="flex items-center justify-center md:h-full w-full md:flex-grow px-8 py-8  text-white font-bold border border-gray-300 bg-gradient-to-r from-[#6e7af8] from-5% via-[#6c56e4] via-30% to-[#842ff7] to-80% transition duration-300 text-2xl " >
                <AtomsCommonAppLogo />  
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
    definePageMeta({ layout: 'auth' })
    const authStore = useAuthStore()
    await authStore.fetchUser()
    
    const username = ref('')
    const password = ref('')
    const error = ref(null)

    onMounted(async () =>{
        const isLoggedIn = await authStore.isLoggedIn()
        if(isLoggedIn){
            window.location.href = '/'
        }
    })
    
    const onSubmit = async () => {
        error.value = null
        try {
        const { data, error: fetchError } = await useFetch('/api/auth/login', {
            method: 'POST',
            body: { username: username.value, password: password.value },
            credentials: 'include'
        })
        if (fetchError.value) {
            error.value = fetchError.value.data.error
            return
        }
        // ログイン成功後、ユーザー情報を取得
        await authStore.fetchUser()
        const isLoggedIn =  await authStore.isLoggedIn()
        if(isLoggedIn){
            navigateTo('/')
        }else{
            throw new Error('ユーザー名またはパスワードが異なります');
        }
        } catch (e) {
            error.value = e.message ? e.message : 'An error occurred'
        }
    }
  </script>
  