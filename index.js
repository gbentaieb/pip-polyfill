if (
  !document.pictureInPictureEnabled &&
  HTMLVideoElement.prototype.webkitSupportsPresentationMode &&
  typeof HTMLVideoElement.prototype.webkitSetPresentationMode === "function"
) {
  HTMLVideoElement.prototype.requestPictureInPicture = async function() {
    this.webkitSetPresentationMode('picture-in-picture');
    document.pictureInPictureElement = this;
  }

  document.exitPictureInPicture = async function() {
    if (document.pictureInPictureElement) {
      document.pictureInPictureElement.webkitSetPresentationMode('inline');
      delete document.pictureInPictureElement;
    }
  }
}
