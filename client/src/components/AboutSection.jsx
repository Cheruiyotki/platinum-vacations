function AboutSection() {
  return (
    <section id="about" className="bg-section-glow">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-heading text-3xl font-extrabold text-secondary md:text-4xl">
          {"Welcome to Platinum Vacations \u{1F3D6}\uFE0F"}
        </h2>
        <div className="mt-7 space-y-5 text-base leading-8 text-secondary/85 md:text-lg">
          <p>We specialize in organizing unforgettable tours and trips across Kenya.</p>
          <p>
            Whether you're looking to explore breathtaking landscapes, enjoy wildlife safaris, or
            immerse yourself in the vibrant cultures of Kenya, Platinum Vacations ensures every
            journey is thoughtfully planned and memorable.
          </p>
          <p>
            Join us for expertly guided trips that offer adventure, discovery, and lifelong
            memories.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
