import { useState } from 'react';

import { Compartment } from '@codemirror/state';

function useCompartment() {
  const [compartment] = useState(() => new Compartment());
  return compartment;
}

export { useCompartment };
