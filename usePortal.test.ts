import { act, renderHook } from '@testing-library/react-hooks'
import usePortal, { errorMessage1 } from './usePortal'

describe('usePortal', () => {
  it('should not be open', () => {
    const { result } = renderHook(() => usePortal())
    const { isOpen } = result.current
    expect(isOpen).toBe(false)
  })

  it('should error if no event is passed and no ref is set', () => {
    const { result } = renderHook(() => usePortal())
    try {
      result.current.openPortal()
    } catch(err) {
      expect(err.message).toBe(errorMessage1)
    }
  })

  it('does not error if programmatically opening the portal', () => {
    const { result } = renderHook(() => usePortal({ programmaticallyOpen: true }))
    act(() => {
      expect(result.current.openPortal).not.toThrow()
    });
  })
})