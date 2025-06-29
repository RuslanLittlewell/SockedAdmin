import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRecoilState } from "recoil";
import { toast } from 'react-toastify';
import { Message, messageState, privateChatUserState, privateMessageState, usersState, UserStateProps } from "@/store";
import { GeneralChat } from "./GeneralChat";
import { PrivateChat } from "./PrivateChat";
import MessageSounds from "@/assets/sounds/message.mp3";

import clsx from "clsx";

interface ChatProps {
  streamId: string;
}

const Chat: React.FC<ChatProps> = ({ streamId }) => {
  const [messages, setMessages] = useRecoilState(messageState);
  const [privateMessages, setPrivateMessages] = useRecoilState(privateMessageState);
  const [fakeUser, setFakeUser] = useRecoilState(privateChatUserState);
  const [users, setUsers] = useRecoilState(usersState);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isPrivateChat, setPrivateChat] = useState(false);

  const [tab, setTab] = useState(0);

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
      if(fakeUser !== message.toUser) {
        new Audio(MessageSounds).play();
        const findsUser = users.find(i => i.name === message.toUser);

        const openChat = () => {
          setTab(1);
          setFakeUser(message.toUser)
        }
        toast(<div className={clsx("flex flex-col")} onClick={openChat}>
          <div>To: <span className={clsx(findsUser?.color)}>{message.toUser}</span>:</div>
          <div>{message.text}</div>
        </div>);
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

    return () => {
      newSocket.close();
    };
  }, [streamId]);

  const tabs = [
    <GeneralChat
      messages={messages}
      streamId={streamId}
      socket={socket}
    />,
    <PrivateChat
      isPrivateChat={isPrivateChat}
      messages={privateMessages}
      socket={socket}
      streamId={streamId}
    />,
  ];
  const tabNames = ["Общий чат", "Личные соoбщения"];
  return (
    <div className="flex flex-col w-3/5 h-full overflow-hidden">
      <div className="border-b border-gray-700 grid grid-cols-2 divide-x-2 divide-white/40">
        {tabNames.map((i, idx) => (
          <h2
            key={idx}
            onClick={() => setTab(idx)}
            className={clsx(
              "p-4 text-xl font-extralight text-white text-center cursor-pointer",
              idx === tab && "bg-white/10"
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
