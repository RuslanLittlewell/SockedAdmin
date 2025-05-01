import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";

interface VideoReceiverProps {
  roomId: string;
  username: string;
}

const VideoReceiver: React.FC<VideoReceiverProps> = ({ roomId, username }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const socket = io(apiUrl, {
      query: { roomId, username, role: "viewer" },
    });

    const newPeer = new SimplePeer({
			initiator: false,
			trickle: false,
		})

    
    newPeer.on("signal", (data) => {
      socket.emit("answer", { answer: data, roomId, username });
    });


    newPeer.on("stream", (remoteStream) => {
      console.log("📡 Получен поток от Broadcaster");

      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    });

    socket.on("offer", ({ offer }) => {
      console.log("📡 Первый и единственный offer от Broadcaster", offer);
      newPeer.signal(offer);
    });

    socket.on("ice-candidate", (candidate) => {
      console.log('candidate', candidate)
      if (candidate) newPeer.signal(candidate);
    });

    socket.on("connect", () => {
      console.log("✅ Viewer подключен");
      // Уведомляем сервер, что мы присоединяемся к активному стриму
      socket.emit("join-room", { roomId, username });
    });
    
    socket?.on("broadcast-ended", () => {
      console.log(true, 'OFFSTREAM')
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    });

    return () => {
      socket.disconnect();
      newPeer.destroy();
    };
  }, [roomId, username]);

  return (
    <div className="relative w-2/5 h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        muted
        className="w-full object-cover"
      />
    </div>
  );
};

export default VideoReceiver;
