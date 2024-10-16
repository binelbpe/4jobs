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
  console.log("UserVideoCall component rendered", { recipientId, incomingCallData });
  
  const { incomingCallData: contextIncomingCallData } = useCall();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleEndCall = useCallback(() => {
    console.log("Ending call");
    userVideoCallService.disconnectCall();
    socketService.emit("userEndCall", { recipientId });
    setLocalStream(null);
    setRemoteStream(null);
    onEndCall();
  }, [recipientId, onEndCall]);

  useEffect(() => {
    const startCall = async () => {
      try {
        console.log("Starting user-to-user video call");
        const stream = await userVideoCallService.startLocalStream();
        console.log("Local stream obtained:", stream);
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        userVideoCallService.setOnRemoteStreamUpdate((stream) => {
          console.log("Received remote stream");
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });

        const callData = incomingCallData || contextIncomingCallData;
        if (callData) {
          // Handle incoming call
          await userVideoCallService.handleIncomingCall(callData.offer);
          const answer = await userVideoCallService.createAnswer();
          socketService.emitCallAnswer(callData.callerId, answer);
        } else {
          // Initiate outgoing call
          const offer = await userVideoCallService.makeCall(recipientId);
          console.log("Created offer:", offer);
          socketService.emit("userCallOffer", { recipientId, offer });
        }
      } catch (error) {
        console.error('Error starting video call:', error);
        setError('Failed to start video call. Please try again.');
      }
    };

    startCall();

    const removeCallAnswerListener = socketService.on("userCallAnswer", async (data: { answerBase64: string }) => {
      console.log("Received call answer:", data.answerBase64);
      try {
        await userVideoCallService.handleAnswer(data.answerBase64);
      } catch (error) {
        console.error('Error handling call answer:', error);
        setError('Failed to establish connection. Please try again.');
      }
    });

    const removeCallRejectedListener = socketService.onCallRejected(() => {
      console.log("Call rejected");
      handleEndCall();
    });

    const removeCallEndedListener = socketService.on("userCallEnded", () => {
      console.log("Call ended by the other user");
      handleEndCall();
    });

    return () => {
      console.log("Cleaning up user video call");
      userVideoCallService.disconnectCall();
      removeCallAnswerListener();
      removeCallRejectedListener();
      removeCallEndedListener();
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
    <div className="fixed inset-0  bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
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
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Initializing call..."
                )}
              </div>
            )}
          </div>
          {localStream && remoteStream && (
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
        </div>
      </div>
    </div>
  );
};

export default UserVideoCall;
