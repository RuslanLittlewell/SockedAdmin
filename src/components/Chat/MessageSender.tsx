import { FC, useState } from "react";
import { CgSelect } from "react-icons/cg";
import { MdInput } from "react-icons/md";
import ColorSelect from "../ColorSelect";
import { UserStateProps } from "@/store";

interface Props {
  setFakeUser: (i: string) => void;
  setFakeTokens: (i: string) => void;
  setNewMessage: (i: string) => void;
  deleteAllMessages: () => void;
  setSelectedUser: (i: string) => void;
  setUserColor: (i: string) => void;
  requestPrivate: () => void;
  sendMessage: any;
  users: UserStateProps[];
  userColor: string;
  selectedUser: string;
  fakeUser: string;
  fakeTokens: string;
  newMessage: string;

  isPrivateChat: boolean;
}
export const MessageSender: FC<Props> = ({
  setFakeUser,
  setFakeTokens,
  setNewMessage,
  deleteAllMessages,
  setSelectedUser,
  setUserColor,
  requestPrivate,
  isPrivateChat,
  fakeUser,
  sendMessage,
  userColor,
  fakeTokens,
  newMessage,
  selectedUser,
  users,
}) => {
  const [tab, setTab] = useState(0);
  const [existUser, setExistUser] = useState(false);
  const tabsName = ["Сообщение", "Токен", "Приватное сообщение"];

  const handleSelectUser = (e: string) => {
    const findUser = users.find((i) => i.name === e);
    if (findUser) {
      setFakeUser(findUser.name);
      setUserColor(findUser.color);
      setSelectedUser(findUser.name);
    }
  };

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
        onSubmit={(e) => sendMessage(e, tab == 2)}
        className="pl-[2px] py-4 border-t border-gray-700"
      >
        <div className="flex space-x-2">
          <button
            className="bg-gray-800"
            type="button"
            onClick={() => setExistUser(!existUser)}
          >
            {existUser ? <MdInput /> : <CgSelect />}
          </button>
          {existUser ? (
            <select
              value={selectedUser}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {users.map((user, idx) => (
                <option key={idx} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                value={fakeUser}
                onChange={(e) => setFakeUser(e.target.value)}
                placeholder="Пользователь"
                className="flex-1 bg-gray-800 max-w-[140px] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <ColorSelect onChange={setUserColor} value={userColor} />
            </>
          )}
          {tab === 1 && (
            <input
              type="number"
              value={fakeTokens}
              onChange={(e) => setFakeTokens(e.target.value)}
              placeholder="Количество токенов"
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          {(tab === 0 || tab === 2) && (
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          {tab == 2 && !isPrivateChat ? (
            <button
              type="button"
              onClick={requestPrivate}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Запросить приват
            </button>
          ) : (
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Отправить
            </button>
          )}
        </div>
      </form>
      <button onClick={deleteAllMessages} className="bg-red-400 w-full">
        Удалить все сообщения
      </button>
    </div>
  );
};
