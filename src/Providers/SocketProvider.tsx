import { createContext, useContext, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  setSocketExternally: (socket: Socket | null) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  setSocketExternally: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
  bindControl?: (setSocketFn: (socket: Socket | null) => void) => void;
}

export const SocketProvider = ({ children, bindControl }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const setSocketExternally = useCallback((newSocket: Socket | null) => {
    setSocket(newSocket);
  }, []);

  if (bindControl) {
    bindControl(setSocketExternally);
  }

  return (
    <SocketContext.Provider value={{ socket, setSocketExternally }}>
      {children}
    </SocketContext.Provider>
  );
};
