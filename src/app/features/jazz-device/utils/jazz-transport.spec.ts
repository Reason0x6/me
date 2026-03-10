import { reduceTransportState } from './jazz-transport';

describe('reduceTransportState', () => {
  it('should move from idle to stopped when initialized', () => {
    expect(reduceTransportState('idle', 'initialize')).toBe('stopped');
  });

  it('should enter generating during take creation and ready when finished', () => {
    expect(reduceTransportState('stopped', 'generate')).toBe('generating');
    expect(reduceTransportState('generating', 'finish')).toBe('ready');
  });

  it('should handle play pause and stop transitions', () => {
    expect(reduceTransportState('ready', 'play')).toBe('playing');
    expect(reduceTransportState('playing', 'pause')).toBe('paused');
    expect(reduceTransportState('paused', 'stop')).toBe('stopped');
  });

  it('should preserve error state on play attempts', () => {
    expect(reduceTransportState('error', 'play')).toBe('error');
  });
});
