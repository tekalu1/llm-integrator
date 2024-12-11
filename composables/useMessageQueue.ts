import { ref } from 'vue';

// メッセージの型を定義
type MessageType = 'error' | 'success' | 'info' | 'warning';

interface Message {
  type: MessageType;
  content: string;
  id: number; // 一意の識別子
}

export function useMessageQueue() {
  const messageQueue = ref<Message[]>([]);
  let messageId = 0; // 一意のID生成用

  // メッセージを追加
  function addMessage(type: MessageType, content: string, duration = 5000) {
    const id = messageId++;
    messageQueue.value.push({ type, content, id });

    // 指定時間後に自動削除
    setTimeout(() => {
      removeMessage(id);
    }, duration);
  }

  // メッセージを削除
  function removeMessage(id: number) {
    messageQueue.value = messageQueue.value.filter((msg) => msg.id !== id);
  }

  return {
    messageQueue,
    addMessage,
    removeMessage,
  };
}
