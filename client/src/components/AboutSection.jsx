function getAboutParagraphs(aboutText) {
  return String(aboutText || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function AboutSection({ aboutText = "" }) {
  const paragraphs = getAboutParagraphs(aboutText);

  return (
    <section id="about" className="bg-section-glow">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <h2 className="font-heading text-3xl font-extrabold text-secondary md:text-4xl">
          {"Welcome to Platinum Vacations \u{1F3D6}\uFE0F"}
        </h2>
        <div className="mt-7 space-y-5 text-base leading-8 text-secondary/85 md:text-lg">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
