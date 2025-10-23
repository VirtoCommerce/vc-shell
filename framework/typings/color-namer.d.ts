declare module 'color-namer' {
  interface ColorResult {
    name: string;
    hex: string;
  }

  interface ColorNamerResult {
    basic: ColorResult[];
    html: ColorResult[];
    ntc: ColorResult[];
  }

  function namer(color: string): ColorNamerResult;
  export = namer;
}
