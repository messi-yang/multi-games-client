import { P2pEvent } from './p2p-events';

type OnMessage = (p2pEvent: P2pEvent) => void;
type OnClose = () => void;
type OnOpen = () => void;

export interface P2pConnection {
  createOffer(): Promise<[RTCSessionDescription | null, RTCIceCandidate[]]>;
  acceptAnswer(answer: RTCSessionDescription, remoteIceCandidates: RTCIceCandidate[]): Promise<void>;
  createAnswer(
    offer: RTCSessionDescription,
    remoteIceCandidates: RTCIceCandidate[]
  ): Promise<[RTCSessionDescription | null, RTCIceCandidate[]]>;
  getLocalDescription(): RTCSessionDescription | null;
  getIceCandidates(): RTCIceCandidate[];
  sendMessage(p2pEvent: P2pEvent): boolean;
  getIsConnected(): boolean;
}

class P2pConnectionImpl implements P2pConnection {
  constructor(
    private p2pConn: RTCPeerConnection,
    private iceCandidates: RTCIceCandidate[],
    private dataChannel: RTCDataChannel | null,
    private isConnected: boolean,
    private onMessage: OnMessage,
    private onOpen: OnOpen,
    private onClose: OnClose
  ) {}

  public async createOffer(): Promise<[RTCSessionDescription | null, RTCIceCandidate[]]> {
    await new Promise((resolve) => {
      const dataChannel = this.p2pConn.createDataChannel('dataChannel');
      dataChannel.addEventListener('message', (evt: MessageEvent<string>) => {
        const p2pEvent = JSON.parse(evt.data) as P2pEvent;

        console.log('p2p event received: ', p2pEvent.name, p2pEvent);

        this.onMessage(p2pEvent);
      });
      dataChannel.addEventListener('open', () => {
        this.isConnected = true;
        this.onOpen();
      });
      dataChannel.addEventListener('close', () => {
        this.isConnected = false;
        this.onClose();
      });
      this.dataChannel = dataChannel;

      this.p2pConn.onicecandidate = (e) => {
        if (!e.candidate) {
          resolve(true);
        } else {
          this.iceCandidates.push(e.candidate);
        }
      };
      this.p2pConn.createOffer().then((offer) => {
        return this.p2pConn.setLocalDescription(offer);
      });
    });

    return [this.p2pConn.localDescription, this.iceCandidates];
  }

  public async acceptAnswer(answer: RTCSessionDescription, remoteIceCandidates: RTCIceCandidate[]) {
    this.p2pConn.setRemoteDescription(answer);
    remoteIceCandidates.forEach((remoteIceCandidate) => {
      this.p2pConn.addIceCandidate(remoteIceCandidate);
    });
  }

  public async createAnswer(
    offer: RTCSessionDescription,
    remoteIceCandidates: RTCIceCandidate[]
  ): Promise<[RTCSessionDescription | null, RTCIceCandidate[]]> {
    this.p2pConn.setRemoteDescription(offer);
    this.p2pConn.addEventListener('datachannel', (dataChannelEvent) => {
      this.dataChannel = dataChannelEvent.channel;
      this.dataChannel.addEventListener('message', (evt) => {
        const p2pEvent = JSON.parse(evt.data) as P2pEvent;
        // console.log('Receive via P2P', p2pEvent.name, p2pEvent);s
        this.onMessage(p2pEvent);
      });
      this.dataChannel.addEventListener('open', () => {
        this.isConnected = true;
        this.onOpen();
      });
      this.dataChannel.addEventListener('close', () => {
        this.isConnected = false;
        this.onClose();
      });
    });

    remoteIceCandidates.forEach((remoteIceCandidate) => {
      this.p2pConn.addIceCandidate(remoteIceCandidate);
    });

    await new Promise((resolve) => {
      this.p2pConn.onicecandidate = (e) => {
        if (!e.candidate) {
          resolve(true);
        } else {
          this.iceCandidates.push(e.candidate);
        }
      };
      this.p2pConn.createAnswer().then((answer) => {
        return this.p2pConn.setLocalDescription(answer);
      });
    });

    return [this.p2pConn.localDescription, this.iceCandidates];
  }

  public getLocalDescription(): RTCSessionDescription | null {
    return this.p2pConn.localDescription;
  }

  public getIceCandidates(): RTCIceCandidate[] {
    return this.iceCandidates;
  }

  /**
   * Send message to remote peer
   * @returns succeeded
   */
  public sendMessage(p2pEvent: P2pEvent): boolean {
    console.log('p2p event sent:', p2pEvent.name, p2pEvent);

    if (!this.dataChannel) return false;
    if (this.dataChannel?.readyState !== 'open') return false;

    // console.log('Send via P2P', p2pEvent.name, p2pEvent);
    this.dataChannel.send(JSON.stringify(p2pEvent));
    return true;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const createP2pConnection = (options: { onMessage: OnMessage; onClose: OnClose; onOpen: OnOpen }): P2pConnection => {
  return new P2pConnectionImpl(
    new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.voipbuster.com' }, { urls: 'stun:stun.ekiga.net' }],
    }),
    [],
    null,
    false,
    options.onMessage,
    options.onOpen,
    options.onClose
  );
};
