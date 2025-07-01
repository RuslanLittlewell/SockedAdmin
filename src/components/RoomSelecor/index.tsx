import { useToggleModal } from "@/hooks";
import { roomsState } from "@/store";
import { FC, useEffect } from "react";
import { useRecoilState } from "recoil";
import { CiTrash } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { deleteRoom, fetchRooms } from "@/api/rooms";



interface Props {
  setRoomId: (id: string) => void;
}

export const RoomSelector: FC<Props> = ({ setRoomId }) => {
  const [rooms, setRooms] = useRecoilState(roomsState);
   const toggleModal = useToggleModal();
  
   useEffect(() => {
      fetchRooms().then((res) => setRooms(res.data))
   }, []);
   
  const handleDeleteRoom = async (roomId: string) => {
    const confirmDelete = confirm(`Удалить комнату ${roomId}?`);
    if (!confirmDelete) return;

    try {
      await deleteRoom(roomId)
      const updated = await fetchRooms();
      setRooms(updated.data);
    } catch (err) {
      console.error("Ошибка при удалении комнаты:", err);
    }
  };

  const handleOpenRoom = (roomId: string) => {
    setRoomId(roomId)
    toggleModal('rooms');
  };

  return (
<div className="absolute z-10 bg-black/60 w-full h-full flex items-center justify-center px-4">
  <div className="bg-zinc-900 p-6 rounded-xl shadow-xl w-full max-w-lg border border-zinc-700">
    <IoCloseOutline className="absolute top-5 right-5 text-lg cursor-pointer" onClick={() => toggleModal('rooms')}/>

    <h3 className="text-2xl font-semibold text-white mb-4 text-center">Доступные комнаты</h3>
    <ul className="space-y-4">
      {rooms
        .map((room) => (
          <li
            key={room.roomId}
            className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700"
          >
            <div>
              <div className="text-white font-medium text-lg">
                🛏 Комната: <span className="text-indigo-300">{room.roomId}</span>
              </div>
              <div className="text-sm text-gray-400">
                {room.isLive ? (
                  <span className="text-green-400">🔴 В эфире</span>
                ) : (
                  <span className="text-gray-400">🟡 Оффлайн</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenRoom(room.roomId)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-md text-sm"
              >
                Открыть
              </button>
              <button
                onClick={() => handleDeleteRoom(room.roomId)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm text-white"
              >
                <CiTrash />
              </button>
            </div>
          </li>
        ))}
    </ul>
  </div>
</div>

  );
};
