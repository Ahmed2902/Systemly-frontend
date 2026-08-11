"use client";

import NextImage, {
  type ImageLoaderProps,
  type ImageProps,
} from "next/image";

const passthroughLoader = ({ src }: ImageLoaderProps) => src;

/**
 * Next Image with a passthrough loader for dynamic uploads, object URLs, and
 * external media URLs that are not known at build time.
 */
export function Image(props: ImageProps) {
  return <NextImage {...props} loader={passthroughLoader} unoptimized />;
}
