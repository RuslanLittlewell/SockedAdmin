import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isHost?: boolean;
  isModerator: boolean;
  tokens: number;
  donater?: string;
}

interface ChatProps {
  streamId: string;
}

const Chat: React.FC<ChatProps> = ({ streamId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [fakeUser, setFakeUser] = useState("");
  const [fakeTokens, setFakeTokens] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const newSocket = io(apiUrl, {
      query: {
        roomId: streamId,
        username: "Admin",
      },
    });

    newSocket.on("connect", () => {
      console.log("Подключено к серверу");
    });

    newSocket.on("messageHistory", (history: Message[]) => {
      console.log("Получена история сообщений:", history);
      setMessages(history);
    });

    newSocket.on("chat message", (message: Message) => {
      console.log("Получено новое сообщение:", message);
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("messages-deleted", () => {
      console.log("🗑️ Все сообщения были удалены сервером.");
      setMessages([]); // Очистка локального состояния сообщений на клиенте
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [streamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || fakeUser.trim()) && socket) {
      const messageData = {
        text: newMessage,
        donater: fakeUser,
        sender: "Admin",
        tokens: Number(fakeTokens) || 0,
      };
      console.log("Отправка сообщения:", messageData);
      socket.emit("chat message", messageData);
      setNewMessage("");
      setFakeTokens("");
      setFakeUser("");
    }
  };

  const deleteAllMessages = () => {
    if (!streamId) return;
    socket?.emit("delete-all-messages", { roomId: streamId });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Чат трансляции</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-250px)]">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-2`}>
            <div className={`max-w-[80%] rounded-lg`}>
              {message.tokens > 0 ? (
                <div className="text-xs mt-1 bg-yellow-500 text-black font-bold px-1">
                  <span className="text-red-500">{message.donater}</span> tipped{" "}
                  {message.tokens} token
                </div>
              ) : message.isHost ? <div className="text-sm bg-orange-500 rounded px-2">Streamer: {message.text}</div>: (
                <div className="text-sm">
                  {" "}
                  <span className="text-black-500">
                    {message.donater}
                  </span>: {message.text}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={fakeUser}
            onChange={(e) => setFakeUser(e.target.value)}
            placeholder="Пользователь"
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="number"
            value={fakeTokens}
            onChange={(e) => setFakeTokens(e.target.value)}
            placeholder="Количество токенов"
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Отправить
          </button>
        </div>
      </form>
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={fakeUser}
            onChange={(e) => setFakeUser(e.target.value)}
            placeholder="Пользователь"
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Отправить
          </button>
        </div>
      </form>
      <button onClick={deleteAllMessages} className="bg-red-500">
        Удалить все сообщения
      </button>
    </div>
  );
};

export default Chat;
