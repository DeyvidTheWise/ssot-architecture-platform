import { clientEnv } from "@/lib/env/client-env";

type EventCallback = (payload: unknown) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventCallback>>();

  connect(token?: string): void {
    if (typeof window === "undefined") {
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const url = token ? `${clientEnv.wsUrl}?token=${encodeURIComponent(token)}` : clientEnv.wsUrl;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as { event?: string; type?: string; payload?: unknown };
        const eventName = parsed.event ?? parsed.type;
        if (!eventName) {
          return;
        }

        const callbacks = this.listeners.get(eventName);
        if (!callbacks) {
          return;
        }

        callbacks.forEach((callback) => callback(parsed.payload ?? parsed));
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
    };
  }

  disconnect(): void {
    if (!this.ws) {
      return;
    }

    this.ws.close();
    this.ws = null;
  }

  subscribeProject(projectId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(
      JSON.stringify({
        type: "join_project",
        projectId
      })
    );
  }

  on(eventName: string, callback: EventCallback): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set<EventCallback>());
    }

    this.listeners.get(eventName)!.add(callback);
  }

  off(eventName: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) {
      return;
    }

    callbacks.delete(callback);
    if (callbacks.size === 0) {
      this.listeners.delete(eventName);
    }
  }
}

export const socketClient = new SocketClient();

export type SupportedSocketEvent =
  | "artifact:created"
  | "artifact:updated"
  | "artifact:deleted"
  | "relation:created"
  | "relation:deleted"
  | "validation:completed"
  | "version:created"
  | "export:completed";