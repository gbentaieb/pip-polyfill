if (
  !HTMLVideoElement.prototype.requestPictureInPicture ||
  !document.exitPictureInPicture
) {
  if (
    HTMLVideoElement.prototype.webkitSupportsPresentationMode &&
    typeof HTMLVideoElement.prototype.webkitSetPresentationMode === 'function'
  ) {
    /**
     * polyfill document.pictureInPictureElement
     */

    // eslint-disable-next-line no-inner-declarations
    function updatePictureInPictureElementInDocument() {
      if (this.webkitPresentationMode && this.webkitPresentationMode !== 'picture-in-picture') {
        document.pictureInPictureElement = null;
      }
    }

    Object.defineProperty(document, 'pictureInPictureElement', {
      get() {
        if (!this.$pictureInPictureElement) {
          const videoElementList = document.querySelectorAll('video');

          for (let i = 0; i < videoElementList.length; i += 1) {
            const video = videoElementList[i];

            if (video.webkitPresentationMode && video.webkitPresentationMode === 'picture-in-picture') {
              this.pictureInPictureElement = video;
              break;
            }
          }
        }

        return this.$pictureInPictureElement || null;
      },

      set(value) {
        if (value === this.$pictureInPictureElement) return;

        if (this.$pictureInPictureElement) {
          this.$pictureInPictureElement.removeEventListener(
            'webkitpresentationmodechanged',
            updatePictureInPictureElementInDocument,
          );
        }

        this.$pictureInPictureElement = value;
        if (this.$pictureInPictureElement) {
          this.$pictureInPictureElement.addEventListener(
            'webkitpresentationmodechanged',
            updatePictureInPictureElementInDocument,
          );
        }
      },
    });

    /**
     * polyfill methods and attributes
     */

    HTMLVideoElement.prototype.requestPictureInPicture = async function _() {
      // check if PIP is enabled
      if (
        this.attributes.disablePictureInPicture ||
        !this.webkitSupportsPresentationMode('picture-in-picture')
      ) {
        throw new Error('PIP not allowed by videoElement', 'InvalidStateError');
      }

      // enter PIP mode
      this.webkitSetPresentationMode('picture-in-picture');
      document.pictureInPictureElement = this;
    };

    document.exitPictureInPicture = async function _() {
      if (document.pictureInPictureElement) {
        // exit PIP mode
        document.pictureInPictureElement.webkitSetPresentationMode('inline');
        document.pictureInPictureElement = null;
      } else {
        throw new DOMException(
          'No picture in picture element found',
          'InvalidStateError',
        );
      }
    };

    /**
     * polyfill events
     */

    const oldAddEventListener = HTMLVideoElement.prototype.addEventListener;
    HTMLVideoElement.prototype.addEventListener = function _(...args) {
      const [name, callback] = args;

      if (name === 'enterpictureinpicture') {
        // eslint-disable-next-line no-inner-declarations
        function webkitListener() {
          if (this.webkitPresentationMode === 'picture-in-picture') {
            callback();
          }
        }

        this.addEventListener('webkitpresentationmodechanged', webkitListener);

        // keep track of the listener to be able to remove them later
        if (this.$pipPolyfillEnter) {
          this.$pipPolyfillEnter[callback] = webkitListener;
        } else {
          this.$pipPolyfillEnter = {
            [callback]: webkitListener,
          };
        }
      } else if (name === 'leavepictureinpicture') {
        // eslint-disable-next-line no-inner-declarations
        function webkitListener() {
          if (this.webkitPresentationMode === 'inline') {
            if (this.$pipPreviousPresentationMode === 'picture-in-picture') callback();
          } else {
            // keep track of the pipElement
            document.pictureInPictureElement = this;
          }
          this.$pipPreviousPresentationMode = this.webkitPresentationMode;
        }

        this.addEventListener('webkitpresentationmodechanged', webkitListener);
        this.$pipPreviousPresentationMode = this.webkitPresentationMode;

        // keep track of the listener to be able to remove them later
        if (this.$pipPolyfillLeave) {
          this.$pipPolyfillLeave[callback] = webkitListener;
        } else {
          this.$pipPolyfillLeave = {
            [callback]: webkitListener,
          };
        }
      } else {
        // fallback for all the other events
        oldAddEventListener.apply(this, args);
      }
    };

    const oldRemoveEventListener = HTMLVideoElement.prototype.removeEventListener;
    HTMLVideoElement.prototype.removeEventListener = function _(...args) {
      const [name, callback] = args;

      if (name === 'enterpictureinpicture' && this.$pipPolyfillEnter) {
        this.removeEventListener(
          'webkitpresentationmodechanged',
          this.$pipPolyfillEnter[callback],
        );
        delete this.$pipPolyfillEnter[callback];
      } else if (name === 'leavepictureinpicture' && this.$pipPolyfillLeave) {
        this.removeEventListener(
          'webkitpresentationmodechanged',
          this.$pipPolyfillLeave[callback],
        );
        delete this.$pipPolyfillLeave[callback];
      } else {
        oldRemoveEventListener.apply(this, args);
      }
    };

    /**
     * Complete PIP Api
     */
    document.pictureInPictureEnabled = true;
  } else {
    HTMLVideoElement.prototype.requestPictureInPicture = async function _() {
      throw new DOMException('PIP not supported', 'NotSupportedError');
    };
  }
}
