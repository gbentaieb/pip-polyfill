const hasWebkitApi = (
  HTMLVideoElement.prototype.webkitSupportsPresentationMode &&
  typeof HTMLVideoElement.prototype.webkitSetPresentationMode === "function"
);
const hasStandardApi = (
  HTMLVideoElement.prototype.requestPictureInPicture &&
  document.exitPictureInPicture
);

const videoElement = document.getElementById('videoElement');

const stdDescribe = hasStandardApi ? describe : describe.it;
const wbkIt = hasWebkitApi ? it : it.skip;

stdDescribe('test', function () {
  afterEach(async () => {
    videoElement.removeAttribute('disablePictureInPicture');

    if (hasWebkitApi) {
      videoElement.webkitSetPresentationMode('inline');
    } else if (document.pictureInPictureElement) {
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

    wbkIt('should set document.pictureInPictureElement correctly using webkit API', () => {
      videoElement.webkitSetPresentationMode('picture-in-picture');
      chai.expect(document.pictureInPictureElement).to.equal(videoElement);
    })

    it('should clear document.pictureInPictureElement correctly using standard API', async () => {
      await videoElement.requestPictureInPicture();
      await document.exitPictureInPicture();
      chai.expect(!!document.pictureInPictureElement).to.be.false;
    })

    wbkIt('should clear document.pictureInPictureElement correctly using webkit API', () => {
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
        videoElement.setAttribute('disablePictureInPicture', true);
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

      chai.expect(error).to.not.be.undefined;
    })
  });

  describe('enterpictureinpicture event API', () => {
    let eventListener;

    afterEach(() => {
      videoElement.removeEventListener('enterpictureinpicture', eventListener);
      eventListener = null;
    })

    wbkIt('should trigger enterpictureinpicture event when webkit PIP is used', (done) => {
      eventListener = () => { done() };
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      videoElement.webkitSetPresentationMode('picture-in-picture');
    })

    it('should trigger enterpictureinpicture event when standard PIP is used', (done) => {
      eventListener = () => { done() };
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      videoElement.requestPictureInPicture();
    })

    wbkIt('should not trigger enterpictureinpicture when webkit exit PIP is used', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.webkitSetPresentationMode('picture-in-picture');
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      videoElement.webkitSetPresentationMode('inline');
    })

    it('should not trigger enterpictureinpicture when standard exit PIP is used', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.requestPictureInPicture().then(() => {
        videoElement.addEventListener('enterpictureinpicture', eventListener);
        document.exitPictureInPicture();
      });
    })
  });

  describe('leavepictureinpicture event API', () => {
    let eventListener ;

    afterEach(() => {
      videoElement.removeEventListener('leavepictureinpicture', eventListener);
      eventListener = null;
    })

    wbkIt('should trigger leavepictureinpicture when webkit exit PIP is used', (done) => {
      eventListener = () => { done() };
      videoElement.requestPictureInPicture().then(() => {
        videoElement.addEventListener('leavepictureinpicture', eventListener);
        videoElement.webkitSetPresentationMode('inline');
      });
    })

    it('should trigger leavepictureinpicture when standard exit PIP is used', (done) => {
      eventListener = () => { done() };
      videoElement.requestPictureInPicture().then(() => {
        videoElement.addEventListener('leavepictureinpicture', eventListener);
        document.exitPictureInPicture();
      });
    })

    wbkIt('should not trigger leavepictureinpicture when webkitly entering PIP', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.addEventListener('leavepictureinpicture', eventListener);
      videoElement.webkitSetPresentationMode('picture-in-picture');
    })

    it('should not trigger leavepictureinpicture when standardly entering PIP', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.addEventListener('leavepictureinpicture', eventListener);
      videoElement.requestPictureInPicture();
    })
  });

  describe('Other API events preservation', () => {
    let eventListener;

    afterEach(async () => {
      videoElement.removeEventListener('pause', eventListener);
      eventListener = undefined;
      await videoElement.play();
    })

    it('should trigger any other listener correctly', (done) => {
      eventListener = () => { done() };
      videoElement.addEventListener('pause', eventListener);
      videoElement.pause();
    })
  });

  describe('Remove Event listener for the new API', () => {
    let eventListener;

    afterEach(async () => {
      videoElement.removeEventListener('enterpictureinpicture', eventListener);
      videoElement.removeEventListener('leavepictureinpicture', eventListener);
      videoElement.removeEventListener('pause', eventListener);
      eventListener = undefined;
      await videoElement.play();
    })

    it('should remove enterpictureinpicture listener correctly', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.addEventListener('enterpictureinpicture', eventListener);
      videoElement.removeEventListener('enterpictureinpicture', eventListener);
      videoElement.requestPictureInPicture();
    })

    it('should remove leavepictureinpicture listener correctly', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.addEventListener('leavepictureinpicture', eventListener);
      videoElement.removeEventListener('leavepictureinpicture', eventListener);
      videoElement.requestPictureInPicture().then(() => {
        document.exitPictureInPicture();
      });
    })

    it('should remove any other listener correctly', (done) => {
      setTimeout(done, 1000);

      eventListener = () => { throw new Error('Event Called!') };
      videoElement.addEventListener('pause', eventListener);
      videoElement.removeEventListener('pause', eventListener);
      videoElement.pause();
    })
  });
  
  describe('Other API behavior', () => {
    it.skip('should exit PIP when setting disablePictureInPicture to true', async () => {
      await videoElement.requestPictureInPicture();
      videoElement.setAttribute('disablePictureInPicture', true);

      chai.expect(!!document.pictureInPictureElement).to.be.false
    })
  });
});
