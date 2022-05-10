import WebSocket from "ws";

export interface SocketInterface {
  connect: () => void;
  disconnect: () => void;
  // onOpen: () => void;
  // onMessage: (data: string) => void;
  // onClose: (event: WebSocket.CloseEvent) => void;
  // onError: (error: WebSocket.ErrorEvent) => void;
}
