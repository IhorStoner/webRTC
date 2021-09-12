import React from 'react';
import { Button, List } from 'semantic-ui-react';
import { v4 } from 'uuid';
import { useHistory } from 'react-router';

interface IRoom {
  roomID: string;
}

interface IRoomsList {
  rooms: IRoom[];
}

const RoomsList: React.FC<IRoomsList> = ({ rooms }) => {
  const history = useHistory();

  return (
    <List divided verticalAlign='middle'>
      {rooms.map((roomID: IRoom, i) => (
        <List.Item key={i}>
          <List.Content floated='right'>
            <Button onClick={() => history.push(`/room/${roomID}`)}>Join room</Button>
          </List.Content>
          <List.Content>{roomID}</List.Content>
        </List.Item>
      ))}
      <Button onClick={() => history.push(`/room/${v4()}`)}>Create New Room</Button>
    </List>
  );
};

export default RoomsList;
