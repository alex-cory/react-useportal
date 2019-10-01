import { renderHook } from '@testing-library/react-hooks'
import usePortal from './usePortal'

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
      expect(err.message).toBe('You must either bind to an element or pass an event to openPortal(e).')
    }
  })
})