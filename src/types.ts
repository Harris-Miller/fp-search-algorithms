/**
 * Internal type used to manage search state
 * @private
 */
export type SearchState<TState> = {
  current: TState;
  paths: Map<string, TState[]>;
  queue: TState[];
  visited: Set<string>;
};
