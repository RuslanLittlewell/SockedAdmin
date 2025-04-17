import { useState } from "react";
import StreamViewer from "./components/StreamViewer";
import Chat from "./components/Chat";

function App() {
  const [streamId, _] = useState("test-room");

  return (
    <div className="min-h-screen bg-slate-800">
      <div className="flex gap-1 h-[calc(100vh-0px)]">
        <StreamViewer roomId={streamId} username="Admin" />
        <Chat streamId={streamId} />
      </div>
    </div>
  );
}

export default App;
