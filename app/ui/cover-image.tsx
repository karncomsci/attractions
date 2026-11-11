export function CoverImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // Plain <img>, not next/image: cover URLs are user-supplied and can point at
    // any host, and next/image only serves hosts allow-listed in next.config.ts.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={`bg-zinc-200 object-cover dark:bg-zinc-800 ${className}`}
    />
  );
}
