import { FC, useState } from "react";
import { CgSelect } from "react-icons/cg";
import { MdInput } from "react-icons/md";

interface Props {
  setFakeUser: (i: string) => void;
  setFakeTokens: (i: string) => void;
  setNewMessage: (i: string) => void;
  fakeUser: string;
  fakeTokens: string;
  newMessage: string;
  deleteAllMessages: () => void;
  sendMessage: any;
  users: string[];
  selectedUser: string;
  setSelectedUser: (i: string) => void;
}
export const MessageSender: FC<Props> = ({
  setFakeUser,
  sendMessage,
  setFakeTokens,
  setNewMessage,
  fakeUser,
  fakeTokens,
  newMessage,
  deleteAllMessages,
  selectedUser,
  setSelectedUser,
  users,
}) => {
  const [tab, setTab] = useState(0);
  const [existUser, setExistUser] = useState(false);
  const tabsName = ["Сообщение", "Токен", "Приватное сообщение"];

  const SimpleMessage = () => {
    return (
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Введите сообщение..."
        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    );
  };

  const TokenMessage = () => {
    return (
      <input
        type="number"
        value={fakeTokens}
        onChange={(e) => setFakeTokens(e.target.value)}
        placeholder="Количество токенов"
        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    );
  };

  const PrivateMessage = () => {
    return (
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Введите сообщение..."
        className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    );
  };

  const handleSelectUser = (e: string) => {
    setFakeUser(e);
    setSelectedUser(e);
  };
  const tabs = [<SimpleMessage />, <TokenMessage />, <PrivateMessage />];
  return (
    <div>
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
        onSubmit={sendMessage}
        className="pl-[2px] py-4 border-t border-gray-700"
      >
        <div className="flex space-x-2">
          <button className="bg-gray-800" onClick={() => setExistUser(!existUser)}>{existUser ? <MdInput /> : <CgSelect />}</button>
          {existUser ? (
            <select
              value={selectedUser}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {users.map((user, idx) => (
                <option key={idx} value={user}>
                  {user}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={fakeUser}
              onChange={(e) => setFakeUser(e.target.value)}
              placeholder="Пользователь"
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}

          {tabs[tab]}
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Отправить
          </button>
        </div>
      </form>
      <button onClick={deleteAllMessages} className="bg-red-400 w-full">
        Удалить все сообщения
      </button>
    </div>
  );
};
