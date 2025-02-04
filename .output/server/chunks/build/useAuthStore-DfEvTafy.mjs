import { defineStore } from 'pinia';
import { u as useFetch } from './fetch-vM0MWLpl.mjs';

const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: null
  }),
  actions: {
    async fetchUser() {
      try {
        const { data, error } = await useFetch("/api/auth/me", {
          method: "GET",
          credentials: "include"
        }, "$GxXjJDE3Ui");
        if (error.value) {
          this.user = null;
        } else {
          this.user = data.value;
        }
        return this.user;
      } catch (e) {
        this.user = null;
      }
    },
    async logout() {
      try {
        const { data, error } = await useFetch("/api/auth/me", {
          method: "GET",
          credentials: "include"
        }, "$fENtANBPvY");
        console.log(JSON.stringify(data.value));
        if (error.value) {
          this.user = null;
        } else {
          this.user = data.value;
        }
      } catch (e) {
        this.user = null;
      }
    },
    async isLoggedIn() {
      await this.fetchUser();
      return !!this.user;
    }
  }
});

export { useAuthStore as u };
//# sourceMappingURL=useAuthStore-DfEvTafy.mjs.map
