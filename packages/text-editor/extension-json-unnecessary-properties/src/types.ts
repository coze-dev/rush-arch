type JSONPath = string | number;
export type JSONPropertyChecker = (e: { paths: JSONPath[] }) => boolean;
