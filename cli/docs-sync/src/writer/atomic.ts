import writeFileAtomic from "write-file-atomic";

export function writeAtomic(filePath: string, content: string): Promise<void> {
  return new Promise((resolve, reject) => {
    writeFileAtomic(filePath, content, "utf8", (err) => (err ? reject(err) : resolve()));
  });
}
