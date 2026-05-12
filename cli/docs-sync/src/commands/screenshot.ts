import path from "node:path";
import { captureScreenshot } from "../screenshot/capture.js";

export interface ScreenshotArgs {
  url?: string;
  story?: string;
  selector?: string;
  theme?: "light" | "dark";
  viewport?: string; // "1280x800"
  out: string;
}

export async function runScreenshotCommand(args: ScreenshotArgs): Promise<{ exitCode: number }> {
  let viewportWidth: number | undefined;
  let viewportHeight: number | undefined;
  if (args.viewport) {
    const [w, h] = args.viewport.split("x").map((n) => parseInt(n, 10));
    if (Number.isFinite(w) && Number.isFinite(h)) {
      viewportWidth = w;
      viewportHeight = h;
    }
  }
  await captureScreenshot({
    url: args.url,
    story: args.story,
    selector: args.selector,
    theme: args.theme,
    viewportWidth,
    viewportHeight,
    out: path.resolve(args.out),
  });
  return { exitCode: 0 };
}
