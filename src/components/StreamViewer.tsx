import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
import { ActionsBar } from "./ActionsBar";
import { useFetchRoom } from "@/hooks";

interface VideoReceiverProps {
  roomId: string;
  username: string;
}

const VideoReceiver: React.FC<VideoReceiverProps> = ({ roomId, username }) => {
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const screenPeerRef = useRef<SimplePeer.Instance | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchRoom = useFetchRoom();
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState();

  useEffect(() => {
    const interval = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit("check-status", { roomId });
      }
    }, 5000);

    socketRef.current?.on("stream-started", async () => {
      fetchRoom()
    });

    return () => {
      clearInterval(interval);
      socketRef.current?.off("check-status");
    };
  }, [roomId]);

  const setupPeer = (socket: Socket) => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
    });
    peerRef.current = peer;

    peer.on("signal", (answer) => {
      socket.emit("answer", { answer, roomId, username });
    });

    peer.on("stream", (stream) => {
      console.log("🎥 Camera stream received");
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    });

    peer.on("connect", () => {
      console.log("✅ Camera Peer connected");
      setIsConnected(true);
    });

    peer.on("error", (err) => {
      console.error("Camera Peer error:", err);
      setIsConnected(false);
    });

    peer.on("close", () => {
      console.log("❌ Camera Peer closed");
      setIsConnected(false);
    });
  };

  const setupScreenPeer = (socket: Socket) => {
    if (screenPeerRef.current) {
      screenPeerRef.current.destroy();
      screenPeerRef.current = null;
    }

    const screenPeer = new SimplePeer({
      initiator: false,
      trickle: false,
    });
    screenPeerRef.current = screenPeer;

    screenPeer.on("signal", (answer) => {
      socket.emit("screen-answer", { answer, roomId, username });
    });

    screenPeer.on("stream", (screenStream) => {
      console.log("🎥 Screen stream received");
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }
    });

    screenPeer.on("connect", () => {
      console.log("✅ Screen Peer connected");
    });

    screenPeer.on("error", (err) => {
      console.error("Screen Peer error:", err);
    });

    screenPeer.on("close", () => {
      console.log("❌ Screen Peer closed");
    });
  };

  const setupSocketAndPeer = () => {
    socketRef.current?.disconnect();
    const socket = io(import.meta.env.VITE_API_URL, {
      query: { roomId, username, role: "viewer" },
    });
    socketRef.current = socket;

    // Один раз вешаем обработчики

    socket.on("offer", ({ offer }) => {
      console.log("📡 Got stream offer");

      if (!peerRef.current) {
        setupPeer(socket);
      }

      peerRef.current?.signal(offer);
    });

    socket.on("screen-offer", ({ offer }) => {
      console.log("📡 Got screen offer");

      if (!screenPeerRef.current) {
        setupScreenPeer(socket);
      }

      screenPeerRef.current?.signal(offer);
    });

    setupPeer(socket);
    setupScreenPeer(socket);
    socket.emit("check-status", { roomId });
    socket.on("check-status", (data) => {
      setIsLive(data.isLive);
    });

    socket.on("broadcast-ended", () => {
      console.log("📡 Broadcast ended");
      if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
      peerRef.current?.destroy();
      peerRef.current = null;
      setIsConnected(false);
    });

    socket.on("screen-ended", () => {
      console.log("📡 Screen ended");
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      screenPeerRef.current?.destroy();
      screenPeerRef.current = null;
    });
  };

  useEffect(() => {
    setupSocketAndPeer();

    return () => {
      peerRef.current?.destroy();
      peerRef.current = null;
      screenPeerRef.current?.destroy();
      screenPeerRef.current = null;
      socketRef.current?.disconnect();
    };
  }, [roomId, username]);

  const reconnectToStream = () => {
    console.log("🔄 Reconnect button clicked");
    socketRef.current?.emit("joined", { roomId });
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between">
      <ActionsBar />
      <video
        ref={cameraVideoRef}
        autoPlay
        playsInline
        controls
        className="w-[50%] object-cover m-auto"
      />
      <video
        ref={screenVideoRef}
        autoPlay
        playsInline
        controls
        muted
        className="w-full object-cover"
      />
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center flex flex-col items-center gap-2">
            {isLive ? (
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                Live
              </div>
            ) : (
              <div className="text-gray-500 font-extralight">Offline</div>
            )}
            {isLive && (
              <button
                onClick={reconnectToStream}
                disabled={!isLive}
                className="bg-blue-600 px-4 py-2 rounded text-white"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReceiver;
