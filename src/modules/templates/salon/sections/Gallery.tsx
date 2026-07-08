// src/modules/templates/salon/sections/Gallery.tsx

export function Gallery({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  const [featured, ...rest] = photos;

  return (
    <section id="gallery" className="px-8 py-20 md:px-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.2em]"
        style={{ color: "var(--accent)" }}
      >
        Gallery
      </p>
      <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
        A Glimpse Inside
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2">
        {/* Featured large image */}
        <div className="group relative overflow-hidden rounded-sm md:col-span-2 md:row-span-2">
          <img
            src={featured}
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 md:aspect-auto md:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Supporting images */}
        {rest.slice(0, 4).map((url, i) => (
          <div
            key={`${i}-${url}`}
            className="group relative overflow-hidden rounded-sm"
          >
            <img
              src={url}
              className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}

        {/* "+N more" overlay on the last visible tile if there's overflow */}
        {rest.length > 4 && (
          <div className="relative overflow-hidden rounded-sm">
            <img src={rest[4]} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="font-display text-xl text-white">
                +{rest.length - 4}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
