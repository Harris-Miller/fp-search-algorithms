/**
 * Internal type used to manage search state
 * @private
 */
export type SearchState<TState, TKey> = {
  current: TState;
  paths: Map<TKey, TState[]>;
  queue: TState[];
  visited: Set<TKey>;
};
