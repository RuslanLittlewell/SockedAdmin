import { useState } from 'react'
import StreamViewer from './components/StreamViewer'
import Chat from './components/Chat'

function App() {
  const [streamId, _] = useState('test-room');

  return (
    <div className="min-h-screen bg-gray-900 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-2rem)]">
          <div className="lg:col-span-2">
            <StreamViewer
              roomId={streamId}
              username="Admin"
            />
          </div>
          <div className="lg:col-span-2">
            <Chat streamId={streamId} />
          </div>
        </div>
    </div>
  )
}

export default App
