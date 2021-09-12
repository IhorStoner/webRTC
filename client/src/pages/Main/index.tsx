import React, { useEffect, useState } from 'react';
import socket from '../../socket/index';
import ACTIONS from '../../socket/actions';
import { Header, Segment } from 'semantic-ui-react';
import RoomsList from '../../components/RoomsList';

const Main: React.FC = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.on(ACTIONS.SHARE_ROOMS, ({ rooms }) => {
      setRooms(rooms);
    });
  }, []);

  return (
    <Segment>
      <Header as='h1'>Available Rooms</Header>
      <RoomsList rooms={rooms} />
    </Segment>
  );
};

export default Main;
