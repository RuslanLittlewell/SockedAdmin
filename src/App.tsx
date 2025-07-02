import { useState } from "react";
import StreamViewer from "./components/StreamViewer";
import Chat from "./components/Chat";
import { RoomSelector } from "./components/RoomSelecor";
import { modalsState } from "./store";
import { useRecoilValue } from "recoil";

function App() {
  const username = "Admin";
  const [roomId, setRoomId] = useState<string>("");
  const modals = useRecoilValue(modalsState);


  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {modals['rooms'].visible && (
        <RoomSelector setRoomId={setRoomId} />
      )}
      <div className="flex gap-1 h-screen">
        <StreamViewer roomId={roomId} username={username} />
        <Chat roomId={roomId} username={username} />
      </div>
    </div>
  );
}

export default App;
