import { defineStore } from 'pinia';

const useMessageQueue = defineStore("messageQueue", {
  state: () => ({
    messageQueue: [],
    messageId: 0
  }),
  actions: {
    addMessage(type, content, duration = 5e3) {
      const id = this.messageId++;
      this.messageQueue.push({ type, content, id });
      setTimeout(() => {
        this.removeMessage(id);
      }, duration);
    },
    removeMessage(id) {
      this.messageQueue = this.messageQueue.filter((msg) => msg.id !== id);
    }
  }
});

export { useMessageQueue as u };
//# sourceMappingURL=useMessageQueue-EDFjpfdQ.mjs.map
