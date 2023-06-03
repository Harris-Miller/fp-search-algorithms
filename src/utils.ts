export const isNil = (value: any): value is null | undefined => value == null;
export const fst = <A, B>(tuple: [A, B]): A => tuple[0];
export const snd = <A, B>(tuple: [A, B]): B => tuple[1];
export const head = <T>(list: T[]): T | undefined => list[0];
export const last = <T>(list: T[]): T | undefined => list[list.length - 1];
