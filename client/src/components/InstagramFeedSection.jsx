import { useEffect, useState } from "react";
import { fetchVisibleGalleryItems } from "../api/site";
import { handleAssetImageError } from "../utils/imageFallback";

const fallbackGalleryItems = [
  {
    src: "/assets/image_1.png",
    location: "Mombasa"
  },
  {
    src: "/assets/image_3.png",
    location: "Naivasha"
  },
  {
    src: "/assets/image_0.png",
    location: "Maasai Mara"
  },
  {
    src: "/assets/image_2.jpg",
    location: "Mount Kenya"
  },
  {
    src: "/assets/image_4.jpg",
    location: "Mt. Satima"
  },
  {
    src: "/assets/image_5.jpg",
    location: "Maasai Mara"
  }
];

function InstagramFeedSection() {
  const [galleryItems, setGalleryItems] = useState(fallbackGalleryItems);

  useEffect(() => {
    let isMounted = true;

    fetchVisibleGalleryItems()
      .then((items) => {
        if (isMounted && items.length) {
          setGalleryItems(items);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-extrabold text-white md:text-4xl">Gallery</h2>
        <p className="mt-3 text-base text-white/80">
          A quick look at some of the places our adventures can take you.
        </p>

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
          {galleryItems.map(({ src, location }, index) => (
            <div
              key={`${src}-${location}-${index}`}
              className="group relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src={src}
                alt={`${location} travel gallery`}
                className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-105"
                onError={(event) =>
                  handleAssetImageError(
                    event,
                    "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=800&q=80"
                  )
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent opacity-90 transition group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-secondary/70 px-3 py-2 backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/65">
                  Location
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstagramFeedSection;
