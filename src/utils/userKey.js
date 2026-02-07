import { auth } from "../firebase";

export const getUserKey = () => {
  const user = auth.currentUser;
  return user ? user.uid : "guest";
};
