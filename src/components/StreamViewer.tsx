import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

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

    socket.on("connect", () => {
      console.log("Подключено к сигнальному серверу");
    });

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "b2b91d474dab8140869cdadc",
          credential: "2EsWAA8CdUuixC34",
        },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          roomId,
          peerId: "broadcaster",
        });
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        if (event.streams && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          videoRef.current.play().catch(err => console.error("Ошибка воспроизведения:", err));
        }
      }
    };
    
    socket.on("offer", async ({ offer }) => {
      console.log("Received offer from broadcaster:", offer.type);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Sending answer to broadcaster");
        socket.emit("answer", { 
          answer: pc.localDescription, 
          roomId, 
          peerId: "broadcaster"
        });
      } catch (error) {
        console.error("Error processing offer:", error);
      }
    });
    
    socket.on("ice-candidate", async ({ candidate, peerId }) => {
      try {
        console.log("Received ICE candidate from:", peerId);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("ICE candidate added successfully");
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    pc.onconnectionstatechange = () => {
      console.log("Состояние соединения:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("Состояние ICE:", pc.iceConnectionState);
    };

    return () => {
      socket.disconnect();
      pc.close();
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
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
        <span className="text-white text-sm">{username}</span>
      </div>
    </div>
  );
};

export default VideoReceiver;
