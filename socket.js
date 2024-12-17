"use client";

import { io } from "socket.io-client";

 export const socket = io("https://jobpwaserver.onrender.com");
// export const socket = io();// for development with socket.mjs withpachage hjson change
