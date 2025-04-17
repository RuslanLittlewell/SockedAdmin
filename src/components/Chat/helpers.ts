import { UserStateProps } from "@/store";

const colorOrder: { [key: string]: number } = {
    "text-green-500": 1,
    "text-red-500": 2,
    "text-purple-500": 3,
    "text-pink-500": 4,
    "text-blue-500": 5,
  };

export const sortedUsers = (users: UserStateProps[]) => [...users].sort((a, b) => {
    return (colorOrder[a.color] || 999) - (colorOrder[b.color] || 999);
  });