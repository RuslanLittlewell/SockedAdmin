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

    newPeer.on("connect", () => {
      console.log("✅ Viewer подключен");
    });

    newPeer.on("stream", (remoteStream) => {
      console.log("📡 Получен поток от Broadcaster");

      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    });

    socket.on("offer", (data) => {
      console.log("📡 Получен offer от Broadcaster", data);
      
      const offer = data.offer;
      try {
        newPeer.signal(offer);
      } catch (error) {
        console.error("❌ Ошибка при обработке offer:", error);
      }
    });

    socket.on("ice-candidate", (candidate) => {
      if (candidate) newPeer.signal(candidate);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        muted
        className="w-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
        <span className="text-white text-sm">{username}</span>
      </div>
    </div>
  );
};

export default VideoReceiver;
