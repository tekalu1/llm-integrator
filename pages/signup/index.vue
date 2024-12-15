<template>
    
    <div class="w-full h-full flex items-center justify-center">
        <div class="h-[40%] flex items-center justify-center bg-white rounded-xl shadow-[0px_0px_24px_0px_rgb(0,0,0,0.2)] overflow-hidden">
            <div class="flex flex-col items-center justify-center flex-grow px-8"> 
                <div class="flex flex-col items-start justify-center flex-grow"> 
                    <h1 class="border-l-2 border-[#842ff7] px-2 text-2xl mb-4">
                        Sign Up
                    </h1>
                    <form @submit.prevent="onSubmit" class="text-base">
                        <div class="mb-2">
                            <input v-model="username" placeholder="Username" required class="outline-none" />
                        </div>
                        <div>
                            <input type="password" v-model="password" placeholder="Password" required class="outline-none" />
                        </div>
                        <div class="mb-2">
                            <input type="email" v-model="email" placeholder="Email Address" required class="outline-none" />
                        </div>
                        <button type="submit" class="bg-[#6e7af8] border border-gray-200 rounded-lg text-white text-lg px-3 py-1 w-full mt-4">登録</button>
                    </form>
                    <p v-if="error" style="color:red;">{{ error }}</p>
                </div>
                
                <a href="/login" class="mt-4">
                    <p class="text-gray-500 underline">
                        Loginはこちら
                    </p>
                </a>
            </div>
            <div class="flex items-center justify-center h-full px-8  text-white font-bold border border-gray-300 bg-gradient-to-r from-[#6e7af8] from-5% via-[#6c56e4] via-30% to-[#842ff7] to-80% transition duration-300 text-2xl " >
                <AtomsCommonAppLogo />  
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
    definePageMeta({ layout: 'auth' })
    const authStore = useAuthStore()

    const username = ref('')
    const password = ref('')
    const email = ref('')
    const error = ref(null)
    
    const onSubmit = async () => {
        error.value = null
        try {
        const { data, error: fetchError } = await useFetch('/api/auth/signup', {
            method: 'POST',
            body: { username: username.value, password: password.value, email: email.value }
        })
        if (fetchError.value) {
            error.value = fetchError.value.data.error
            return
        }
        // サインアップ成功時
        navigateTo('/login')
        } catch (e) {
        error.value = 'An error occurred'
        }
    }
  </script>
  