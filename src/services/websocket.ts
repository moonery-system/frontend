export interface PushPayload {
  type: string;
  title?: string;
  description?: string;
  user_id?: number;
  // On "chat.message": the conversation the message belongs to.
  conversation_id?: number;
}

type Handler = (payload: PushPayload) => void;

const MAX_BACKOFF_MS = 30000;

let socket: WebSocket | null = null;
let handlers: Handler[] = [];
let attempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect = false;

/**
 * Opens the connection. The httpOnly token cookie travels on its own: cookies
 * ignore the port, so the one the API set on this host reaches the websocket
 * server. Nothing is put in the query string.
 */
export function connect(): void {
  const url = process.env.VUE_APP_WS_URL;
  if (!url) return;

  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  shouldReconnect = true;
  socket = new WebSocket(url);

  socket.onopen = () => {
    attempt = 0;
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as PushPayload;
      handlers.forEach((handler) => handler(payload));
    } catch (err) {
      // frame que não é JSON: ignorar em vez de derrubar a conexão
    }
  };

  socket.onclose = () => {
    socket = null;
    if (shouldReconnect) scheduleReconnect();
  };
}

function scheduleReconnect(): void {
  const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
  attempt += 1;

  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, delay);
}

export function disconnect(): void {
  shouldReconnect = false;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  socket?.close();
  socket = null;
  attempt = 0;
}

/**
 * Returns the unsubscribe function, so a component can clean up on unmount.
 */
export function onNotification(handler: Handler): () => void {
  handlers.push(handler);

  return () => {
    handlers = handlers.filter((registered) => registered !== handler);
  };
}
