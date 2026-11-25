import { describe, it, expect, vi, afterEach } from "vitest";
import { isImage, readableSize, getExtensionColor, getExtensionLabel, absoluteUrl, downloadFile } from "./assets";

describe("assets utilities", () => {
  describe("isImage", () => {
    it("returns true for common image extensions", () => {
      expect(isImage("photo.png")).toBe(true);
      expect(isImage("photo.jpg")).toBe(true);
      expect(isImage("photo.jpeg")).toBe(true);
      expect(isImage("photo.svg")).toBe(true);
      expect(isImage("photo.gif")).toBe(true);
    });

    it("is case-insensitive for extensions", () => {
      expect(isImage("photo.PNG")).toBe(true);
      expect(isImage("photo.JPG")).toBe(true);
      expect(isImage("photo.Svg")).toBe(true);
    });

    it("returns false for non-image extensions", () => {
      expect(isImage("document.pdf")).toBe(false);
      expect(isImage("file.txt")).toBe(false);
      expect(isImage("video.mp4")).toBe(false);
      expect(isImage("archive.zip")).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isImage(undefined)).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isImage("")).toBe(false);
    });

    it("returns false for filename without extension", () => {
      expect(isImage("noextension")).toBe(false);
    });
  });

  describe("getExtensionColor", () => {
    it("returns correct color for known extensions", () => {
      expect(getExtensionColor("report.pdf")).toBe("#e74c3c");
      expect(getExtensionColor("doc.docx")).toBe("#2b579a");
      expect(getExtensionColor("sheet.xlsx")).toBe("#217346");
      expect(getExtensionColor("slides.pptx")).toBe("#d35230");
      expect(getExtensionColor("data.csv")).toBe("#16a085");
      expect(getExtensionColor("archive.zip")).toBe("#f39c12");
      expect(getExtensionColor("song.mp3")).toBe("#e67e22");
      expect(getExtensionColor("video.mp4")).toBe("#8e44ad");
    });

    it("returns fallback for unknown extension", () => {
      expect(getExtensionColor("file.xyz")).toBe("var(--neutrals-400)");
      expect(getExtensionColor("file.txt")).toBe("var(--neutrals-400)");
    });

    it("returns fallback for undefined", () => {
      expect(getExtensionColor(undefined)).toBe("var(--neutrals-400)");
    });
  });

  describe("getExtensionLabel", () => {
    it("returns uppercase extension", () => {
      expect(getExtensionLabel("report.pdf")).toBe("PDF");
      expect(getExtensionLabel("doc.docx")).toBe("DOCX");
      expect(getExtensionLabel("sheet.xlsx")).toBe("XLSX");
    });

    it("returns FILE for undefined", () => {
      expect(getExtensionLabel(undefined)).toBe("FILE");
    });

    it("returns FILE for file without extension", () => {
      expect(getExtensionLabel("noext")).toBe("NOEXT");
    });
  });

  describe("readableSize", () => {
    it("returns '0 Bytes' for 0", () => {
      expect(readableSize(0)).toBe("0 Bytes");
    });

    it("returns '0 Bytes' for undefined", () => {
      expect(readableSize(undefined)).toBe("0 Bytes");
    });

    it("formats bytes correctly", () => {
      expect(readableSize(500)).toBe("500 Bytes");
      expect(readableSize(1)).toBe("1 Bytes");
    });

    it("formats kilobytes correctly", () => {
      expect(readableSize(1024)).toBe("1 KB");
      expect(readableSize(1536)).toBe("1.5 KB");
    });

    it("formats megabytes correctly", () => {
      expect(readableSize(1048576)).toBe("1 MB");
      expect(readableSize(1572864)).toBe("1.5 MB");
    });

    it("formats gigabytes correctly", () => {
      expect(readableSize(1073741824)).toBe("1 GB");
    });

    it("respects decimal precision", () => {
      expect(readableSize(1536, 0)).toBe("2 KB");
      expect(readableSize(1536, 1)).toBe("1.5 KB");
      expect(readableSize(1536, 3)).toBe("1.5 KB");
    });

    it("treats negative decimals as 0", () => {
      expect(readableSize(1536, -1)).toBe("2 KB");
    });
  });

  describe("absoluteUrl", () => {
    it("resolves a relative url against the origin", () => {
      expect(absoluteUrl("/assets/a.png")).toBe(window.location.origin + "/assets/a.png");
    });

    it("keeps an absolute url", () => {
      expect(absoluteUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
    });
  });

  describe("downloadFile", () => {
    afterEach(() => vi.restoreAllMocks());

    it("clicks a temporary link with download and a new tab", () => {
      let attached = false;
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        attached = document.body.contains(this);
      });

      downloadFile({ url: "https://cdn.example.com/a.png", name: "a.png" });

      const anchor = click.mock.contexts[0] as HTMLAnchorElement;
      expect(attached).toBe(true);
      expect(anchor.href).toBe("https://cdn.example.com/a.png");
      expect(anchor.download).toBe("a.png");
      expect(anchor.target).toBe("_blank");
      expect(anchor.rel).toBe("noopener");
      expect(document.body.contains(anchor)).toBe(false);
    });

    it("ignores a url that would run script instead of downloading", () => {
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      const open = vi.spyOn(window, "open").mockImplementation(() => null);

      downloadFile({ url: "javascript:alert(1)", name: "a.png" });
      downloadFile({ url: " JavaScript:alert(1)" });

      expect(click).not.toHaveBeenCalled();
      expect(open).not.toHaveBeenCalled();
    });

    it("downloads a relative platform path", () => {
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      downloadFile({ url: "/assets/a.png" });
      expect((click.mock.contexts[0] as HTMLAnchorElement).href).toBe(`${window.location.origin}/assets/a.png`);
    });
  });
});
