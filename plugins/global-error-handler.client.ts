import { useMessageQueue } from '~/composables/useMessageQueue';

export default defineNuxtPlugin((nuxtApp) => {

  // Vueコンポーネント内で発生するエラーをキャッチ
  nuxtApp.vueApp.config.errorHandler = (err, vm, info) => {
    console.error('Vueエラー:', err, info);
    if (err instanceof Error) {
      useMessageQueue().addMessage('error', `Vueエラー: ${err.message}`);
    } else {
      useMessageQueue().addMessage('error', `Vueエラー: ${String(err)}`);
    }
  };

  // キャッチされないPromiseのエラーをキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromiseエラー:', event.reason);
    if (event.reason instanceof Error) {
      useMessageQueue().addMessage('error', `Promiseエラー: ${event.reason.message}`);
    } else {
      useMessageQueue().addMessage('error', `Promiseエラー: ${String(event.reason)}`);
    }
  });

  // ブラウザのグローバルエラーをキャッチ
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('グローバルエラー:', message, source, lineno, colno, error);
    if (error instanceof Error) {
      useMessageQueue().addMessage('error', `グローバルエラー: ${error.message}`);
    } else {
      useMessageQueue().addMessage(
        'error',
        `グローバルエラー: ${String(message)} (${source}:${lineno}:${colno})`
      );
    }
  };


  nuxtApp.hook('app:error', (error) => {
    useMessageQueue().addMessage('error', error.message || 'An unknown error occurred');
  })
});
