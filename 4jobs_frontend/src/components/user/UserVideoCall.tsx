import React, { useState, useEffect, useRef, useCallback } from 'react';
import { userVideoCallService } from '../../services/userVideoCallService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faPhone } from '@fortawesome/free-solid-svg-icons';
import { socketService } from '../../services/socketService';
import { useCall } from '../../contexts/CallContext';

interface UserVideoCallProps {
  recipientId: string;
  onEndCall: () => void;
  incomingCallData?: { callerId: string, offer: string } | null;
}

const UserVideoCall: React.FC<UserVideoCallProps> = ({ recipientId, onEndCall, incomingCallData }) => {
  const { incomingCallData: contextIncomingCallData } = useCall();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const attachStreamToVideo = useCallback((stream: MediaStream, videoElement: HTMLVideoElement | null) => {
    if (videoElement && stream) {
      try {
        console.log(`Attaching ${videoElement === localVideoRef.current ? 'local' : 'remote'} stream:`, 
          stream.getTracks().map(t => `${t.kind}:${t.enabled}`));
        
        videoElement.srcObject = stream;
        videoElement.muted = videoElement === localVideoRef.current;
        
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error("Error playing video:", error);
            }
          });
        }
      } catch (error) {
        console.error("Error attaching stream to video:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      attachStreamToVideo(localStream, localVideoRef.current);
    }
  }, [localStream, attachStreamToVideo]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      attachStreamToVideo(remoteStream, remoteVideoRef.current);
      setIsInitializing(false); // Set initializing to false when remote stream is attached
    }
  }, [remoteStream, attachStreamToVideo]);

  const handleEndCall = useCallback(() => {
    console.log("Ending call");
    userVideoCallService.disconnectCall();
    socketService.emit("userEndCall", { recipientId });
    setLocalStream(null);
    setRemoteStream(null);
    onEndCall();
  }, [recipientId, onEndCall]);

  useEffect(() => {
    let mounted = true;
    let callInitialized = false;

    const startCall = async () => {
      if (callInitialized) return;
      callInitialized = true;

      try {
        const stream = await userVideoCallService.startLocalStream();
        if (!mounted) return;

        console.log("Local stream obtained:", stream.getTracks());
        setLocalStream(stream);

        userVideoCallService.setOnRemoteStreamUpdate((stream) => {
          if (!mounted) return;
          console.log("Remote stream received:", stream.getTracks());
          setRemoteStream(stream);
          setIsInitializing(false);
        });

        const callData = incomingCallData || contextIncomingCallData;
        if (callData) {
          await userVideoCallService.handleIncomingCall(callData.offer);
          const answer = await userVideoCallService.createAnswer();
          socketService.emitCallAnswer(callData.callerId, answer);
          setIsInitializing(false);
        } else {
          const offer = await userVideoCallService.makeCall(recipientId);
          socketService.emit("userCallOffer", { recipientId, offer });
        }

        // Set up socket event listeners
        const listeners = [
          socketService.onCallAccepted(() => {
            console.log("Call accepted, waiting for media");
            if (mounted) setIsInitializing(false);
          }),
          socketService.on("userCallAnswer", async (data: { answerBase64: string }) => {
            await userVideoCallService.handleAnswer(data.answerBase64);
          })
        ];

        return () => {
          listeners.forEach(removeListener => removeListener());
        };
      } catch (error) {
        console.error("Error in call setup:", error);
        if (mounted) {
          setError(`Failed to start video call: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsInitializing(false);
        }
      }
    };

    startCall();

    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
      userVideoCallService.disconnectCall();
    };
  }, [recipientId, incomingCallData, contextIncomingCallData, handleEndCall]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    userVideoCallService.muteAudio(!isMuted);
  };

  const handleVideoToggle = () => {
    setIsVideoHidden(!isVideoHidden);
    userVideoCallService.hideVideo(!isVideoHidden);
  };

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Attaching remote stream:', remoteStream.getTracks());
      remoteVideoRef.current.srcObject = remoteStream; // Ensure this is set correctly
      remoteVideoRef.current.play().catch(error => {
        console.error("Error playing remote video:", error);
      });
    } else {
      console.log('No remote stream available to attach');
    }
  }, [remoteStream]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={onEndCall}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-4">
        <div className="relative aspect-w-16 aspect-h-9 mb-4">
          <div className="w-full h-full bg-black rounded-lg overflow-hidden">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                {isInitializing ? "Initializing call..." : "Waiting for other participant..."}
              </div>
            )}
          </div>
          {localStream && (
            <div className="absolute bottom-4 right-4 w-1/4 h-1/4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg border-2 border-white"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleMuteToggle}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} className="text-xl" />
          </button>
          <button
            onClick={handleVideoToggle}
            className={`p-3 rounded-full ${isVideoHidden ? 'bg-red-500' : 'bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={isVideoHidden ? faVideoSlash : faVideo} className="text-xl" />
          </button>
          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-500 text-white"
          >
            <FontAwesomeIcon icon={faPhone} className="text-xl transform rotate-135" />
          </button>
          <button onClick={() => {
            console.log('Current remote stream tracks:', remoteStream?.getTracks().map(t => `${t.kind}:${t.enabled}`));
          }}>
            Log Remote Stream
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserVideoCall;
