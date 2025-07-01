import { atom } from "recoil";

export interface UserStateProps {
  id: number;
  name: string;
  color: string;
  type: string;
  joined: boolean;
}

export enum MessageType {
  Message  = 'message',
  Token    = 'token',
  Announce = 'announce',
  Notify = 'notify',
}

interface RoomInfo {
  roomId: string;
  usersCount: number;
  isLive: boolean;
  usernames: string[];
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isHost?: boolean;
  toUser: string;
  isModerator: boolean;
  tokens: number;
  donater?: string;
  color: string;
  type: MessageType
}

export interface ModalState {
  [key: string]: { visible: boolean }
}
export const usersState = atom<UserStateProps[]>({
  key: "users",
  default: [],
});

export const messageState = atom<Message[]>({
  key: 'messages',
  default: []
});

export const privateMessageState = atom<Message[]>({
  key: 'privateMessages',
  default: []
});

export const generalChatUserState = atom<string>({
  key: "generalUser",
  default: "",
});

export const privateChatUserState = atom<string | undefined>({
  key: "privateUser",
  default: "",
});

export const roomsState = atom<RoomInfo[]>({
  key: "rooms",
  default: []
});

export const modalsState = atom<ModalState>({
  key: "modals",
  default: {
    settings: { visible: false },
    rooms: { visible: false },
  }
});