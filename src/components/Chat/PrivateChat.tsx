import { FC, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import clsx from "clsx";
import {
  Message,
  MessageType,
  privateMessageState,
  usersState,
} from "@/store";
import { useRecoilState, useRecoilValue } from "recoil";
import { PrivateMessageSender } from "./PrivateMessageSender";
import { sortedUsers } from "./helpers";
import { UsersList } from "./UsersList";
import { GoArrowLeft } from "react-icons/go";

interface Props {
  streamId: string;
  socket: Socket | null;
  isPrivateChat: boolean;
  selectedUser: string | undefined;
  setSelectedUser: (name: string | undefined) => void;
  messages: Message[];
}
export const PrivateChat: FC<Props> = ({
  streamId,
  isPrivateChat,
  selectedUser,
  setSelectedUser,
  socket,
  messages,
}) => {
  const users = useRecoilValue(usersState);
  const sortedUser = sortedUsers(users);
  const [_, setMessages] = useRecoilState(privateMessageState);
  const [newMessage, setNewMessage] = useState("");
  const [fakeTokens, setFakeTokens] = useState("");

  useEffect(() => {
    setMessages([]);
    socket?.emit("get-private-messages-history", { username: selectedUser });
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const requestPrivate = () => {
    if (!streamId) return;
    socket?.emit("ask-private", { roomId: streamId, username: selectedUser });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || selectedUser?.trim()) && socket) {
      if (Number(fakeTokens) > 0) {
        const messageData = {
          text: newMessage,
          donater: selectedUser,
          sender: "Admin",
          tokens: Number(fakeTokens) || 0,
          type: MessageType.Token,
        };
        socket.emit("chat message", messageData);
      } else {
        const messageData = {
          text: newMessage,
          donater: selectedUser,
          toUser: selectedUser,
          sender: "Admin",
          tokens: Number(fakeTokens) || 0,
          type: MessageType.Message,
        };

        socket.emit("private-message", {
          username: selectedUser,
          message: messageData,
        });
      }

      setNewMessage("");
      setFakeTokens("");
    }
  };

  const handleFinishPrivate = () => {
    socket?.emit("private-finished", { roomId: streamId });
    const messageData = {
      text: "Private show has finised.",
      donater: selectedUser,
      sender: "Admin",
      tokens: Number(fakeTokens) || 0,
      type: MessageType.Announce,
    };

    socket?.emit("private-message", {
      username: selectedUser,
      message: messageData,
    });
  };
  const findUserColor = sortedUser.find((i) => i.name === selectedUser);

  return (
    <div className="relative h-full">
      <div
        className={clsx(
          "flex-1",
          selectedUser ? "h-[calc(100%-135px)]" : "h-[calc(100%-65px)]"
        )}
      >
        {selectedUser && (
          <div className="rounded-lg flex gap-1 w-full m-1 mb-0 justify-between items-center">
            <button
              className="flex items-center gap-2 bg-gray-600"
              onClick={() => setSelectedUser(undefined)}
            >
              <GoArrowLeft />
              Назад
            </button>
            <div className={clsx("font-bold", findUserColor?.color)}>
              {selectedUser}
            </div>

            <>
              <button
                className={clsx(
                  !isPrivateChat ? "bg-green-600" : "bg-purple-600"
                )}
                onClick={requestPrivate}
              >
                {isPrivateChat ? "Идет приват" : "Запросить приват"}
              </button>
              {isPrivateChat && (
                <button className="bg-red-600" onClick={handleFinishPrivate}>
                  Завершить приват
                </button>
              )}
            </>
          </div>
        )}
        {selectedUser ? (
          <div className="flex-1 h-full overflow-y-auto p-4 space-y-4">
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
                        <span
                          className={clsx("text-black-500", findUser?.color)}
                        >
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
        ) : (
          <UsersList
            users={sortedUser}
            setSelectedUser={setSelectedUser}
            socket={socket}
          />
        )}
      </div>
      {selectedUser && <PrivateMessageSender
        setFakeTokens={setFakeTokens}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        newMessage={newMessage}
        fakeTokens={fakeTokens}
      />}
    </div>
  );
};
