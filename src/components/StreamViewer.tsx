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

    const createPeerConnection = () => {
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
          console.log("Отправка ICE-кандидата на сервер:", event.candidate);
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            peerId: "viewer",
            roomId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (videoRef.current) {
          console.log("Получен видеотрек:", event.streams[0]);
          videoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Состояние соединения:", pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("Состояние ICE:", pc.iceConnectionState);
      };

      return pc;
    };

    const pc = createPeerConnection();

    socket.on("connect", () => {
      console.log("Подключено к серверу как зритель");
    });

    socket.on("offer", async ({ offer }) => {
      console.log("Получен offer от стримера");

      try {
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Удалённое описание установлено (offer)");

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("Отправка answer на сервер");
        socket.emit("answer", {
          answer: pc.localDescription,
          roomId,
          peerId: "viewer",
        });

        console.log("Ответ отправлен:", pc.localDescription);
      } catch (error) {
        console.error("Ошибка обработки offer:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!pc || !candidate) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("ICE-кандидат добавлен успешно");
      } catch (error) {
        console.error("Ошибка добавления ICE-кандидата:", error);
      }
    });

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
