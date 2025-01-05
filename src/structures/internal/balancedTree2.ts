import { EQ, GT, LT, omniCompare } from '../../helpers/ordering';

const DELTA = 4;
const RATIO = 2;

// type Flag = { val: boolean };
export type KeyValuePair<K, V> = [key: K, value: V];
export type Bin<K, V> = { k: K; left: Node<K, V>; right: Node<K, V>; size: number; v: V };
export type Node<K, V> = Bin<K, V> | undefined;

const getSize = <K, V>(node: Node<K, V>): number => {
  return node?.size ?? 0;
};

// bin :: k -> a -> Map k a -> Map k a -> Map k a
// bin k x l r
//   = Bin (size l + size r + 1) k x l r
const createBin = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Bin<K, V> => ({
  k: key,
  left,
  right,
  size: getSize(left) + getSize(right) + 1,
  v: val,
});

const createRoot = <K, V>(key: K, val: V): Bin<K, V> => ({
  k: key,
  left: undefined,
  right: undefined,
  size: 1,
  v: val,
});

// singleL, singleR :: a -> b -> Map a b -> Map a b -> Map a b
// singleL k1 x1 t1 (Bin _ k2 x2 t2 t3)  = bin k2 x2 (bin k1 x1 t1 t2) t3
// singleL _ _ _ Tip = error "singleL Tip"

const singleL = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (right === undefined) {
    throw new Error('singleL Tip');
  }

  return createBin(right.k, right.v, createBin(key, val, left, right.left), right.right);
};

// singleR k1 x1 (Bin _ k2 x2 t1 t2) t3  = bin k2 x2 t1 (bin k1 x1 t2 t3)
// singleR _ _ Tip _ = error "singleR Tip"
const singleR = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (left === undefined) {
    throw new Error('singleR Tip');
  }

  return createBin(left.k, left.v, left.left, createBin(key, val, left.right, right));
};

// doubleL, doubleR :: a -> b -> Map a b -> Map a b -> Map a b
// doubleL k1 x1 t1 (Bin _ k2 x2 (Bin _ k3 x3 t2 t3) t4) = bin k3 x3 (bin k1 x1 t1 t2) (bin k2 x2 t3 t4)
// doubleL _ _ _ _ = error "doubleL"
const doubleL = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  const k1 = key;
  const v1 = val;
  const t1 = left;
  if (right === undefined) {
    throw new Error('doubleL');
  }

  const innerLeft = right.left;

  if (innerLeft === undefined) {
    throw new Error('doubleL');
  }

  const { k: k2, v: v2, right: t4 } = right;
  const { k: k3, v: v3, left: t2, right: t3 } = innerLeft;

  return createBin(k3, v3, createBin(k1, v1, t1, t2), createBin(k2, v2, t3, t4));
};

// doubleR k1 x1 (Bin _ k2 x2 t1 (Bin _ k3 x3 t2 t3)) t4 = bin k3 x3 (bin k2 x2 t1 t2) (bin k1 x1 t3 t4)
// doubleR _ _ _ _ = error "doubleR"
const doubleR = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  const k1 = key;
  const v1 = val;
  const t4 = right;
  if (left === undefined) {
    throw new Error('doubleR');
  }

  const innerRight = left.right;

  if (innerRight === undefined) {
    throw new Error('doubleR');
  }

  const { k: k2, v: v2, left: t1 } = left;
  const { k: k3, v: v3, left: t2, right: t3 } = innerRight;

  return createBin(k3, v3, createBin(k2, v2, t1, t2), createBin(k1, v1, t3, t4));
};

// -- rotate
// rotateL :: a -> b -> Map a b -> Map a b -> Map a b
// rotateL k x l r@(Bin _ _ _ ly ry)
//   | size ly < ratio*size ry = singleL k x l r
//   | otherwise               = doubleL k x l r
// rotateL _ _ _ Tip = error "rotateL Tip"
const rotateL = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (right === undefined) {
    throw new Error('rotateL Tip');
  }
  const { left: ly, right: ry } = right;

  return getSize(ly) < RATIO * getSize(ry) ? singleL(key, val, left, right) : doubleL(key, val, left, right);
};

