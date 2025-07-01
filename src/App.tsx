import { useEffect, useState } from "react";
import StreamViewer from "./components/StreamViewer";
import Chat from "./components/Chat";
import { RoomSelector } from "./components/RoomSelecor";
import { modalsState, roomsState } from "./store";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { fetchRooms } from "./api/rooms";

function App() {
  const username = "Admin";
  const [roomId, setRoomId] = useState<string>("");
  const setRooms = useSetRecoilState(roomsState);
  const modals = useRecoilValue(modalsState);

  useEffect(() => {
    fetchRooms().then((res) => setRooms(res.data))
  }, []);


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
