import { useState, useCallback, useRef, useEffect } from 'react';

export interface ModelState<T = any> {
  isOpen: boolean;
  data: T | null;
}

export interface ModelOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onConfirm?: (data: any) => void;
}

export function useModel<T = any>(initialState: Partial<ModelState<T>> = {}, options: ModelOptions = {}) {
  const [state, setState] = useState<ModelState<T>>({
    isOpen: false,
    data: null,
    ...initialState
  });

  const open = useCallback((data?: T) => {
    setState({ isOpen: true, data: data || null });
    options.onOpen?.();
  }, [options]);

  const close = useCallback(() => {
    setState({ isOpen: false, data: null });
    options.onClose?.();
  }, [options]);

  const confirm = useCallback((data?: any) => {
    options.onConfirm?.(data);
    close();
  }, [options, close]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    open,
    close,
    confirm,
    setData
  };
}

export function useConfirmModel(options?: ModelOptions) {
  const model = useModel(options);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const openWithTimeout = useCallback((data?: any, timeout?: number) => {
    model.open(data);
    
    if (timeout) {
      timeoutRef.current = setTimeout(() => {
        model.close();
      }, timeout);
    }
  }, [model]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...model,
    openWithTimeout
  };
}