// rotateR :: a -> b -> Map a b -> Map a b -> Map a b
// rotateR k x l@(Bin _ _ _ ly ry) r
//   | size ry < ratio*size ly = singleR k x l r
//   | otherwise               = doubleR k x l r
// rotateR _ _ Tip _ = error "rotateR Tip"
const rotateR = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (left === undefined) {
    throw new Error('rotateR Tip');
  }

  const { left: ly, right: ry } = left;

  return getSize(ry) < RATIO * getSize(ly) ? singleR(key, val, left, right) : doubleR(key, val, left, right);
};

// balance :: k -> a -> Map k a -> Map k a -> Map k a
// balance k x l r
//   | sizeL + sizeR <= 1    = Bin sizeX k x l r
//   | sizeR >= delta*sizeL  = rotateL k x l r
//   | sizeL >= delta*sizeR  = rotateR k x l r
//   | otherwise             = Bin sizeX k x l r
//   where
//     sizeL = size l
//     sizeR = size r
//     sizeX = sizeL + sizeR + 1
const balance = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  const sizeL = getSize(left);
  const sizeR = getSize(right);
  const sizeX = sizeL + sizeR + 1;

  if (sizeL + sizeR <= 1) return { k: key, left, right, size: sizeX, v: val };
  if (sizeR >= DELTA * sizeL) return rotateL(key, val, left, right);
  if (sizeL >= DELTA * sizeR) return rotateR(key, val, left, right);
  return { k: key, left, right, size: sizeX, v: val };
};

// -- | /O(log n)/. Delete and find the minimal element.
// --
// -- > deleteFindMin (fromList [(5,"a"), (3,"b"), (10,"c")]) == ((3,"b"), fromList[(5,"a"), (10,"c")])
// -- > deleteFindMin                                            Error: can not return the minimal element of an empty map

// deleteFindMin :: Map k a -> ((k,a),Map k a)
// deleteFindMin t
//   = case t of
//       Bin _ k x Tip r -> ((k,x),r)
//       Bin _ k x l r   -> let (km,l') = deleteFindMin l in (km,balance k x l' r)
//       Tip             -> (error "Map.deleteFindMin: can not return the minimal element of an empty map", Tip)
const deleteFindMin = <K, V>(node: Node<K, V>): [kv: KeyValuePair<K, V>, node: Node<K, V>] => {
  if (node === undefined) {
    throw new Error('deleteFindMin cannot return the minimal element of an empty node');
  }
  if (node.left === undefined) return [[node.k, node.v], node.right];
  const [kv, newLeft] = deleteFindMin(node.left);
  return [kv, balance(node.k, node.v, newLeft, node.right)];
};

// -- | /O(log n)/. Delete and find the maximal element.
// --
// -- > deleteFindMax (fromList [(5,"a"), (3,"b"), (10,"c")]) == ((10,"c"), fromList [(3,"b"), (5,"a")])
// -- > deleteFindMax empty                                      Error: can not return the maximal element of an empty map

// deleteFindMax :: Map k a -> ((k,a),Map k a)
// deleteFindMax t
//   = case t of
//       Bin _ k x l Tip -> ((k,x),l)
//       Bin _ k x l r   -> let (km,r') = deleteFindMax r in (km,balance k x l r')
//       Tip             -> (error "Map.deleteFindMax: can not return the maximal element of an empty map", Tip)
const deleteFindMax = <K, V>(node: Node<K, V>): [kv: KeyValuePair<K, V>, node: Node<K, V>] => {
  if (node === undefined) {
    throw new Error('deleteFindMin cannot return the minimal element of an empty node');
  }
  if (node.right === undefined) return [[node.k, node.v], node.left];
  const [kv, newRight] = deleteFindMax(node.right);
  return [kv, balance(node.k, node.v, node.left, newRight)];
};

