import { useSocket } from "../context";

export function useWebSocket() {
  const { socket, isConnected } = useSocket();

  const emit = (event: string, data: unknown) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: unknown) => void) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {}; // return noop to avoid undefined errors in useEffect cleanups
  };

  return {
    socket,
    isConnected,
    emit,
    on,
  };
}
