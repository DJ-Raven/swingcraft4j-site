/// <reference types="astro/client" />

declare global {
  interface Window {
    openSearchOverlay: () => void;
    thumbnailFallbackSrc: () => string;
    applyThumbnailFallback: (img: HTMLImageElement) => void;
  }
}

export {};
