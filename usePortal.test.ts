import { renderHook } from 'react-hooks-testing-library'
import usePortal from './usePortal';

 describe('usePortal', () => {
  it('should not be open', () => {
    const { result } = renderHook(() => usePortal())
    const { isOpen } = result.current
    expect(isOpen).toBe(false)
  });
});