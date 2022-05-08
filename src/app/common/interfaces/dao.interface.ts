export interface DaoInterface {
  has: (key: string) => boolean;
  get: (key: string) => object;
  set: (key: string, value: object) => void;
  delete: (key: string) => boolean;
}
