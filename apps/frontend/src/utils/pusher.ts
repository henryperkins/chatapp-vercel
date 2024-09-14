// File: apps/frontend/src/utils/pusher.ts

import Pusher from 'pusher-js';

export const initializePusher = () => {
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
  });
  return pusher;
};