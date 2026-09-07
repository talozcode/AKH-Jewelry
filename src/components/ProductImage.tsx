import { wixImg } from "@/lib/wixImage";

export function ProductImage({
  idExt,
  alt,
  className = "",
  w = 900,
  h = 1125,
}: {
  idExt: string;
  alt: string;
  className?: string;
  w?: number;
  h?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={wixImg(idExt, w, h)}
      alt={alt}
      width={w}
      height={h}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
