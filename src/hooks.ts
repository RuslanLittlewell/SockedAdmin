import { useSetRecoilState } from "recoil";
import { modalsState, ModalState, roomsState } from "./store";
import { fetchRooms } from "./api/rooms";
import { useEffect, useRef } from "react";

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


export const useClickOutside = (handler: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [handler]);

  return ref;
}
