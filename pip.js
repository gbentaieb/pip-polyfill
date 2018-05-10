if (!HTMLVideoElement.prototype.requestPictureInPicture) {
  if (
    HTMLVideoElement.prototype.webkitSupportsPresentationMode &&
    typeof HTMLVideoElement.prototype.webkitSetPresentationMode === "function"
  ) {
    // polyfill document.pictureInPictureElement
    const updatePictureInPictureElementInDocument = function() {
      if (this.webkitPresentationMode && this.webkitPresentationMode !== "picture-in-picture") {
        document.pictureInPictureElement = null;
      }
    }

    Object.defineProperty(document, 'pictureInPictureElement', {
      get: function() {
        if (!this.$pictureInPictureElement) {
          document.querySelectorAll('video').forEach(video => {
            if (video.webkitPresentationMode && video.webkitPresentationMode === "picture-in-picture") {
              this.pictureInPictureElement = video;
              return true;
            }
          })
        }

        return this.$pictureInPictureElement || null;
      },

      set: function(value) {
        if (this.$pictureInPictureElement) {
          this.$pictureInPictureElement.removeEventListener(
            'webkitpresentationmodechanged',
            updatePictureInPictureElementInDocument
          )
        }

        this.$pictureInPictureElement = value;

        if (value) {
          this.$pictureInPictureElement.addEventListener(
            'webkitpresentationmodechanged',
            updatePictureInPictureElementInDocument
          )
        }
      }
    });

    // polyfill methods and attributes

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
    };

    document.exitPictureInPicture = async function() {
      if (document.pictureInPictureElement) {
        // exit PIP mode
        document.pictureInPictureElement.webkitSetPresentationMode("inline");
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
        function webkitListener() {
          if (this.webkitPresentationMode === "picture-in-picture") {
            callback();
          }
        }

        this.addEventListener("webkitpresentationmodechanged", webkitListener);

        // keep track of the listener to be able to remove them later
        if (this.$pipPolyfillEnter) {
          this.$pipPolyfillEnter[callback] = webkitListener;
        } else {
          this.$pipPolyfillEnter = {
            [callback]: webkitListener
          };
        }
      } else if (name === "leavepictureinpicture") {
        function webkitListener() {
          if (this.webkitPresentationMode !== "picture-in-picture") {
            if (document.pictureInPictureElement === this) callback()
          } else {
            // keep track of the pipElement
            document.pictureInPictureElement = this;
          }
        }

        this.addEventListener("webkitpresentationmodechanged", webkitListener);

        if (this.webkitPresentationMode === "picture-in-picture") {
          // As we use document.pictureInPictureElement in the listener
          // we need update pictureInPictureElement if necessary
          document.pictureInPictureElement = this;
        }

        // keep track of the listener to be able to remove them later
        if (this.$pipPolyfillLeave) {
          this.$pipPolyfillLeave[callback] = webkitListener;
        } else {
          this.$pipPolyfillLeave = {
            [callback]: webkitListener
          };
        }
      } else {
        // fallback for all the other events
        oldAddEventListener.apply(this, arguments);
      }
    };

    const oldRemoveEventListener = HTMLVideoElement.prototype.removeEventListener;
    HTMLVideoElement.prototype.removeEventListener = function(name, callback) {
      if (name === "enterpictureinpicture" && this.$pipPolyfillEnter) {
        this.removeEventListener(
          "webkitpresentationmodechanged",
          this.$pipPolyfillEnter[callback]
        );
        delete this.$pipPolyfillEnter[callback];
      } else if (name === "leavepictureinpicture" && this.$pipPolyfillLeave) {
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
