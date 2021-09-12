import { io } from 'socket.io-client';
import config from '../config';

const options = {
  'force new connection': true,
  'reconnection limit': 1000,
  'max reconnection attempts': 'Infinity', // avoid having user reconnect manually in order to prevent dead clients after a server restart
  timeout: 10000, // before connect_error and connect_timeout are emitted.
  transports: ['websocket'],
};

const socket = io(config.serverUrl, options);

export default socket;
