export default defineNuxtPlugin(() => {
    // クライアントサイド専用の初期化処理
    return {
      provide: {
        storage: {
          getItem: (key: string) => localStorage.getItem(key),
          setItem: (key: string, value: string) => localStorage.setItem(key, value),
          removeItem: (key: string) => localStorage.removeItem(key)
        }
      }
    };
  });