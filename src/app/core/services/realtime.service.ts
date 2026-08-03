import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type Socket = {
  on(event: string, callback: (payload: unknown) => void): void;
  disconnect(): void;
};

type SocketOptions = { auth: { token: string } };

declare global {
  interface Window {
    io?: (url: string, options: SocketOptions) => Socket;
  }
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket?: Socket;
  private loadingClient = false;
  private readonly callbacks = new Map<string, Array<(payload: unknown) => void>>();

  on(event: string, callback: (payload: unknown) => void): void {
    const listeners = this.callbacks.get(event) || [];
    listeners.push(callback);
    this.callbacks.set(event, listeners);
    this.socket?.on(event, callback);
    this.connect();
  }

  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  private connect(): void {
    const token = localStorage.getItem('token');
    if (!token || this.socket) return;

    if (window.io) {
      this.open(token);
      return;
    }

    if (this.loadingClient) return;
    this.loadingClient = true;

    const script = document.createElement('script');
    script.src = `${environment.apiUrl}/socket.io/socket.io.js`;
    script.onload = () => {
      this.loadingClient = false;
      const currentToken = localStorage.getItem('token');
      if (currentToken) this.open(currentToken);
    };
    script.onerror = () => {
      this.loadingClient = false;
    };
    document.head.appendChild(script);
  }

  private open(token: string): void {
    if (!window.io || this.socket) return;
    this.socket = window.io(environment.apiUrl, { auth: { token } });
    this.callbacks.forEach((listeners, event) =>
      listeners.forEach((listener) => this.socket?.on(event, listener)),
    );
  }
}
