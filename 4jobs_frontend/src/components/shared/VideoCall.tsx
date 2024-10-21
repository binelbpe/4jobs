import React, { useState, useEffect, useRef, useCallback } from "react";
import { videoCallService } from "../../services/RecruiterUservideoCallService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { userRecruiterSocketService } from "../../services/userRecruiterSocketService";

interface VideoCallProps {
  isRecruiter: boolean;
  recipientId: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  isRecruiter,
  recipientId,
  onEndCall,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleEndCall = useCallback(() => {
    videoCallService.disconnectCall();
    userRecruiterSocketService.emitEndCall(recipientId);
    setLocalStream(null);
    setRemoteStream(null);
    onEndCall();
  }, [recipientId, onEndCall]);

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await videoCallService.startLocalStream();
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        videoCallService.setOnRemoteStreamUpdate((stream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });

        if (isRecruiter) {
          const offer = await videoCallService.makeCall(recipientId);
          userRecruiterSocketService.emitCallOffer(recipientId, offer);
        }
      } catch (error) {
        console.error("Error starting video call:", error);
        setError("Failed to start video call. Please try again.");
      }
    };

    startCall();

    userRecruiterSocketService.onCallAnswer(async (answerBase64) => {
      try {
        await videoCallService.handleAnswer(answerBase64);
      } catch (error) {
        console.error("Error handling call answer:", error);
        setError("Failed to establish connection. Please try again.");
      }
    });

    userRecruiterSocketService.onCallRejected(() => {
      handleEndCall();
    });

    return () => {
      videoCallService.disconnectCall();
    };
  }, [isRecruiter, recipientId, handleEndCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    videoCallService.muteAudio(!isMuted);
  };

  const handleVideoToggle = () => {
    setIsVideoHidden(!isVideoHidden);
    videoCallService.hideVideo(!isVideoHidden);
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
            className={`p-3 rounded-full ${
              isMuted ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon
              icon={isMuted ? faMicrophoneSlash : faMicrophone}
              className="text-xl"
            />
          </button>
          <button
            onClick={handleVideoToggle}
            className={`p-3 rounded-full ${
              isVideoHidden ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <FontAwesomeIcon
              icon={isVideoHidden ? faVideoSlash : faVideo}
              className="text-xl"
            />
          </button>
          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-500 text-white"
          >
            <FontAwesomeIcon
              icon={faPhone}
              className="text-xl transform rotate-135"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
