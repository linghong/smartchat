
export type OptionType = {
  value: string;
  label: string;
}

export type ApiResponse = {
  message: string;
  fileName: string;
  error?: string;
}

export type InputErrors = {
  [key: string]: string | null;
}
export type Input<T> = {
  [key: string]: T;
}

export type InputData = {
  [key: string]: string | number | null;
}