const hasWebkitApi = (
  HTMLVideoElement.prototype.webkitSupportsPresentationMode &&
  typeof HTMLVideoElement.prototype.webkitSetPresentationMode === 'function'
);
const hasStandardApi = (
  HTMLVideoElement.prototype.requestPictureInPicture &&
  document.exitPictureInPicture
);

const videoElement = document.getElementById('videoElement');

const stdDescribe = hasStandardApi ? describe : describe.it;
const wbkIt = hasWebkitApi ? it : it.skip;

stdDescribe('test', () => {
  afterEach(async () => {
    videoElement.removeAttribute('disablePictureInPicture');

    if (hasWebkitApi) {
      videoElement.webkitSetPresentationMode('inline');
    } else if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      document.pictureInPictureElement = undefined;
    }
  });

  describe('API is Available', () => {
    it('should have requestPictureInPicture in videoElement', () => {
      chai.expect(HTMLVideoElement.prototype.requestPictureInPicture).to.not.equal(undefined);
    });

    it('should have exitPictureInPicture in document', () => {
      chai.expect(document.exitPictureInPicture).to.not.equal(undefined);
    });
  });

  describe('Document.pictureInpictureElement API', () => {
    it('should not have any PIP video at start', () => {
      chai.expect(!!document.pictureInPictureElement).to.equal(false);
    });

    it('should set document.pictureInPictureElement correctly using standard API', async () => {
      await videoElement.requestPictureInPicture();
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    });

    wbkIt('should set document.pictureInPictureElement correctly using webkit API', () => {
      videoElement.webkitSetPresentationMode('picture-in-picture');
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    });

    it('should clear document.pictureInPictureElement correctly using standard API', async () => {
      await videoElement.requestPictureInPicture();
      await document.exitPictureInPicture();

      chai.expect(!!document.pictureInPictureElement).to.equal(false);
    });

    wbkIt('should clear document.pictureInPictureElement correctly using webkit API', () => {
      videoElement.webkitSetPresentationMode('picture-in-picture');
      videoElement.webkitSetPresentationMode('inline');

      chai.expect(!!document.pictureInPictureElement).to.equal(false);
    });
  });

  describe('requestPictureInPicture API', () => {
    it('should trigger PIP when requestPictureInPicture called', async () => {
      await videoElement.requestPictureInPicture();
      chai.expect(!!document.pictureInPictureElement).to.equal(true);
    });

    it('should throw an error if disablePictureInPicture', async () => {
      let error;

      try {
        videoElement.setAttribute('disablePictureInPicture', true);
        await videoElement.requestPictureInPicture();
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.not.equal(undefined);
    });

    it('should set the correct pictureInPictureElement in document when requestPictureInPicture called', async () => {
      await videoElement.requestPictureInPicture();
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    });
  });

  describe('exitPictureInPicture API', () => {
    it('should exit PIP when exitPictureInPicture called', async () => {
      await videoElement.requestPictureInPicture();
      await document.exitPictureInPicture();
      chai.expect(!!document.pictureInPictureElement).to.equal(false);
    });

    it('should throw an error when exitPictureInPicture called and no pictureInPictureElement', async () => {
      let error;

      try {
        await document.exitPictureInPicture();
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.not.equal(undefined);
    });
  });

  describe('enterpictureinpicture event API', () => {
    let passTest;
    const failEventListener = () => { throw new Error('Event Called!'); };
    const passEventListener = () => { passTest(); };

    afterEach(() => {
      passTest = null;
      videoElement.removeEventListener('enterpictureinpicture', failEventListener);
      videoElement.removeEventListener('enterpictureinpicture', passEventListener);
    });

    wbkIt('should trigger enterpictureinpicture event when webkit PIP is used', (done) => {
      passTest = done;
      videoElement.addEventListener('enterpictureinpicture', passEventListener);

      videoElement.webkitSetPresentationMode('picture-in-picture');
    });

    it('should trigger enterpictureinpicture event when standard PIP is used', (done) => {
      passTest = done;
      videoElement.addEventListener('enterpictureinpicture', passEventListener);
      videoElement.requestPictureInPicture();
    });

    wbkIt('should not trigger enterpictureinpicture when webkit exit PIP is used', (done) => {
      videoElement.webkitSetPresentationMode('picture-in-picture');

      videoElement.addEventListener('enterpictureinpicture', failEventListener);
      videoElement.webkitSetPresentationMode('inline');

      setTimeout(done);
    });

    it('should not trigger enterpictureinpicture when standard exit PIP is used', (done) => {
      videoElement.requestPictureInPicture().then(async () => {
        videoElement.addEventListener('enterpictureinpicture', failEventListener);
        await document.exitPictureInPicture();
        setTimeout(done);
      });
    });
  });

  describe('leavepictureinpicture event API', () => {
    let passTest;
    const failEventListener = () => { throw new Error('Event Called!'); };
    const passEventListener = () => { passTest(); };

    afterEach(() => {
      passTest = null;
      videoElement.removeEventListener('leavepictureinpicture', failEventListener);
      videoElement.removeEventListener('leavepictureinpicture', passEventListener);
    });

    wbkIt('should trigger leavepictureinpicture when webkit exit PIP is used', (done) => {
      passTest = done;
      videoElement.requestPictureInPicture().then(() => {
        videoElement.addEventListener('leavepictureinpicture', passEventListener);
        videoElement.webkitSetPresentationMode('inline');
      });
    });

    it('should trigger leavepictureinpicture when standard exit PIP is used', (done) => {
      passTest = done;
      videoElement.requestPictureInPicture().then(() => {
        videoElement.addEventListener('leavepictureinpicture', passEventListener);
        document.exitPictureInPicture();
      });
    });

    wbkIt('should not trigger leavepictureinpicture when entering PIP using webkit API', (done) => {
      videoElement.addEventListener('leavepictureinpicture', failEventListener);
      videoElement.webkitSetPresentationMode('picture-in-picture');

      setTimeout(done);
    });

    it('should not trigger leavepictureinpicture when standardly entering PIP', (done) => {
      videoElement.addEventListener('leavepictureinpicture', failEventListener);
      videoElement.requestPictureInPicture();

      setTimeout(done);
    });
  });

  describe('Other API events preservation', () => {
    let passTest;
    const passEventListener = () => { passTest(); };

    afterEach(async () => {
      passTest = null;
      videoElement.removeEventListener('pause', passEventListener);
      await videoElement.play();
    });

    it('should trigger any other listener correctly', (done) => {
      passTest = done;
      videoElement.addEventListener('pause', passEventListener);
      videoElement.pause();
    });
  });

  describe('Remove Event listener for the new API', () => {
    const failEventListener = () => { throw new Error('Event Called!'); };

    afterEach(async () => {
      videoElement.removeEventListener('enterpictureinpicture', failEventListener);
      videoElement.removeEventListener('leavepictureinpicture', failEventListener);
      videoElement.removeEventListener('pause', failEventListener);
      await videoElement.play();
    });

    it('should remove enterpictureinpicture listener correctly', (done) => {
      videoElement.addEventListener('enterpictureinpicture', failEventListener);
      videoElement.removeEventListener('enterpictureinpicture', failEventListener);
      videoElement.requestPictureInPicture();

      setTimeout(done);
    });

    it('should remove leavepictureinpicture listener correctly', (done) => {
      videoElement.addEventListener('leavepictureinpicture', failEventListener);
      videoElement.removeEventListener('leavepictureinpicture', failEventListener);
      videoElement.requestPictureInPicture().then(async () => {
        await document.exitPictureInPicture();
        setTimeout(done);
      });
    });

    it('should remove any other listener correctly', (done) => {
      videoElement.addEventListener('pause', failEventListener);
      videoElement.removeEventListener('pause', failEventListener);
      videoElement.pause();

      setTimeout(done);
    });
  });

  describe('Other API behavior', () => {
    // TODO: make the API support this use case
    it.skip('should exit PIP when setting disablePictureInPicture to true', async () => {
      await videoElement.requestPictureInPicture();
      videoElement.setAttribute('disablePictureInPicture', true);

      chai.expect(!!document.pictureInPictureElement).to.equal(false);
    });
  });
});
