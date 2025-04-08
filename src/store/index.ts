import { atom } from "recoil";

export interface UserStateProps {
  name: string;
  color: string;
}
export const usersState = atom<UserStateProps[]>({
  key: "users",
  default: [],
});
