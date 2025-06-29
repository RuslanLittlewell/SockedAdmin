import { FC, useState } from "react";
import { IoSend } from "react-icons/io5";
import ColorSelect from "../ColorSelect";
import { sortedUsers } from "./helpers";
import { UserStateProps } from "@/store";

interface Props {
  setFakeTokens: (i: string) => void;
  setNewMessage: (i: string) => void;
  setFakeUser: (i: string) => void;
  sendMessage: any;
  fakeTokens: string;
  newMessage: string;
  fakeUser: string;
  users: UserStateProps[];
}
export const PrivateMessageSender: FC<Props> = ({
  setFakeTokens,
  setNewMessage,
  setFakeUser,
  sendMessage,
  fakeTokens,
  newMessage,
  fakeUser,
  users
}) => {
  const [tab, setTab] = useState(0);
  const tabsName = ["Сообщение", "Токен"];
  const sorted = sortedUsers(users);

  return (
    <div className="p-2 border rounded-lg border-white/10">
      <div className="flex gap-1">
        {tabsName.map((i, idx) => (
          <div
            className={`p-2 rounded-[4px_4px_0_0] cursor-pointer ${
              tab === idx ? "bg-blue-900" : "bg-blue-950"
            }`}
            key={idx}
            onClick={() => setTab(idx)}
          >
            {i}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => sendMessage(e, tab == 2)}
        className="pl-[2px] py-4 border-t border-gray-700"
      >
        
        <div className="flex space-x-2">
        <ColorSelect
            onChange={setFakeUser}
            items={sorted}
            value={fakeUser}
          />
          {tab === 1 && (
            <input
              type="number"
              value={fakeTokens}
              onChange={(e) => setFakeTokens(e.target.value)}
              placeholder="Количество токенов"
              className="flex-1 bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {tab === 0 && (
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            type="submit"
            className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 hover:outline-none hover:ring-0 transition-colors"
          >
           <IoSend />
          </button>
        </div>
      </form>
    </div>
  );
};
