import { useMessageQueue } from '~/composables/useMessageQueue';

export default defineNuxtPlugin((nuxtApp) => {
  const { addMessage } = useMessageQueue();

  // Vueコンポーネント内で発生するエラーをキャッチ
  nuxtApp.vueApp.config.errorHandler = (err, vm, info) => {
    console.error('Vueエラー:', err, info);
    if (err instanceof Error) {
      addMessage('error', `Vueエラー: ${err.message}`);
    } else {
      addMessage('error', `Vueエラー: ${String(err)}`);
    }
  };

  // キャッチされないPromiseのエラーをキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromiseエラー:', event.reason);
    if (event.reason instanceof Error) {
      addMessage('error', `Promiseエラー: ${event.reason.message}`);
    } else {
      addMessage('error', `Promiseエラー: ${String(event.reason)}`);
    }
  });

  // ブラウザのグローバルエラーをキャッチ
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('グローバルエラー:', message, source, lineno, colno, error);
    if (error instanceof Error) {
      addMessage('error', `グローバルエラー: ${error.message}`);
    } else {
      addMessage(
        'error',
        `グローバルエラー: ${String(message)} (${source}:${lineno}:${colno})`
      );
    }
  };
});
