import { useEffect } from 'react';

function useInputs({ onApply }: { onApply: (value: string) => void }) {
  // keyboard operations
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const root = document.querySelector('[cmdk-root]')
      if (
        root &&
        ['ArrowDown', 'ArrowUp'].includes(e.key) &&
        e.target !== root
      ) {
        const event = new KeyboardEvent('keydown', {
          key: e.key,
          code: e.code,
          keyCode: e.keyCode,
          which: e.which,
          bubbles: true,
          cancelable: true,
        });
        root.dispatchEvent(event)
      }

      if (e.key === 'Enter') {
        const value = document.querySelector('[cmdk-item][data-selected="true"]')?.getAttribute('data-value')
        if (value) {
          onApply(value)
        }
      }
    }

    function handleClick(e: MouseEvent) {
      const item = (e.target as (HTMLElement | null))?.closest('[cmdk-item]')
      if (item) {
        const value = item.getAttribute('data-value')
        if (value) {
          onApply(value)
        }
      }
    }

    document.addEventListener('keydown', handleKeydown, false)
    document.addEventListener('click', handleClick, false)

    return () => {
      document.removeEventListener('keydown', handleKeydown, false)
      document.removeEventListener('click', handleClick, false)
    }
  }, [onApply])
}

export default useInputs