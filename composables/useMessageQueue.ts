// メッセージの型を定義
type MessageType = 'error' | 'success' | 'info' | 'warning';

interface Message {
  type: MessageType;
  content: string;
  id: number; // 一意の識別子
}

import { defineStore } from 'pinia';

export const useMessageQueue = defineStore('messageQueue', {
  state: () => ({
    messageQueue: [] as Message[],
    messageId: 0
  }),
  actions: {
    addMessage(type: MessageType, content: string, duration = 5000) {
      const id = this.messageId++;
      this.messageQueue.push({ type, content, id });
  
      // 指定時間後に自動削除
      setTimeout(() => {
        this.removeMessage(id);
      }, duration);
    },
    removeMessage(id: number) {
      this.messageQueue = this.messageQueue.filter((msg) => msg.id !== id);
    }
  }
});