import { useClickOutside, useFetchRoom, useToggleModal } from "@/hooks";
import { roomsState } from "@/store";
import { FC, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { CiTrash } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { deleteRoom, createRoom } from "@/api/rooms";
import { IoMdAdd } from "react-icons/io";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

interface Props {
  setRoomId: (id: string) => void;
}

const CreateRoomSchema = Yup.object().shape({
  roomId: Yup.string()
    .min(3, "Минимум 3 символа")
    .max(30, "Максимум 30 символов")
    .required("Введите ID комнаты"),
});

export const RoomSelector: FC<Props> = ({ setRoomId }) => {
  const rooms = useRecoilValue(roomsState);
  const [newRoom, setNewRoom] = useState(false);
  const toggleModal = useToggleModal();
  const fetchRoom = useFetchRoom();
  const ref = useClickOutside(() => toggleModal("rooms"));
  
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(() => {
      fetchRoom();
    }, 5000);

    if(rooms.length === 0) {
      setNewRoom(true);
    }
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleDeleteRoom = async (roomId: string) => {
    const confirmDelete = confirm(`Удалить комнату ${roomId}?`);
    if (!confirmDelete) return;

    try {
      await deleteRoom(roomId);
      fetchRoom()
    } catch (err) {
      toast.error("Ошибка при удалении комнаты:");
    }
  };

  const handleOpenRoom = (roomId: string) => {
    setRoomId(roomId);
    toggleModal("rooms");
  };

  const handleCreateRoom = async (
    values: { roomId: string },
    { resetForm }: any
  ) => {
    try {
      await createRoom(values.roomId);
      fetchRoom()
      resetForm();
      setNewRoom(false);
    } catch (err) {
      toast.error("Ошибка при создании комнаты:");
    }
  };

  return (
    <div className="absolute z-10 bg-black/60 w-full h-full flex items-center justify-center px-4">
      <div ref={ref} className="bg-zinc-900 p-6 rounded-xl shadow-xl w-full max-w-lg border border-zinc-700">
        <IoCloseOutline
          className="absolute top-5 right-5 text-lg cursor-pointer"
          onClick={() => toggleModal("rooms")}
        />

        <h3 className="text-2xl font-semibold text-white mb-4 text-left flex justify-between items-center border-b border-white/20 pb-4">
          Доступные комнаты{" "}
          <IoMdAdd
            onClick={() => setNewRoom(true)}
            className="cursor-pointer"
          />
        </h3>

        {newRoom && (
          <Formik
            initialValues={{ roomId: "" }}
            validationSchema={CreateRoomSchema}
            onSubmit={handleCreateRoom}
          >
            {({ errors, touched }) => (
              <Form className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Field
                    name="roomId"
                    placeholder="Введите ID комнаты"
                    className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/30 transition"
                  >
                    Добавить
                  </button>
                </div>
                {errors.roomId && touched.roomId && (
                  <div className="text-red-400 text-sm">{errors.roomId}</div>
                )}
              </Form>
            )}
          </Formik>
        )}

        <ul className="space-y-4">
          {rooms.map((room) => (
            <li
              key={room.roomId}
              className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg border border-zinc-700"
            >
              <div>
                <div className="text-white font-medium text-lg">
                  🛏 Комната:{" "}
                  <span className="text-indigo-300">{room.roomId}</span>
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
                  className="bg-white/10 hover:bg-white/30 text-white px-4 py-1 rounded-md text-sm"
                >
                  Открыть
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.roomId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
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
