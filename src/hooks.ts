import { useSetRecoilState } from "recoil";
import { modalsState, ModalState, roomsState } from "./store";
import { fetchRooms } from "./api/rooms";

export const useToggleModal = () => {
  const setModals = useSetRecoilState(modalsState);

  return (modalKey: keyof ModalState) => {
    setModals((prev) => ({
      ...prev,
      [modalKey]: {
        ...prev[modalKey],
        visible: !prev[modalKey].visible,
      },
    }));
  };
};

export const useFetchRoom = () => {
  const setRooms = useSetRecoilState(roomsState);

  return async () => {
    const res = await fetchRooms();
    setRooms(res.data);
  };
};