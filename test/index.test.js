const videoElement = document.getElementById('videoElement')

describe('test', function () {
  beforeEach(async () => {
    if(document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      document.pictureInPictureElement = undefined;
    }
  })

  it('should have requestPictureInPicture in videoElement', () => {
    chai.expect(HTMLVideoElement.prototype.requestPictureInPicture).to.not.be.undefined;
  });

  it('should have exitPictureInPicture in document', () => {
    chai.expect(document.exitPictureInPicture).to.not.be.undefined;
  });

  it('should trigger PIP when requestPictureInPicture called', async () => {
    await videoElement.requestPictureInPicture();
    chai.expect(!!document.pictureInPictureElement).to.be.true;
  })

  it('should not have any PIP video at start', async () => {
    chai.expect(!!document.pictureInPictureElement).to.be.false;
  })
});