// {--------------------------------------------------------------------
//   [glue l r]: glues two trees together.
//   Assumes that [l] and [r] are already balanced with respect to each other.
// --------------------------------------------------------------------}
// glue :: Map k a -> Map k a -> Map k a
// glue Tip r = r
// glue l Tip = l
// glue l r
//   | size l > size r = let ((km,m),l') = deleteFindMax l in balance km m l' r
//   | otherwise       = let ((km,m),r') = deleteFindMin r in balance km m l r'
const glue = <K, V>(left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (left === undefined) return right;
  if (right === undefined) return left;

  if (left.size > right.size) {
    const [[k, v], newLeft] = deleteFindMax(left);
    return balance(k, v, newLeft, right);
  }

  const [[k, v], newRight] = deleteFindMin(right);
  return balance(k, v, left, newRight);
};

// {--------------------------------------------------------------------
//   [merge l r]: merges two trees.
// --------------------------------------------------------------------}
// merge :: Map k a -> Map k a -> Map k a
// merge Tip r   = r
// merge l Tip   = l
// merge l@(Bin sizeL kx x lx rx) r@(Bin sizeR ky y ly ry)
//   | delta*sizeL <= sizeR = balance ky y (merge l ly) ry
//   | delta*sizeR <= sizeL = balance kx x lx (merge rx r)
//   | otherwise            = glue l r
const merge = <K, V>(left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (left === undefined) return right;
  if (right === undefined) return left;

  if (DELTA * left.size <= right.size) return balance(right.k, right.v, merge(left, right.left), right.right);
  if (DELTA * right.size <= left.size) return balance(left.k, left.v, left.left, merge(left.right, right));
  return glue(left, right);
};

// -- insertMin and insertMax don't perform potentially expensive comparisons.
// insertMax,insertMin :: k -> a -> Map k a -> Map k a
// insertMax kx x t
//   = case t of
//       Tip -> singleton kx x
//       Bin _ ky y l r
//           -> balance ky y l (insertMax kx x r)
const insertMax = <K, V>(key: K, val: V, node: Node<K, V>): Node<K, V> => {
  if (node === undefined) return createRoot(key, val);
  return balance(node.k, node.v, node.left, insertMax(key, val, node.right));
};

// insertMin kx x t
//   = case t of
//       Tip -> singleton kx x
//       Bin _ ky y l r
//           -> balance ky y (insertMin kx x l) r
const insertMin = <K, V>(key: K, val: V, node: Node<K, V>): Node<K, V> => {
  if (node === undefined) return createRoot(key, val);
  return balance(node.k, node.v, insertMin(key, val, node.left), node.right);
};

// {--------------------------------------------------------------------
//   Join
// --------------------------------------------------------------------}
// join :: Ord k => k -> a -> Map k a -> Map k a -> Map k a
// join kx x Tip r  = insertMin kx x r
// join kx x l Tip  = insertMax kx x l
// join kx x l@(Bin sizeL ky y ly ry) r@(Bin sizeR kz z lz rz)
//   | delta*sizeL <= sizeR  = balance kz z (join kx x l lz) rz
//   | delta*sizeR <= sizeL  = balance ky y ly (join kx x ry r)
//   | otherwise             = bin kx x l r
const join = <K, V>(key: K, val: V, left: Node<K, V>, right: Node<K, V>): Node<K, V> => {
  if (left === undefined) return insertMin(key, val, right);
  if (right === undefined) return insertMax(key, val, left);

  if (DELTA * left.size <= right.size) return balance(right.k, right.v, join(key, val, left, right.left), right.right);
  if (DELTA * right.size <= left.size) return balance(left.k, left.v, left.left, join(key, val, left.right, right));
  return createBin(key, val, left, right);
};

