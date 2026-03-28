import { handleAssetImageError } from "../utils/imageFallback";

const mockPosts = [
  "/assets/image_1.png",
  "/assets/image_3.png",
  "/assets/image_0.png",
  "/assets/image_1.png",
  "/assets/image_3.png",
  "/assets/image_1.png",
  "/assets/image_3.png",
  "/assets/image_0.png",
  "/assets/image_1.png"
];

function InstagramFeedSection() {
  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-extrabold text-white md:text-4xl">Instagram</h2>
        <p className="mt-3 text-base text-white/80">
          Follow us @platinum___vacations for the vibes
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-5">
          {mockPosts.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src={src}
                alt={`Platinum Vacations post ${index + 1}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                onError={(event) =>
                  handleAssetImageError(
                    event,
                    "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=800&q=80"
                  )
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstagramFeedSection;
