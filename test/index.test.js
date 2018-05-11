const videoElement = document.getElementById('videoElement')

describe('test', function () {
  afterEach(async () => {
    videoElement.removeAttribute('disablePictureInPicture');

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      document.pictureInPictureElement = undefined;
    }
  })

  describe('API is Available', () => {
    it('should have requestPictureInPicture in videoElement', () => {
      chai.expect(HTMLVideoElement.prototype.requestPictureInPicture).to.not.be.undefined;
    });
  
    it('should have exitPictureInPicture in document', () => {
      chai.expect(document.exitPictureInPicture).to.not.be.undefined;
    });
  });

  describe('Document.pictureInpictureElement API', () => {
    it('should not have any PIP video at start', () => {
      chai.expect(!!document.pictureInPictureElement).to.be.false;
    })

    it('should set document.pictureInPictureElement correctly using standard API', async () => {
      await videoElement.requestPictureInPicture();
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    })

    it('should set document.pictureInPictureElement correctly using native API', () => {
      videoElement.webkitSetPresentationMode('picture-in-picture');
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    })

    it('should clear document.pictureInPictureElement correctly using standard API', async () => {
      await videoElement.requestPictureInPicture();
      await document.exitPictureInPicture();
      chai.expect(!!document.pictureInPictureElement).to.be.false;
    })

    it('should clear document.pictureInPictureElement correctly using native API', () => {
      videoElement.webkitSetPresentationMode('picture-in-picture');
      videoElement.webkitSetPresentationMode('inline');
      chai.expect(!!document.pictureInPictureElement).to.be.false;
    })
  });

  describe('requestPictureInPicture API', () => {
    it('should trigger PIP when requestPictureInPicture called', async () => {
      await videoElement.requestPictureInPicture();
      chai.expect(!!document.pictureInPictureElement).to.be.true;
    })

    it('should throw an error if disablePictureInPicture', async () => {
      let error;

      try {
        video.setAttribute('disablePictureInPicture', true);
        await videoElement.requestPictureInPicture();
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.not.be.undefined;
    })

    it('should set the correct pictureInPictureElement in document when requestPictureInPicture called', async () => {
      await videoElement.requestPictureInPicture();
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    })
  });

  describe('exitPictureInPicture API', () => {
    it('should exit PIP when exitPictureInPicture called', async () => {
      await videoElement.requestPictureInPicture();
      await document.exitPictureInPicture();
      chai.expect(!!document.pictureInPictureElement).to.be.false;
    })

    it('should throw an error when exitPictureInPicture called and no pictureInPictureElement', async () => {
      let error;

      try {
        await document.exitPictureInPicture();
      } catch (e) {
        error = e;
      }

      chai.expect(e).to.not.be.undefined;
    })
  });

  describe('enterpictureinpicture event API', () => {
    let called;
    const eventListener = () => { called = true };

    afterEach(() => {
      called = false;
      videoElement.removeEventListener('enterpictureinpicture', eventListener);
    })

    it('should trigger enterpictureinpicture event when native PIP is used', () => {
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      video.webkitSetPresentationMode('picture-in-picture');

      chai.expect(called).to.be.true;
    })

    it('should trigger enterpictureinpicture event when standard PIP is used', async () => {
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      await videoElement.requestPictureInPicture();

      chai.expect(called).to.be.true;
    })

    it('should not trigger enterpictureinpicture when native exit PIP is used', async () => {
      video.webkitSetPresentationMode('picture-in-picture');
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      video.webkitSetPresentationMode('inline');

      chai.expect(called).to.be.false;
    })

    it('should not trigger enterpictureinpicture when standard exit PIP is used', async () => {
      video.webkitSetPresentationMode('picture-in-picture');
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      await document.exitPictureInPicture();

      chai.expect(called).to.be.false;
    })
  });

  describe('leavepictureinpicture event API', () => {
    it('should trigger leavepictureinpicture when native exit PIP is used', async () => {
      // TODO
    })

    it('should trigger leavepictureinpicture when standard exit PIP is used', async () => {
      // TODO
    })

    it('should not trigger leavepictureinpicture when natively entering PIP', async () => {
      // TODO
    })

    it('should not trigger leavepictureinpicture when standardly entering PIP', async () => {
      // TODO
    })

    it('should not trigger leavepictureinpicture when entering webkit fullscreen', async () => {
      // TODO
    })

    it('should trigger leavepictureinpicture when addEventListener called after going PIP with native api', async () => {
      // TODO
    })

    it('should trigger leavepictureinpicture when addEventListener called after going PIP with standard api', async () => {
      // TODO
    })
  });

  describe('Other APIs preservation', () => {
    it('should trigger any other listener correctly', async () => {
      // TODO
    })
  });

  describe('Remove Event listener for the new API', () => {
    it('should remove enterpictureinpicture listener correctly', async () => {
      // TODO
    })

    it('should remove leavepictureinpicture listener correctly', async () => {
      // TODO
    })

    it('should remove any other listener correctly', async () => {
      // TODO
    })
  });
  
  describe('Other API behavior', () => {
    it('should exit PIP when setting disablePictureInPicture to true', async () => {
      // TODO
    })
  });

});