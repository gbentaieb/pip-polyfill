# pip-polyfill

## Why a picture in picture polyfill
The w3c has described a standard API that should be implemented by every browser willing to add picture-in-picture (pip) features on the video element. However, **Safari has to this date implemented an other api**, making it difficult for web developers to develop and maintain pip features on their website.

We therefore want to provide a polyfill that will add the w3c pip API to safari.

## How do I use it
The polyfill is a ~100 lines single file, that you can find [here](https://github.com/gbentaieb/pip-polyfill/blob/master/pip.js). Fill free to use this in your own code !

## Tests
The polyfill is fully tested.
If you want to see the results of the tests, go [here](https://gbentaieb.github.io/pip-polyfill/test/)

## Demo
If you want to play around with the w3c api in safari, open [this page](https://gbentaieb.github.io/pip-polyfill/demo/) in your browser, and use the api in the console !