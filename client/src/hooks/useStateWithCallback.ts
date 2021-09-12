import { useCallback, useEffect, useRef, useState } from 'react';

const useStateWithCallback = (initialState: any) => {
  const [state, setState] = useState(initialState);
  const cbRef = useRef<any>();

  const updateState = useCallback((newState: any, cb: void) => {
    cbRef.current = cb;
    setState((prev: any) => (typeof newState === 'function' ? newState(prev) : newState));
  }, []);

  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null;
    }
  }, [state]);

  return [state, updateState];
};
export default useStateWithCallback;
