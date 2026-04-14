import { useSocket } from "../context";

export function useWebSocket() {
  const { socket, isConnected } = useSocket();

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  };

  return {
    socket,
    isConnected,
    emit,
    on,
  };
}
