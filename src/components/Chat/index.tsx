import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRecoilState } from "recoil";
import { toast } from "react-toastify";
import {
  Message,
  messageState,
  privateChatUserState,
  privateMessageState,
  usersState,
  UserStateProps,
} from "@/store";
import { GeneralChat } from "./GeneralChat";
import { PrivateChat } from "./PrivateChat";
import MessageSounds from "@/assets/sounds/message.mp3";

import clsx from "clsx";
import { useSocket } from "@/Providers/SocketProvider";

interface ChatProps {
  roomId: string;
  username: string;
}

const Chat: React.FC<ChatProps> = ({ roomId, username }) => {
  const [messages, setMessages] = useRecoilState(messageState);
  const [privateMessages, setPrivateMessages] =
    useRecoilState(privateMessageState);
  const [selectedUser, setSelectedUser] = useRecoilState(privateChatUserState);
  const [users, setUsers] = useRecoilState(usersState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isPrivateChat, setPrivateChat] = useState(false);
  const { setSocketExternally } = useSocket();

  const [tab, setTab] = useState(0);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const newSocket = io(apiUrl, {
      query: {
        roomId,
        username,
      },
    });

    newSocket.on("connect", () => {
      console.log("Подключено к серверу");
    });

    newSocket.on("messageHistory", (history: Message[]) => {
      setMessages(history);
    });

    newSocket.on("send-private-message-history", (data) => {
      setPrivateMessages(data);
    });

    newSocket.on("chat message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("private-message", (message: Message) => {
      setPrivateMessages((prev) => [...prev, message]);
      if (selectedUser !== message.toUser) {
        new Audio(MessageSounds).play();
        const findsUser = users.find((i) => i.name === message.toUser);

        const openChat = () => {
          setTab(1);
          setSelectedUser(message.toUser);
        };
        toast(
          <div className={clsx("flex flex-col")} onClick={openChat}>
            <div>
              To:{" "}
              <span className={clsx(findsUser?.color)}>{message.toUser}</span>:
            </div>
            <div>{message.text}</div>
          </div>
        );
      }
    });

    newSocket.on("messages-deleted", () => {
      setMessages([]);
    });

    newSocket.on("start-private", () => {
      setPrivateChat(true);
    });

    newSocket.on("private-finished", () => {
      setPrivateChat(false);
    });

    newSocket.on("usersData", (users: UserStateProps[]) => {
      setUsers(users);
    });

    setSocket(newSocket);
    setSocketExternally(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, selectedUser]);

  const tabs = [
    <GeneralChat messages={messages} streamId={roomId} socket={socket} />,
    <PrivateChat
      isPrivateChat={isPrivateChat}
      messages={privateMessages}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      socket={socket}
      streamId={roomId}
    />,
  ];
  const tabNames = ["Общий чат", "Личные соoбщения"];
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <div className="border-b border-gray-700 gap-2 grid grid-cols-2 p-1 pb-0">
        {tabNames.map((i, idx) => (
          <h2
            key={idx}
            onClick={() => setTab(idx)}
            className={clsx(
              "p-4 text-xl font-extralight text-white text-center cursor-pointer rounded-[4px_4px_0_0]",
              idx === tab ? "bg-white/15" : "bg-white/5"
            )}
          >
            {i}
          </h2>
        ))}
      </div>
      {tabs[tab]}
    </div>
  );
};

export default Chat;
