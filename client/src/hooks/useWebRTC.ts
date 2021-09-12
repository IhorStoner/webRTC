import { useCallback, useEffect, useRef } from 'react';
import useStateWithCallback from './useStateWithCallback';
import socket from '../socket';
import ACTIONS from '../socket/actions';
// @ts-ignore
import freeice from 'freeice';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

const useWebRTC = (roomID: string) => {
  const [clients, updateClients] = useStateWithCallback([]);

  const peerConnection = useRef<any>({});
  const localMediaStream = useRef<any>(null);
  const peerMediaElements = useRef<any>({
    [LOCAL_VIDEO]: null,
  });

  const addNewClient = useCallback(
    (newClient, cb) => {
      if (!clients.includes(newClient)) {
        updateClients((list: []) => [...list, newClient], cb);
      }
    },
    [clients, updateClients]
  );

  const startCapture = async () => {
    localMediaStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 1280,
        height: 720,
      },
    });

    addNewClient(LOCAL_VIDEO, () => {
      const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];
      if (localVideoElement) {
        localVideoElement.volume = 0;
        localVideoElement.srcObject = localMediaStream.current;
      }
    });
  };

  const handleNewPeer = async ({ peerID, createOffer }: { peerID: string; createOffer: boolean }) => {
    if (peerID in peerConnection.current) {
      return console.warn(`Already connected to ${peerID}`);
    }

    peerConnection.current[peerID] = new RTCPeerConnection({
      iceServers: freeice(),
    });

    peerConnection.current[peerID].onicecandidate = (event: any) => {
      if (event.candidate) {
        socket.emit(ACTIONS.RELAY_ICE, {
          peerID,
          iceCandidate: event.candidate,
        });
      }
    };

    let tracksNumber = 0;
    // @ts-ignore
    peerConnection.current[peerID].ontrack = ({ streams: [remoteStreams] }) => {
      tracksNumber++;
      if (tracksNumber === 2) {
        // video & audio tracks received
        addNewClient(peerID, () => {
          peerMediaElements.current[peerID].srcObject = remoteStreams;
        });
      }
    };

    localMediaStream.current.getTracks().forEach((track: {}) => {
      peerConnection.current[peerID].addTrack(track, localMediaStream.current);
    });

    if (createOffer) {
      const offer = await peerConnection.current[peerID].createOffer();
      await peerConnection.current[peerID].setLocalDescription(offer);

      socket.emit(ACTIONS.RELAY_SDP, {
        peerID,
        sessionDescription: offer,
      });
    }
  };

  const setRemoteMedia = async ({ peerID, sessionDescription: remoteDescription }: { peerID: string; sessionDescription: any }) => {
    await peerConnection.current[peerID].setRemoteDescription(new RTCSessionDescription(remoteDescription));
    if (remoteDescription.type === 'offer') {
      const answer = await peerConnection.current[peerID].createAnswer();
      await peerConnection.current[peerID].setLocalDescription(answer);
      socket.emit(ACTIONS.RELAY_SDP, {
        peerID,
        sessionDescription: answer,
      });
    }
  };

  const addIceCandidate = ({ peerID, iceCandidate }: { peerID: string; iceCandidate: any }) => {
    peerConnection.current[peerID].addIceCandidate(new RTCIceCandidate(iceCandidate));
  };

  const removePeer = ({ peerID }: { peerID: string }) => {
    if (peerID in peerConnection.current) {
      peerConnection.current[peerID].close();
      delete peerConnection.current[peerID];
      delete peerMediaElements.current[peerID];

      updateClients((list: []) => list.filter((c: string) => c !== peerID));
    }
  };

  useEffect(() => {
    socket.on(ACTIONS.ADD_PEER, handleNewPeer);
    socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
    socket.on(ACTIONS.ICE_CANDIDATE, addIceCandidate);
    socket.on(ACTIONS.REMOVE_PEER, removePeer);

    return () => {
      socket.off(ACTIONS.ADD_PEER);
      socket.off(ACTIONS.SESSION_DESCRIPTION);
      socket.off(ACTIONS.ICE_CANDIDATE);
      socket.off(ACTIONS.REMOVE_PEER);
    };
  }, []);

  useEffect(() => {
    startCapture()
      .then(() => {
        socket.emit(ACTIONS.JOIN, { room: roomID });
      })
      .catch((e) => {
        console.log(`Error getting user media ${e}`);
      });

    return () => {
      localMediaStream.current.getTracks().forEach((track: any) => track.stop());
      socket.emit(ACTIONS.LEAVE);
    };
  }, [roomID]);

  const provideMediaRef = useCallback((id, node) => {
    peerMediaElements.current[id] = node;
  }, []);

  return { clients, provideMediaRef };
};

export default useWebRTC;
