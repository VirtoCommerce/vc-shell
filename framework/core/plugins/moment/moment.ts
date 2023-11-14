import { Duration, default as moment, argAccuracy } from "moment";
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
    return humanize.apply(this as Duration & number, args as [withSuffix?: boolean | undefined]);
  }

  return humanizeOriginal.apply(this, args as [argAccuracy?: argAccuracy | undefined]);
};

export default moment;
