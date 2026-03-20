declare module "write-file-atomic" {
  interface Options {
    chown?: { uid: number; gid: number };
    encoding?: string;
    fsync?: boolean;
    mode?: number;
    tmpfileCreated?: (tmpfile: string) => void;
  }
  function writeFileAtomic(filename: string, data: string | Buffer, options?: Options): Promise<void>;
  namespace writeFileAtomic {
    function sync(filename: string, data: string | Buffer, options?: Options): void;
  }
  export = writeFileAtomic;
}
