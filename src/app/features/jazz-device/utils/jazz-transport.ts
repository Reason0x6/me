import { DeviceTransportState } from '../models/jazz-device.types';

export type TransportAction =
  | 'initialize'
  | 'generate'
  | 'play'
  | 'pause'
  | 'stop'
  | 'finish'
  | 'error';

export function reduceTransportState(
  state: DeviceTransportState,
  action: TransportAction,
): DeviceTransportState {
  switch (action) {
    case 'initialize':
      return state === 'idle' ? 'stopped' : state;
    case 'generate':
      return 'generating';
    case 'play':
      return state === 'error' ? state : 'playing';
    case 'pause':
      return state === 'playing' ? 'paused' : state;
    case 'stop':
      return state === 'idle' ? state : 'stopped';
    case 'finish':
      return state === 'generating' ? 'ready' : state === 'playing' ? 'ready' : 'ready';
    case 'error':
      return 'error';
    default:
      return state;
  }
}
