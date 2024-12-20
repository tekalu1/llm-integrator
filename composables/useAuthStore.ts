import { defineStore } from 'pinia';

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null
  }),
  actions: {
    async fetchUser(){
      try {
        const { data, error } = await useFetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        console.log(JSON.stringify(data.value))
        if (error.value) {
          this.user = null
        } else {
          this.user = data.value
        }
      } catch (e) {
        this.user = null
      }
    },
    async logout(){
      try {
        const { data, error } = await useFetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        console.log(JSON.stringify(data.value))
        if (error.value) {
          this.user = null
        } else {
          this.user = data.value
        }
      } catch (e) {
        this.user = null
      }
    },
    async isLoggedIn(){
      await this.fetchUser()
      return !!this.user
    }
  }
});