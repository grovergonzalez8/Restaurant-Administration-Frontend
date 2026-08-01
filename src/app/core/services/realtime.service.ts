import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type Socket = { on(event: string, callback: (payload: unknown) => void): void; disconnect(): void; };
declare global { interface Window { io?: (url: string) => Socket; } }

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket?: Socket;
  private readonly callbacks = new Map<string, Array<(payload: unknown) => void>>();
  constructor() { this.connect(); }

  on(event: string, callback: (payload: unknown) => void): void {
    const listeners = this.callbacks.get(event) || [];
    listeners.push(callback); this.callbacks.set(event, listeners);
    this.socket?.on(event, callback);
  }

  private connect(): void {
    if (window.io) { this.open(); return; }
    const script = document.createElement('script');
    script.src = `${environment.apiUrl}/socket.io/socket.io.js`;
    script.onload = () => this.open();
    document.head.appendChild(script);
  }

  private open(): void {
    if (!window.io || this.socket) return;
    this.socket = window.io(environment.apiUrl);
    this.callbacks.forEach((listeners, event) => listeners.forEach((listener) => this.socket?.on(event, listener)));
  }
}
