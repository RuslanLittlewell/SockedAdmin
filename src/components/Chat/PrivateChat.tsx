import { FC, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import clsx from "clsx";
import {
  Message,
  MessageType,
  privateChatUserState,
  privateMessageState,
  usersState,
} from "@/store";
import { useRecoilState, useRecoilValue } from "recoil";
import { PrivateMessageSender } from "./PrivateMessageSender";
import { sortedUsers } from "./helpers";

interface Props {
  streamId: string;
  socket: Socket | null;
  isPrivateChat: boolean;
  messages: Message[];
}
export const PrivateChat: FC<Props> = ({
  streamId,
  isPrivateChat,
  socket,
  messages,
}) => {
  const users = useRecoilValue(usersState);
  const sortedUser = sortedUsers(users);
  const [_, setMessages] = useRecoilState(privateMessageState);
  const [newMessage, setNewMessage] = useState("");
  const [fakeTokens, setFakeTokens] = useState("");
  const [fakeUser, setFakeUser] = useRecoilState(privateChatUserState);

  useEffect(() => {
    if (!fakeUser) {
      setFakeUser(sortedUser[0].name);
    }
  }, []);

  useEffect(() => {
    setMessages([]);
    socket?.emit("get-private-messages-history", { username: fakeUser });
  }, [fakeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const requestPrivate = () => {
    if (!streamId) return;
    socket?.emit("ask-private", { roomId: streamId, username: fakeUser });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        type: Number(fakeTokens) > 0 ? MessageType.Token : MessageType.Message
      };

      socket.emit("private-message", {
        username: fakeUser,
        message: messageData,
      });
      setNewMessage("");
      setFakeTokens("");
    }
  };

  const handleFinishPrivate = () => {
    socket?.emit("private-finished", { roomId: streamId });
    const messageData = {
      text: 'Private show has finised.',
      donater: fakeUser,
      sender: "Admin",
      tokens: Number(fakeTokens) || 0,
      type: MessageType.Announce,
    };

    socket?.emit("private-message", {
      username: fakeUser,
      message: messageData,
    });
  };

  return (
    <div className="relative h-full">
      <div className=" absolute right-0 rounded-lg flex gap-1 bg-gray-700 p-2 w-auto">
        <button
          className={clsx(!isPrivateChat ? "bg-green-600" : "bg-purple-600")}
          onClick={requestPrivate}
        >
          {isPrivateChat ? 'Идет приват' : 'Запросить приват'}
        </button>
        {isPrivateChat && <button className="bg-red-600" onClick={handleFinishPrivate}>
          Завершить приват
        </button>}
      </div>
      <div className="flex-1 h-[calc(100%-135px)] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const findUser = users.find((i) => i.name === message.donater);
          return (
            <div key={message.id} className={`flex items-start space-x-2`}>
              <div className={`max-w-[80%] rounded-lg`}>
                {message.tokens > 0 ? (
                  <div className="text-xs mt-1 bg-yellow-500 text-black font-bold px-1">
                    <span className="text-red-500">{message.donater}</span>{" "}
                    tipped {message.tokens} token
                  </div>
                ) : message.isHost ? (
                  <div className="text-sm bg-orange-500 rounded px-2">
                    Streamer: {message.text}
                  </div>
                ) : (
                  <div className="text-sm">
                    {" "}
                    <span className={clsx("text-black-500", findUser?.color)}>
                      {message.donater}
                    </span>
                    : {message.text}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <PrivateMessageSender
        setFakeTokens={setFakeTokens}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        newMessage={newMessage}
        fakeTokens={fakeTokens}
        setFakeUser={setFakeUser}
        fakeUser={fakeUser}
        users={users}
      />
    </div>
  );
};
