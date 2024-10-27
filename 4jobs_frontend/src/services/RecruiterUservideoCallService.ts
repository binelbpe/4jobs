import { Buffer } from "buffer";

class VideoCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamUpdate: ((stream: MediaStream) => void) | null = null;
  private onCallStateChange: ((state: string) => void) | null = null;

  constructor() {
    this.initializePeerConnection();
  }

  private initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      if (this.onRemoteStreamUpdate) {
        this.onRemoteStreamUpdate(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the ICE candidate to the other peer
        // This should be implemented using your signaling mechanism (e.g., WebSocket)
      }
    };
  }

  private resetPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.initializePeerConnection();
  }

  async startLocalStream(): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return this.localStream;
  }

  async makeCall(recipientId: string): Promise<string> {
    this.resetPeerConnection();

    if (!this.localStream) {
      await this.startLocalStream();
    }

    this.localStream!.getTracks().forEach((track) => {
      if (this.peerConnection) {
        this.peerConnection.addTrack(track, this.localStream!);
      }
    });

    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);

    // Convert the offer to a Base64 string
    const offerString = JSON.stringify(offer);
    const offerBase64 = Buffer.from(offerString).toString("base64");

    return offerBase64;
  }

  async handleIncomingCall(offerBase64: string): Promise<string> {
    this.resetPeerConnection();

    if (!this.localStream) {
      await this.startLocalStream();
    }

    this.localStream!.getTracks().forEach((track) => {
      if (this.peerConnection) {
        this.peerConnection.addTrack(track, this.localStream!);
      }
    });

    // Convert the Base64 offer back to an RTCSessionDescriptionInit object
    const offerString = Buffer.from(offerBase64, "base64").toString("utf-8");
    const offer = JSON.parse(offerString);

    await this.peerConnection!.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);

    // Convert the answer to a Base64 string
    const answerString = JSON.stringify(answer);
    const answerBase64 = Buffer.from(answerString).toString("base64");

    return answerBase64;
  }

  async handleAnswer(answerBase64: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    const answerString = Buffer.from(answerBase64, "base64").toString("utf-8");
    const answer = JSON.parse(answerString);
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  async handleIceCandidate(candidateBase64: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized");
    }

    const candidateString = Buffer.from(candidateBase64, "base64").toString(
      "utf-8"
    );
    const candidate = JSON.parse(candidateString);
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  setOnRemoteStreamUpdate(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamUpdate = callback;
  }

  setOnCallStateChange(callback: (state: string) => void): void {
    this.onCallStateChange = callback;
  }

  disconnectCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    if (this.onCallStateChange) {
      this.onCallStateChange("ended");
    }
  }

  endCall(): void {
    this.disconnectCall();
    // Remove the initializePeerConnection call here
    // We'll initialize it when needed for the next call
  }

  muteAudio(mute: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !mute;
      });
    }
  }

  hideVideo(hide: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !hide;
      });
    }
  }
}

export const videoCallService = new VideoCallService();
