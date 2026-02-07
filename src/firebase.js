import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsg5WmLCKd4Vbq7-5ABBVCGC_GbdHV1t4",
  authDomain:"movieflix-afeb8.firebaseapp.com",
  projectId: "movieflix-afeb8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
