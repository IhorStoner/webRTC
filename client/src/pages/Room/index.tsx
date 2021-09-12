import React from 'react';
import { useParams } from 'react-router';
import useWebRTC, { LOCAL_VIDEO } from '../../hooks/useWebRTC';
import { Grid, Segment } from 'semantic-ui-react';

const Room: React.FC = () => {
  const { id: roomID } = useParams<{ id: string }>();

  const { clients, provideMediaRef } = useWebRTC(roomID);
  console.log(clients);

  return (
    <Segment>
      <Grid columns={2}>
        {clients.map((clientID: string, i: number) => (
          <Grid.Column key={i}>
            <video ref={(instance) => provideMediaRef(clientID, instance)} autoPlay playsInline src='' muted={clientID === LOCAL_VIDEO} />
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default Room;
