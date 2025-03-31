import { useState } from 'react'
import StreamViewer from './components/StreamViewer'
import Chat from './components/Chat'

function App() {
  const [streamId, setStreamId] = useState('test-room');

  return (
    <div className="min-h-screen bg-gray-900 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-2rem)]">
          <div className="lg:col-span-3">
            <StreamViewer
              roomId={streamId}
              username="Администратор"
            />
          </div>
          <div className="lg:col-span-1">
            <Chat streamId={streamId} />
          </div>
        </div>
    </div>
  )
}

export default App
