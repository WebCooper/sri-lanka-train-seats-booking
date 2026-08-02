import {
  COACH_CLASSES,
  isSeatCountCompatible,
  seatsPerRow,
} from './coach.util';

describe('coach.util', () => {
  describe('seatsPerRow', () => {
    it('sums configuration parts', () => {
      expect(seatsPerRow('2+2')).toBe(4);
      expect(seatsPerRow('3+2')).toBe(5);
      expect(seatsPerRow('1+1')).toBe(2);
    });
  });

  describe('isSeatCountCompatible', () => {
    it('accepts divisible seat counts', () => {
      expect(isSeatCountCompatible(40, '2+2')).toBe(true);
      expect(isSeatCountCompatible(50, '3+2')).toBe(true);
    });

    it('rejects incompatible seat counts', () => {
      expect(isSeatCountCompatible(41, '2+2')).toBe(false);
      expect(isSeatCountCompatible(0, '2+2')).toBe(false);
    });
  });

  it('defines supported coach classes', () => {
    expect(COACH_CLASSES).toEqual(['FIRST', 'SECOND', 'THIRD', 'OBSERVATION']);
  });
});
