import { useToggleModal } from "@/hooks";
import { VscSettingsGear } from "react-icons/vsc";

export const ActionsBar = () => {

  const toggleModal = useToggleModal();

  return (
    <div className="absolute z-50 l-0 t-0 p-4 flex gap-5 items-center text-white">
      <div className="cursor-pointer">
        <VscSettingsGear />
      </div>
      <div className="cursor-pointer flex gap-2 items-center" onClick={() => toggleModal('rooms')}>
        Rooms{" "}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
      </div>
    </div>
  );
};
