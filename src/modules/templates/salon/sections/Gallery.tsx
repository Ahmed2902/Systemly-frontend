// src/modules/templates/salon/sections/Gallery.tsx

import Image from "next/image";

export function Gallery({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  return (
    <section id="gallery" className="px-8 py-24 md:px-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.2em]"
        style={{ color: "var(--accent)" }}
      >
        Gallery
      </p>

      <h2 className="font-display mt-2 text-4xl text-[#2B2420] md:text-5xl">
        A Glimpse Inside
      </h2>

      <div
        className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4"
        style={{ gridAutoRows: "220px" }}
      >
        {photos.map((url, index) => (
          <div
            key={`${index}-${url}`}
            className="group relative overflow-hidden rounded-xl"
          >
            <Image
              src={url}
              alt={`Gallery image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
