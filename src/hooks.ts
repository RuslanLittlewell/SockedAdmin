import { useSetRecoilState } from "recoil";
import { modalsState, ModalState } from "./store";

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
