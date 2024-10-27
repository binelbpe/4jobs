import { Buffer } from 'buffer';

class UserVideoCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamUpdate: ((stream: MediaStream) => void) | null = null;
  private onCallStateChange: ((state: string) => void) | null = null;
  private onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null;
  private initialized = false;

  constructor() {
    this.initializePeerConnection();
  }

  private initializePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:numb.viagenie.ca',
          username: 'webrtc@live.com',
          credential: 'muazkh'
        }
      ]
    });

    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, event.track.enabled);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        console.log('Created new remote MediaStream');
      }
      
      this.remoteStream.addTrack(event.track);
      console.log('Added track to remote stream:', event.track.kind);
      
      if (this.onRemoteStreamUpdate) {
        console.log('Updating remote stream with tracks:', 
          this.remoteStream.getTracks().map(t => `${t.kind}:${t.enabled}`));
        this.onRemoteStreamUpdate(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    // Add connection state change handler
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed to:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        console.log('Peer connection established successfully');
      }
    };

    // Add ICE connection state change handler
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };
  }

  private resetPeerConnection() {
    console.log("Resetting peer connection");
    
    if (this.peerConnection) {
      // Remove all tracks from peer connection
      const senders = this.peerConnection.getSenders();
      senders.forEach(sender => {
        this.peerConnection?.removeTrack(sender);
      });
      
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    console.log("Initializing new peer connection");
    this.initializePeerConnection();
    
    if (!this.peerConnection) {
      throw new Error("Failed to initialize peer connection");
    }
  }

  async startLocalStream(): Promise<MediaStream> {
    try {
      console.log("Requesting media permissions...");
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      console.log("Media permissions granted, tracks:", 
        this.localStream.getTracks().map(t => `${t.kind}:${t.enabled}`));

      return this.localStream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw error;
    }
  }

  async makeCall(recipientId: string): Promise<string> {
    try {
      this.resetPeerConnection();

      if (!this.localStream) {
        await this.startLocalStream();
      }

      // Add all tracks to peer connection
      this.localStream!.getTracks().forEach(track => {
        if (this.peerConnection) {
          console.log('Adding track to outgoing call:', track.kind, track.id);
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection!.setLocalDescription(offer);
      console.log('Local description set for outgoing call');

      return Buffer.from(JSON.stringify(offer)).toString('base64');
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  async handleIncomingCall(offerBase64: string): Promise<void> {
    try {
      this.resetPeerConnection();

      if (!this.localStream) {
        await this.startLocalStream();
      }

      // Add local tracks before setting remote description
      this.localStream!.getTracks().forEach(track => {
        if (this.peerConnection) {
          console.log('Adding local track for incoming call:', track.kind, track.id);
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });

      const offerString = Buffer.from(offerBase64, 'base64').toString('utf-8');
      const offer = JSON.parse(offerString);

      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('Remote description set for incoming call');
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  async createAnswer(): Promise<string> {
    try {
      console.log("Starting to create answer");
      
      if (!this.peerConnection) {
        console.error("No peer connection available for creating answer");
        throw new Error("Peer connection not initialized");
      }

      console.log("Creating answer with peer connection state:", {
        connectionState: this.peerConnection.connectionState,
        signalingState: this.peerConnection.signalingState,
        iceGatheringState: this.peerConnection.iceGatheringState,
        iceConnectionState: this.peerConnection.iceConnectionState
      });

      const answer = await this.peerConnection.createAnswer();
      console.log("Answer created:", {
        type: answer.type,
        sdpLength: answer.sdp?.length
      });

      await this.peerConnection.setLocalDescription(answer);
      console.log("Local description set for answer");

      const answerString = JSON.stringify(answer);
      return Buffer.from(answerString).toString('base64');
    } catch (error) {
      console.error("Error in createAnswer:", {
        error,
        peerConnectionState: this.peerConnection?.connectionState,
        signalingState: this.peerConnection?.signalingState
      });
      throw error;
    }
  }

  async handleAnswer(answerBase64: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const answerString = Buffer.from(answerBase64, 'base64').toString('utf-8');
    const answer = JSON.parse(answerString);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidateBase64: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const candidateString = Buffer.from(candidateBase64, 'base64').toString('utf-8');
    const candidate = JSON.parse(candidateString);
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  setOnRemoteStreamUpdate(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamUpdate = callback;
  }

  setOnCallStateChange(callback: (state: string) => void): void {
    this.onCallStateChange = callback;
  }

  setOnIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidate = callback;
  }

  disconnectCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => {
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
      this.onCallStateChange('ended');
    }
    this.initialized = false;
  }

  muteAudio(mute: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  }

  hideVideo(hide: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !hide;
      });
    }
  }
}

export const userVideoCallService = new UserVideoCallService();
