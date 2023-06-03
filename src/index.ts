import { head, isNil, last, nth, pipe } from 'ramda';

// data SearchState container stateKey state = SearchState {
//   current :: state,
//   queue :: container,
//   visited :: Set.Set stateKey,
//   paths :: Map.Map stateKey [state]
//   }

type SearchState<TState, TKey> = {
  current: TState;
  paths: Map<TKey, TState[]>;
  queue: TState[];
  visited: Set<TKey>;
};

// -- | @leastCostly paths_a paths_b@ is a utility function to be used with
// -- 'dijkstra'-like functions. It returns True when the cost of @paths_a@
// -- is less than the cost of @paths_b@, where the total costs are the first
// -- elements in each tuple in each path
// leastCostly :: Ord a => [(a, b)] -> [(a, b)] -> Bool
// leastCostly ((cost_a, _):_) ((cost_b, _):_) = cost_b < cost_a
// -- logically this never happens, because if you have a
// -- zero-length path a point, you already visited it
// -- and thus do not consider other paths to it
// leastCostly [] _ = False
// -- logically this never happens, because you cannot find
// -- a new zero-length path to a point
// leastCostly _ [] = True

const leastCostly = <A, B>(pathsA: [A, B][], pathsB: [A, B][]): boolean => {
  if (!pathsB.length) return true;
  if (!pathsA.length) return false;

  const costA = head(head(pathsA)!)!;
  const costB = head(head(pathsB)!)!;
  return costB < costA;
};

const findIterate = <T>(
  getNext: (a: T) => T | undefined,
  isFound: (a: T) => boolean,
  initial: T | undefined
): T | undefined => {
  if (initial === undefined) return undefined;
  if (isFound(initial)) return initial;
  return findIterate(getNext, isFound, getNext(initial));
};

// -- | @nextSearchState@ moves from one @searchState@ to the next in the
// -- generalized search algorithm
// nextSearchStateM ::
//   (Monad m, Foldable f, SearchContainer container, Ord stateKey,
//    Elem container ~ state)
//   => ([state] -> [state] -> Bool)
//   -> (state -> stateKey)
//   -> (state -> m (f state))
//   -> SearchState container stateKey state
//   -> m (Maybe (SearchState container stateKey state))
// nextSearchStateM better mk_key nextM old = do
//   (new_queue, new_paths) <- new_queue_paths_M
//   let new_state_May = mk_search_state new_paths <$> pop new_queue
//   case new_state_May of
//     Just new_state ->
//       if mk_key (current new_state) `Set.member` visited old
//       then nextSearchStateM better mk_key nextM new_state
//       else return (Just new_state)
//     Nothing -> return Nothing
//   where
//     mk_search_state new_paths (new_current, remaining_queue) = SearchState {
//       current = new_current,
//       queue = remaining_queue,
//       visited = Set.insert (mk_key new_current) (visited old),
//       paths = new_paths
//       }
//     new_queue_paths_M =
//       List.foldl' update_queue_paths (queue old, paths old)
//         <$> nextM (current old)
//     update_queue_paths (old_queue, old_paths) st =
//       if mk_key st `Set.member` visited old
//       then (old_queue, old_paths)
//       else
//         case Map.lookup (mk_key st) old_paths of
//           Just old_path ->
//             if better old_path (st : steps_so_far)
//             then (q', ps')
//             else (old_queue, old_paths)
//           Nothing -> (q', ps')
//         where
//           steps_so_far = paths old Map.! mk_key (current old)
//           q' = push old_queue st
//           ps' = Map.insert (mk_key st) (st : steps_so_far) old_paths

