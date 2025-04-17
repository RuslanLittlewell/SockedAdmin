import { FC, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import clsx from "clsx";
import { generalChatUserState, Message, MessageType, usersState } from "@/store";
import { MessageSender } from "./MessageSender";
import { useRecoilState, useRecoilValue } from "recoil";

interface Props {
  streamId: string;
  messages: Message[];
  socket: Socket | null;
}
export const GeneralChat: FC<Props> = ({
  messages,
  streamId,
  socket,
}) => {
  const users = useRecoilValue(usersState);
  const [newMessage, setNewMessage] = useState("");
  const [fakeTokens, setFakeTokens] = useState("");
  const [fakeUser, setFakeUser] = useRecoilState(generalChatUserState);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(!fakeUser) { 
      setFakeUser(users[0]?.name);
    }
  }, [users]);

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

      socket.emit("chat message", messageData);
      setNewMessage("");
      setFakeTokens("");
    }
  };

  const deleteAllMessages = () => {
    if (!streamId) return;
    socket?.emit("delete-all-messages", { roomId: streamId });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      <MessageSender
        setFakeUser={setFakeUser}
        sendMessage={sendMessage}
        setFakeTokens={setFakeTokens}
        setNewMessage={setNewMessage}
        fakeUser={fakeUser}
        fakeTokens={fakeTokens}
        newMessage={newMessage}
        deleteAllMessages={deleteAllMessages}
        users={users}
      />
    </>
  );
};
