import { ActionCustomData, FullFunction, FullObject } from "../types";
import { ASCII_CHARS, WHITE_SPACES } from "../configs/constants";

export const randomize = (
  value: number,
  [max, min]: [number, number],
): number => +((Math.random() * (max - min) + min) * value).toFixed(2);

export const tryCatch = async <R = unknown, E = Error>(
  callback: FullFunction<R>,
): Promise<[R, undefined] | [undefined, E]> => {
  try {
    const response: void | R = await callback();

    return [response as R, undefined];
  } catch (error) {
    return [undefined, error as E];
  }
};

export const getPercentage = (numberA: number, numberB: number): number =>
  +(100 - (numberA / numberB) * 100).toFixed(2);

export const stringifyWithKeys = <T extends FullObject = FullObject>(
  item: T,
): string =>
  Object.entries(item)
    .flatMap(([key, value]) =>
      value ? `[${key.toLocaleUpperCase()}] ${value as string}` : [],
    )
    .join("; ");

export const cleanUpIfText = <T>(text: T) =>
  typeof text === "string"
    ? text.replace(ASCII_CHARS, "").replace(WHITE_SPACES, " ").trim()
    : text;

export const actionNameToOptions = (
  nameOrOptions: string | ActionCustomData,
): ActionCustomData => {
  if (typeof nameOrOptions === "string") return { name: nameOrOptions };
  return nameOrOptions;
};
