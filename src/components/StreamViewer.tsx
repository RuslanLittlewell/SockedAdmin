import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";

interface VideoReceiverProps {
  roomId: string;
  username: string;
}

 const VideoReceiver: React.FC<VideoReceiverProps> = ({ roomId, username }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setupPeer = () => {
    // destroy any existing peer
    peerRef.current?.destroy();

    const p = new SimplePeer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    p.once("signal", (answer) => {
      socketRef.current?.emit("answer", { answer, roomId, username });
    });

    p.on("stream", (stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    p.on("connect", () => {
      console.log("✅ Peer соединен");
      setIsConnected(true);
    });

    p.on("error", (err) => {
      console.error("SimplePeer error:", err);
      setIsConnected(false);
      // destroy and rebuild everything
      socketRef.current?.off();
      setupSocketAndPeer();
    });

    p.on("close", () => {
      console.log("❌ Peer закрыт");
      setIsConnected(false);
    });

    peerRef.current = p;
  };

  const setupSocketAndPeer = () => {
    // destroy old socket
    socketRef.current?.disconnect();
    const socket = io(import.meta.env.VITE_API_URL, {
      query: { roomId, username, role: "viewer" },
    });
    socketRef.current = socket;

    setupPeer();

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      socket.emit("get-offer", { roomId });
    });

    socket.once("offer", ({ offer }) => {
      console.log("📡 Got offer");
      try {
        peerRef.current?.signal(offer);
      } catch (e) {
        console.error("Error signaling offer:", e);
      }
    });

    socket.once("ice-candidate", (candidate) => {
      console.log("📡 Got ICE candidate");
      try {
        peerRef.current?.signal(candidate);
      } catch (e) {
        console.error("Error signaling candidate:", e);
      }
    });

    socket.on("broadcast-ended", () => {
      console.log("📡 Broadcast ended");
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsConnected(false);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
  };

  useEffect(() => {
    setupSocketAndPeer();
    return () => {
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
    };
  }, [roomId, username]);

  return (
    <div className="relative w-2/5 h-full bg-black overflow-hidden">
      <video ref={videoRef} autoPlay playsInline controls muted className="w-full object-cover" />
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <p>Подключение к стриму...</p>
            <p className="text-sm">Пожалуйста, подождите</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default VideoReceiver;