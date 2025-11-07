import { MIN_NODE_VERSION } from "./constants.js";

export interface NodeCompatibility {
  compatible: boolean;
  currentVersion: string;
  minVersion: string;
}

export function checkNodeVersion(): NodeCompatibility {
  const currentVersion = process.version.slice(1);
  const [currentMajor] = currentVersion.split(".").map(Number);
  const [minMajor] = MIN_NODE_VERSION.split(".").map(Number);

  return {
    compatible: currentMajor >= minMajor,
    currentVersion,
    minVersion: MIN_NODE_VERSION,
  };
}

