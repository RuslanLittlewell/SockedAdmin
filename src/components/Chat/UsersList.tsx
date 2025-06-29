import { MessageType, UserStateProps } from "@/store";
import clsx from "clsx";
import { FC } from "react";
import { GoMoveToEnd, GoMoveToStart, GoPersonAdd } from "react-icons/go";
import { Socket } from "socket.io-client";

interface Props {
  users: UserStateProps[];
  socket: Socket | null;
  setSelectedUser: (name: string) => void;
}
export const UsersList: FC<Props> = ({ users, socket, setSelectedUser }) => {
  const handleToggleUser = (user: UserStateProps) => {
    socket?.emit("set-user-join", { id: user.id });

    const message = user.joined ? "has left the room" : "join the room";
    
    const messageData = {
      text: message,
      donater: user.name,
      sender: "Admin",
      tokens: 0,
      type: MessageType.Notify,
    };

    socket?.emit("chat message", messageData);
  };

  return (
    <div className="relative overflow-auto h-[calc(100%-10px)]">
      {users.map((user) => {
        return (
          <div
            className={clsx("flex gap-2 text-left p-2 w-full")}
            key={user.id}
          >
            <div className="font-black w-full grid [grid-template-columns:1fr_30px_30px] items-center">
              <div
                className={clsx("cursor-pointer", user.color)}
                onClick={() => setSelectedUser(user.name)}
              >
                {user.name}
              </div>
              <div
                onClick={() => handleToggleUser(user)}
                className="text-lg cursor-pointer font-black"
              >
                {user.joined ? (
                  <GoMoveToStart className="text-red-600" />
                ) : (
                  <GoMoveToEnd className="text-green-600" />
                )}
              </div>
              <div className="font-black"><GoPersonAdd /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
