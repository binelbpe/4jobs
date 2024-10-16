import { socketService } from '../services/socketService';

export const createSocketListener = (event: string, callback: (...args: any[]) => void) => {
  const removeListener = socketService.on(event, callback);
  return () => {
    if (typeof removeListener === 'function') {
      removeListener();
    }
  };
};
