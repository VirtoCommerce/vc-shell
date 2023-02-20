import { default as moment } from "moment";
import { humanize } from "./humanize";

declare module "moment" {
  export type argAccuracy = "auto" | "precise";

  interface Duration {
    humanize(argWithSuffix?: boolean, argAccuracy?: argAccuracy): string;

    humanize(argAccuracy?: argAccuracy): string;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace duration {
    // eslint-disable-next-line no-var
    export var fn: moment.Duration;
  }
}

const humanizeOriginal = moment.duration.fn.humanize;
moment.duration.fn.humanize = function (...args: unknown[]): string {
  if (args.includes("precise")) {
    return humanize.apply(this, args);
  }

  return humanizeOriginal.apply(this, args);
};

export default moment;
