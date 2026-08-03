import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { RealtimeService } from './realtime.service';

describe('RealtimeService', () => {
  const socket = jasmine.createSpyObj('Socket', ['on', 'disconnect']);

  beforeEach(() => {
    localStorage.clear();
    socket.on.calls.reset();
    socket.disconnect.calls.reset();
    delete window.io;
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
    delete window.io;
  });

  it('connects with the current JWT and registers listeners', () => {
    localStorage.setItem('token', 'jwt-token');
    const io = jasmine.createSpy('io').and.returnValue(socket);
    window.io = io;
    const listener = jasmine.createSpy('listener');

    TestBed.inject(RealtimeService).on('order.updated', listener);

    expect(io).toHaveBeenCalledOnceWith(environment.apiUrl, {
      auth: { token: 'jwt-token' },
    });
    expect(socket.on).toHaveBeenCalledOnceWith('order.updated', listener);
  });

  it('does not connect without an authenticated session', () => {
    const io = jasmine.createSpy('io').and.returnValue(socket);
    window.io = io;

    TestBed.inject(RealtimeService).on('order.updated', () => undefined);

    expect(io).not.toHaveBeenCalled();
  });

  it('disconnects the active socket', () => {
    localStorage.setItem('token', 'jwt-token');
    window.io = jasmine.createSpy('io').and.returnValue(socket);
    const service = TestBed.inject(RealtimeService);
    service.on('order.updated', () => undefined);

    service.disconnect();

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });
});