// {--------------------------------------------------------------------
//   Insertion
// --------------------------------------------------------------------}
// -- | /O(log n)/. Insert a new key and value in the map.
// -- If the key is already present in the map, the associated value is
// -- replaced with the supplied value. 'insert' is equivalent to
// -- @'insertWith' 'const'@.
// --
// -- > insert 5 'x' (fromList [(5,'a'), (3,'b')]) == fromList [(3, 'b'), (5, 'x')]
// -- > insert 7 'x' (fromList [(5,'a'), (3,'b')]) == fromList [(3, 'b'), (5, 'a'), (7, 'x')]
// -- > insert 5 'x' empty                         == singleton 5 'x'

// insert :: Ord k => k -> a -> Map k a -> Map k a
// insert kx x = kx `seq` go
//   where
//     go Tip = singleton kx x
//     go (Bin sz ky y l r) =
//         case compare kx ky of
//             LT -> balance ky y (go l) r
//             GT -> balance ky y l (go r)
//             EQ -> Bin sz kx x l r
export const insert = <K, V>(key: K, val: V, node: Node<K, V>): Node<K, V> => {
  if (node === undefined) return createRoot(key, val);
  switch (omniCompare(key, node.k)) {
    case LT:
      return balance(node.k, node.v, insert(key, val, node.left), node.right);
    case GT:
      return balance(node.k, node.v, node.right, insert(key, val, node.right));
    case EQ:
      return { k: key, left: node.left, right: node.right, size: node.size, v: val };
    default:
      throw new Error('non-exhaustive switch');
  }
};

// {--------------------------------------------------------------------
//   Deletion
//   [delete] is the inlined version of [deleteWith (\k x -> Nothing)]
// --------------------------------------------------------------------}
// -- | /O(log n)/. Delete a key and its value from the map. When the key is not
// -- a member of the map, the original map is returned.
// --
// -- > delete 5 (fromList [(5,"a"), (3,"b")]) == singleton 3 "b"
// -- > delete 7 (fromList [(5,"a"), (3,"b")]) == fromList [(3, "b"), (5, "a")]
// -- > delete 5 empty                         == empty

// delete :: Ord k => k -> Map k a -> Map k a
// delete k = k `seq` go
//   where
//     go Tip = Tip
//     go (Bin _ kx x l r) =
//         case compare k kx of
//             LT -> balance kx x (go l) r
//             GT -> balance kx x l (go r)
//             EQ -> glue l r
export const remove = <K, V>(key: K, node: Node<K, V>): Node<K, V> => {
  if (node === undefined) return undefined;
  switch (omniCompare(key, node.k)) {
    case LT:
      return balance(node.k, node.v, remove(key, node.left), node.right);
    case GT:
      return balance(node.k, node.v, node.left, remove(key, node.right));
    case EQ:
      return glue(node.left, node.right);
    default:
      throw new Error('non-exhaustive switch');
  }
};

// lookup :: Ord k => k -> Map k a -> Maybe a
// lookup k = k `seq` go
//   where
//     go Tip = Nothing
//     go (Bin _ kx x l r) =
//         case compare k kx of
//             LT -> go l
//             GT -> go r
//             EQ -> Just x
export const lookup = <K, V>(key: K, node: Node<K, V>): KeyValuePair<K, V> | undefined => {
  if (node === undefined) return undefined;
  switch (omniCompare(key, node.k)) {
    case LT:
      return lookup(key, node.left);
    case GT:
      return lookup(key, node.right);
    case EQ:
      return [node.k, node.v];
    default:
      throw new Error('non-exhaustive switch');
  }
};

export const traverse = function* <K, V>(node: Node<K, V>): Generator<KeyValuePair<K, V>> {
  if (node !== undefined) {
    yield* traverse(node.left);
    yield [node.k, node.v];
    yield* traverse(node.right);
  }
};