const nextSearchState =
  <TState, TKey>(
    better: (as: TState[], bs: TState[]) => boolean,
    makeKey: (state: TState) => TKey,
    next: (state: TState) => TState[]
  ) =>
  (oldState: SearchState<TState, TKey>): SearchState<TState, TKey> | undefined => {
    const updateQueuePaths = (
      [oldQueue, oldPaths]: [TState[], Map<TKey, TState[]>],
      st: TState
    ): [TState[], Map<TKey, TState[]>] => {
      if (oldState.visited.has(makeKey(st))) return [oldQueue, oldPaths];

      const stepsSoFar = oldState.paths.get(makeKey(oldState.current))!;

      const nextQueue = [...oldQueue, st];
      const nextPaths = oldPaths.set(makeKey(st), [st, ...stepsSoFar]);

      const oldPath = oldPaths.get(makeKey(st));

      if (!oldPath) return [nextQueue, nextPaths];

      return better(oldPath, [st, ...stepsSoFar]) ? [nextQueue, nextPaths] : [oldQueue, nextPaths];
    };

    const newQueuePaths = next(oldState.current).reduce(updateQueuePaths, [oldState.queue, oldState.paths]);
    const [newQueue, newPaths] = newQueuePaths;

    if (!newQueue.length) return undefined;

    const [newCurrent, ...remainingQueue] = newQueue;
    const newState: SearchState<TState, TKey> = {
      current: newCurrent,
      paths: newPaths,
      queue: remainingQueue,
      visited: oldState.visited.add(makeKey(newCurrent))
    };

    return oldState.visited.has(makeKey(newState.current))
      ? nextSearchState(better, makeKey, next)(newState)
      : newState;
  };

const generalizedSearch = <TState, TKey>(
  empty: TState[],
  makeKey: (state: TState) => TKey,
  better: (oldState: TState[], newState: TState[]) => boolean,
  next: (state: TState) => TState[],
  found: (state: TState) => boolean,
  initial: TState
): TState[] | undefined => {
  const initialState: SearchState<TState, TKey> = {
    current: initial,
    paths: new Map([[makeKey(initial), []]]),
    queue: empty,
    visited: new Set([makeKey(initial)])
  };
  const end = findIterate(
    nextSearchState(better, makeKey, next),
    (a: SearchState<TState, TKey>) => found(a.current),
    initialState
  );
  const getSteps = (searchState: SearchState<TState, TKey> | undefined) =>
    searchState?.paths.get(makeKey(searchState.current));
  return getSteps(end)?.reverse();
};

// -- solved state is possible.
// dijkstraAssoc :: (Num cost, Ord cost, Ord state)
//   => (state -> [(state, cost)])
//   -- ^ function to generate list of neighboring states with associated
//   -- transition costs given the current state
//   -> (state -> Bool)
//   -- ^ Predicate to determine if solution found. 'dijkstraAssoc' returns the
//   -- shortest path to the first state for which this predicate returns 'True'.
//   -> state
//   -- ^ Initial state
//   -> Maybe (cost, [state])
//   -- ^ (Total cost, list of steps) for the first path found which
//   -- satisfies the given predicate
// dijkstraAssoc next found initial =
//   -- This API to Dijkstra's algoritm is useful in the common case when next
//   -- states and their associated transition costs are generated together.
//   --
//   -- Dijkstra's algorithm can be viewed as a generalized search, with the search
//   -- container being a heap, with the states being compared without regard to
//   -- cost, with the shorter paths taking precedence over longer ones, and with
//   -- the stored state being (cost so far, state).
//   -- This implementation makes that transformation, then transforms that result
//   -- back into the desired result from @dijkstraAssoc@
//   unpack <$>
//     generalizedSearch emptyLIFOHeap snd leastCostly next' (found . snd)
//       (0, initial)
//   where
//     next' (old_cost, st) =
//       (\(new_st, new_cost) -> (new_cost + old_cost, new_st))
//         <$> (next st)
//     unpack [] = (0, [])
//     unpack packed_states = (fst . last $ packed_states, map snd packed_states)
export const dijkstraAssoc = <TState, TKey>(
  next: (state: TState) => [TState, number][],
  found: (state: TState) => boolean,
  initial: TState
): [number, TState[]] | undefined => {
  const unpack = (packedStates: [number, TState][] | undefined): [number, TState[]] | undefined => {
    if (isNil(packedStates)) return packedStates;
    if (!packedStates.length) return [0, []];
    const fst = head(last(packedStates)!);
    const snd = packedStates.map(x => x[1]);
    return [fst, snd];
  };

  const nextSt = (oldCost: number, st: TState) => next(st).map(([newSt, newCost]) => [newCost + oldCost, newSt]);

  const r = generalizedSearch<[number, TState]>([], nth(1), leastCostly, nextSt, pipe(nth(1), found), [0, initial]);
  return unpack(r);
};
