import { atom } from "recoil";

export const usersState = atom<string[]>({
  key: "users",
  default: [],
});
