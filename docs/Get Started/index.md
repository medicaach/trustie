# Get Started

To get started download the trustie package from here: [https://docs.trustiedev.medicaa.ch/downloads/trustie.zip](https://docs.trustiedev.medicaa.ch/downloads/trustie.zip)

## Installation

Then add the trustie.js into your application with a script tag or by including it in your final js build output.

```html
<script src="/trustie.js"></script>
```

Then add the olm.wasm file from the archive to the root file path of your webserver. As a last step move the midata.png
to the root web folder as well. To check if you did everything correctly try to reach the two files like
this: http://yourwebserver.ch/olm.wasm and http://yourwebserver.ch/midata.png

If you installed everything you can now use the matrix webcomponent in your application:

Now you can use the trustie-component component in your application.

```html
<trustie-component></trustie-component>
```

## Configuration

You can configure the component by passing variables into it.

```html
<trustie-component homeserver="https://matrix.myserver.ch"></trustie-component>
```

You can configure the following variables:

| Variable | Values | Description                                         | Example Values |
|---------|--------|:----------------------------------------------------|----------------|
| homeserver | string| Any homeserver including the procotol (http/https) |    https://matrix.myserver.ch  |

## API

You can use the following functions to interact with the element reference. To use this API you need a reference to the
trustie-component element. Doing this will depend on your framework, to keep it simple the examples are for plain
javascript:

```javascript
let trustie = document.querySelector('trustie-component')
```

Show or hide the component. This can be useful for integrating the component into a mobile app. As the component uses
some fixed elements so the header and footer stay in the right place it might be needed to get the user out of the chat
interface.

```javascript
trustie.hide()
trustie.show()
```

You can use this method to send a text message in the current chat. 
```javascript
trustie.sendTextMessage("Hello")
```

`
