import { atom } from "recoil";

export interface UserStateProps {
  id: number;
  name: string;
  color: string;
  joined: boolean;
}

export enum MessageType {
  Message  = 'message',
  Token    = 'token',
  Announce = 'announce',
  Notify = 'notify',
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

export const usersState = atom<UserStateProps[]>({
  key: "users",
  default: [],
});

export const messageState = atom<Message[]>({
  key: 'messages',
  default: []
})

export const privateMessageState = atom<Message[]>({
  key: 'privateMessages',
  default: []
})

export const generalChatUserState = atom<string>({
  key: "generalUser",
  default: "",
})

export const privateChatUserState = atom<string | undefined>({
  key: "privateUser",
  default: "",
})