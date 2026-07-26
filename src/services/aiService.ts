import { ChatMessage } from '../types';

export const generateStreamResponse = async (
  prompt: string,
  systemInstruction: string,
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> => {
  return new Promise((resolve) => {
    const text = "This is a simulated response. AI integrations have been removed.";
    let i = 0;
    const interval = setInterval(() => {
      onChunk(text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve(text);
      }
    }, 20);
  });
};

export const checkConnection = async (): Promise<boolean> => {
  return true;
};
