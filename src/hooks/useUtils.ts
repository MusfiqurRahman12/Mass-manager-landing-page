import { useCallback, useState } from "react";

/**
 * Hook for toggling boolean state
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle, setValue] as const;
}

/**
 * Hook for managing pagination
 */
export function usePagination(itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  return {
    currentPage,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    offset: (currentPage - 1) * itemsPerPage,
  };
}

/**
 * Hook for managing a list/array state
 */
export function useList<T>(initialList: T[] = []) {
  const [list, setList] = useState(initialList);

  const add = useCallback((item: T) => {
    setList((prev) => [...prev, item]);
  }, []);

  const remove = useCallback((index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const update = useCallback((index: number, item: T) => {
    setList((prev) => {
      const newList = [...prev];
      newList[index] = item;
      return newList;
    });
  }, []);

  const clear = useCallback(() => {
    setList([]);
  }, []);

  return { list, add, remove, update, clear, setList };
}
