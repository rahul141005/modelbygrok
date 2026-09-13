import { describe, it, expect } from 'vitest';
import { inspectAdultFace } from '../face.js';

describe('inspectAdultFace', () => {
  it('rejects non-image files', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const result = await inspectAdultFace(file);
    
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('still image');
  });

  it('rejects oversized files', async () => {
    const largeData = new Uint8Array(9 * 1024 * 1024);
    const file = new File([largeData], 'large.jpg', { type: 'image/jpeg' });
    const result = await inspectAdultFace(file);
    
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('8MB');
  });

  it('rejects missing file', async () => {
    const result = await inspectAdultFace(null);
    
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('still image');
  });
});
