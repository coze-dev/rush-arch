import { useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}

export { useLatest };
