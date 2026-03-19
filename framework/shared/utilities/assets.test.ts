import { describe, it, expect } from "vitest";
import { isImage, getFileThumbnail, readableSize } from "./assets";

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

  describe("getFileThumbnail", () => {
    it("returns correct icon for PDF", () => {
      expect(getFileThumbnail("report.pdf")).toBe("bi-filetype-pdf");
    });

    it("returns correct icon for Word documents", () => {
      expect(getFileThumbnail("doc.doc")).toBe("bi-filetype-doc");
      expect(getFileThumbnail("doc.docx")).toBe("bi-filetype-doc");
    });

    it("returns correct icon for Excel files", () => {
      expect(getFileThumbnail("sheet.xls")).toBe("bi-filetype-xls");
      expect(getFileThumbnail("sheet.xlsx")).toBe("bi-filetype-xls");
    });

    it("returns correct icon for PowerPoint files", () => {
      expect(getFileThumbnail("slides.ppt")).toBe("bi-filetype-ppt");
      expect(getFileThumbnail("slides.pptx")).toBe("bi-filetype-ppt");
    });

    it("returns correct icon for CSV files", () => {
      expect(getFileThumbnail("data.csv")).toBe("bi-filetype-csv");
    });

    it("returns correct icon for ZIP files", () => {
      expect(getFileThumbnail("archive.zip")).toBe("bi-file-zip");
    });

    it("returns correct icon for audio files", () => {
      expect(getFileThumbnail("song.mp3")).toBe("bi-file-music");
      expect(getFileThumbnail("song.aac")).toBe("bi-file-music");
    });

    it("returns correct icon for video files", () => {
      expect(getFileThumbnail("video.mp4")).toBe("bi-file-play");
      expect(getFileThumbnail("video.avi")).toBe("bi-file-play");
    });

    it("returns default icon for unknown extension", () => {
      expect(getFileThumbnail("file.xyz")).toBe("bi-file-earmark");
      expect(getFileThumbnail("file.txt")).toBe("bi-file-earmark");
    });

    it("returns default icon for undefined", () => {
      expect(getFileThumbnail(undefined)).toBe("bi-file-earmark");
    });

    it("returns default icon for file without extension", () => {
      expect(getFileThumbnail("noext")).toBe("bi-file-earmark");
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
});
