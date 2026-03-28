export function handleAssetImageError(event, hardFallbackUrl) {
  const imageElement = event.currentTarget;
  const currentSource = imageElement.getAttribute("src") || "";

  if (!imageElement.dataset.triedAltExtension) {
    if (currentSource.includes(".png")) {
      imageElement.dataset.triedAltExtension = "true";
      imageElement.src = currentSource.replace(".png", ".jpg");
      return;
    }

    if (currentSource.includes(".jpg")) {
      imageElement.dataset.triedAltExtension = "true";
      imageElement.src = currentSource.replace(".jpg", ".png");
      return;
    }
  }

  imageElement.src = hardFallbackUrl;
}
