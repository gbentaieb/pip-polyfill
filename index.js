if (!HTMLVideoElement.prototype.requestPictureInPicture) {
  if (
    HTMLVideoElement.prototype.webkitSupportsPresentationMode &&
    typeof HTMLVideoElement.prototype.webkitSetPresentationMode === "function"
  ) {
    HTMLVideoElement.prototype.requestPictureInPicture = async function() {
      // check if PIP is enabled
      if (
        this.attributes.disablePictureInPicture ||
        !this.webkitSupportsPresentationMode("picture-in-picture")
      ) {
        throw new Error("PIP not allowed by videoElement", "InvalidStateError");
      }

      // enter PIP mode
      this.webkitSetPresentationMode("picture-in-picture");

      // polyfill pictureInPictureElement
      document.pictureInPictureElement = this;
    };

    document.exitPictureInPicture = async function() {
      if (document.pictureInPictureElement) {
        // exit PIP mode
        document.pictureInPictureElement.webkitSetPresentationMode("inline");

        // clear pictureInPictureElement
        delete document.pictureInPictureElement;
      } else {
        throw new DOMException(
          "No picture in picture element found",
          "InvalidStateError"
        );
      }
    };

    // polyfill events
    const oldAddEventListener = HTMLVideoElement.prototype.addEventListener;
    HTMLVideoElement.prototype.addEventListener = function(name, callback) {
      if (name === "enterpictureinpicture") {
        this.addEventListener(
          "webkitpresentationmodechanged",
          function listener() {
            if (this.webkitPresentationMode === "picture-in-picture") {
              if (this.$pipPolyfillEnter) {
                this.$pipPolyfillEnter[callback] = listener;
              } else {
                this.$pipPolyfillEnter = {
                  [callback]: listener
                };
              }
              callback();
            }
          }
        );
      } else if (name === "leavepictureinpicture") {
        this.addEventListener(
          "webkitpresentationmodechanged",
          function listener() {
            if (this.webkitPresentationMode !== "picture-in-picture") {
              if (this.$pipPolyfillLeave) {
                this.$pipPolyfillLeave[callback] = listener;
              } else {
                this.$pipPolyfillLeave = {
                  [callback]: listener
                };
              }
              callback();
            }
          }
        );
      } else {
        oldAddEventListener.apply(this, arguments);
      }
    };

    const oldRemoveEventListener = HTMLVideoElement.prototype.removeEventListener;
    HTMLVideoElement.prototype.removeEventListener = function(name, callback) {
      if (name === "enterpictureinpicture") {
        this.removeEventListener(
          "webkitpresentationmodechanged",
          this.$pipPolyfillEnter[callback]
        );
        delete this.$pipPolyfillEnter[callback];
      } else if (name === "leavepictureinpicture") {
        this.removeEventListener(
          "webkitpresentationmodechanged",
          this.$pipPolyfillLeave[callback]
        );
        delete this.$pipPolyfillLeave[callback];
      } else {
        oldRemoveEventListener.apply(this, arguments);
      }
    };
  } else {
    HTMLVideoElement.prototype.requestPictureInPicture = async function() {
      throw new DOMException("PIP not supported", "NotSupportedError");
    };
  }
}
