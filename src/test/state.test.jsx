import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { ViewerProvider, useViewer } from '../state.jsx';

function TestComponent({ onState }) {
  const state = useViewer();
  onState(state);
  return <div data-testid="test">{state.look}</div>;
}

function createHarness() {
  let stateRef = null;
  const utils = render(
    <ViewerProvider>
      <TestComponent onState={(s) => { stateRef = s; }} />
    </ViewerProvider>
  );
  return { ...utils, getState: () => stateRef };
}

describe('ViewerProvider state', () => {
  it('initializes with default values', () => {
    const { getState } = createHarness();
    const state = getState();
    
    expect(state.look).toBe('casual');
    expect(state.robe).toBe(false);
    expect(state.bust).toBeCloseTo(0.42, 5);
    expect(state.hips).toBeCloseTo(0.48, 5);
    expect(state.clothed).toBe(true);
    expect(state.outfit.casual).toBe(true);
  });

  describe('outfit state', () => {
    it('correctly computes clothed=false for none', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setLook('none');
      });
      
      const state = getState();
      expect(state.clothed).toBe(false);
      expect(state.outfit.casual).toBe(false);
      expect(state.outfit.dress).toBe(false);
      expect(state.outfit.lingerie).toBe(false);
    });

    it('correctly computes clothed=true for dress', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setLook('dress');
      });
      
      const state = getState();
      expect(state.clothed).toBe(true);
      expect(state.outfit.dress).toBe(true);
    });
  });

  describe('bust/hips validation', () => {
    it('clamps bust to 0-1 range', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setBust(-0.5);
      });
      expect(getState().bust).toBe(0);
      
      act(() => {
        getState().setBust(1.5);
      });
      expect(getState().bust).toBe(1);
      
      act(() => {
        getState().setBust(0.5);
      });
      expect(getState().bust).toBe(0.5);
    });

    it('clamps hips to 0-1 range', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setHips(-0.5);
      });
      expect(getState().hips).toBe(0);
      
      act(() => {
        getState().setHips(1.5);
      });
      expect(getState().hips).toBe(1);
      
      act(() => {
        getState().setHips(0.5);
      });
      expect(getState().hips).toBe(0.5);
    });
  });

  describe('face texture lifecycle', () => {
    it('clears face when switching to unclothed look', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setFaceTexture('fake-texture');
      });
      expect(getState().faceTexture).toBe('fake-texture');
      
      act(() => {
        getState().setLook('none');
      });
      expect(getState().faceTexture).toBe(null);
      expect(getState().clothed).toBe(false);
    });

    it('clears face when consent is revoked', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setConsent(true);
        getState().setAdultAttest(true);
        getState().setFaceTexture('fake-texture');
      });
      expect(getState().faceTexture).toBe('fake-texture');
      
      act(() => {
        getState().setConsent(false);
      });
      expect(getState().faceTexture).toBe(null);
    });

    it('clears face when adult attestation is revoked', () => {
      const { getState } = createHarness();
      
      act(() => {
        getState().setConsent(true);
        getState().setAdultAttest(true);
        getState().setFaceTexture('fake-texture');
      });
      expect(getState().faceTexture).toBe('fake-texture');
      
      act(() => {
        getState().setAdultAttest(false);
      });
      expect(getState().faceTexture).toBe(null);
    });
  });
});
