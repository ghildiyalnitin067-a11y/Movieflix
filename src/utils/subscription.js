import { getUserKey } from "./userKey";

const getKey = () => `movieflix_${getUserKey()}_subscription`;

export const saveSubscription = (data) => {
  localStorage.setItem(getKey(), JSON.stringify(data));
};

export const getSubscription = () => {
  return JSON.parse(localStorage.getItem(getKey()));
};
