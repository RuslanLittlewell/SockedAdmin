import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

interface StreamReceiverProps {
  roomId: string;
  username: string;
}

const StreamReceiver: React.FC<StreamReceiverProps> = ({ roomId, username }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Подключаемся к сигнальному серверу
    const newSocket = io("https://sockedserver.onrender.com/", {
      query: { roomId, username, isAdmin: true },
    });

    newSocket.on("connect", () => {
      console.log("Подключено к сигнальному серверу");
    });

    // Создаем RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Когда получаем трек, устанавливаем его в видеоэлемент
    pc.ontrack = (event) => {
      console.log(event)
      console.log("Получен входящий трек:", event.track.kind);
      if (videoRef.current) {
        // Если event.streams[0] не передан, создаем новый MediaStream и добавляем трек
        const remoteStream = event.streams[0] || new MediaStream();
        if (!event.streams[0]) {
          remoteStream.addTrack(event.track);
        }
        videoRef.current.srcObject = remoteStream;
      }
    };

    // Обработка ICE кандидатов
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit("ice-candidate", {
          candidate: event.candidate,
          peerId: "viewer",
          roomId: roomId,
        });
      }
    };

    // При получении offer от стримера устанавливаем описание и отправляем answer
    newSocket.on("offer", async ({ offer }) => {
      try {
        console.log("Получен offer от стримера");
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit("answer", {
          answer,
          peerId: "viewer",
          roomId: roomId,
        });
        console.log("Отправлен answer");
      } catch (error) {
        console.error("Ошибка при обработке offer:", error);
      }
    });

    // Добавляем входящие ICE кандидаты
    newSocket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("ICE candidate добавлен");
      } catch (error) {
        console.error("Ошибка при добавлении ICE candidate:", error);
      }
    });

    return () => {
      newSocket.disconnect();
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
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
        <span className="text-white text-sm">{username}</span>
      </div>
    </div>
  );
};

export default StreamReceiver;
