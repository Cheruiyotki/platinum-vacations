export function handleAssetImageError(event, hardFallbackUrl) {
  const imageElement = event.currentTarget;
  const currentSource = imageElement.getAttribute("src") || "";
  const triedSources = (imageElement.dataset.triedSources || "")
    .split("|")
    .filter(Boolean);
  const nextSources = [];

  if (currentSource.includes(".png")) {
    nextSources.push(currentSource.replace(".png", ".jpg"));
    nextSources.push(currentSource.replace(".png", ".webp"));
  }

  if (currentSource.includes(".jpg")) {
    nextSources.push(currentSource.replace(".jpg", ".png"));
    nextSources.push(currentSource.replace(".jpg", ".webp"));
  }

  if (currentSource.includes(".webp")) {
    nextSources.push(currentSource.replace(".webp", ".jpg"));
    nextSources.push(currentSource.replace(".webp", ".png"));
  }

  const nextCandidate = nextSources.find((source) => !triedSources.includes(source));

  if (nextCandidate) {
    imageElement.dataset.triedSources = [...triedSources, nextCandidate].join("|");
    imageElement.src = nextCandidate;
    return;
  }

  if (currentSource !== hardFallbackUrl) {
    imageElement.src = hardFallbackUrl;
  }
}
