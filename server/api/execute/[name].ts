import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  return { 
    userMessage: event.context.params.name,
  };
});