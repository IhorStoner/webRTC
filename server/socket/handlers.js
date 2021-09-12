const ACTIONS = require('./actions');
const { version, validate } = require('uuid');

module.exports = (io, socket) => {
  const getClientRooms = () => {
    const { rooms } = io.sockets.adapter;
    return Array.from(rooms.keys()).filter((roomID) => validate(roomID) && version(roomID) === 4);
  };

  const shareRoomsInfo = () => {
    io.emit(ACTIONS.SHARE_ROOMS, {
      rooms: getClientRooms(),
    });
  };

  const leaveRoom = () => {
    const { rooms } = socket;

    Array.from(rooms)
      // LEAVE ONLY CLIENT CREATED ROOM
      .filter((roomID) => validate(roomID) && version(roomID) === 4)
      .forEach((roomID) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

        clients.forEach((clientID) => {
          io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
            peerID: socket.id,
          });

          socket.emit(ACTIONS.REMOVE_PEER, {
            peerID: clientID,
          });
        });

        socket.leave(roomID);
      });

    shareRoomsInfo();
  };

  const joinRoom = (config) => {
    const { room: roomID } = config;
    const { rooms: joinedRooms } = socket;

    if (Array.from(joinedRooms).includes(roomID)) {
      return console.warn(`Already joined to ${roomID}`);
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

    clients.forEach((clientID) => {
      io.to(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: socket.id,
        createOffer: false,
      });

      socket.emit(ACTIONS.ADD_PEER, {
        peerID: clientID,
        createOffer: true,
      });
    });

    socket.join(roomID);
    shareRoomsInfo();
  };

  const relaySdp = ({ peerID, sessionDescription }) => {
    io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: socket.id,
      sessionDescription,
    });
  };

  const relayIce = ({ peerID, iceCandidate }) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    });
  };

  shareRoomsInfo();
  socket.on(ACTIONS.RELAY_SDP, relaySdp);
  socket.on(ACTIONS.RELAY_ICE, relayIce);
  socket.on(ACTIONS.JOIN, joinRoom);
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on('disconnecting', leaveRoom);
};
