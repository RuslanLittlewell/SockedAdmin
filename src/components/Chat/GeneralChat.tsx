import { FC, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { generalChatUserState, Message, MessageType, usersState } from "@/store";
import { MessageSender } from "./MessageSender";
import { useRecoilState, useRecoilValue } from "recoil";
import { MessageBlock } from "./MessageBlock";

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
        {messages.map((message) => ( <MessageBlock key={message.id} message={message} />))}
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
