<div align="center">
  <h1>DaveBaileys</h1>
  <p>A WebSocket-based JavaScript library for interacting with the WhatsApp Web API</p>
  
  [![npm version](https://img.shields.io/npm/v/davebaileys.svg)](https://www.npmjs.com/package/davebaileys)
  [![npm downloads](https://img.shields.io/npm/dm/davebaileys.svg)](https://www.npmjs.com/package/davebaileys)
  [![License](https://img.shields.io/npm/l/davebaileys.svg)](https://github.com/Davex-254/davebaileys/blob/main/LICENSE)
</div>

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

## Installation

```bash
npm install davebaileys
```

Or using yarn:
```bash
yarn add davebaileys
```

## Quick Start

### CommonJS (Recommended)
```javascript
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('davebaileys')
```

### ES Modules / TypeScript
```javascript
import pkg from 'davebaileys'
const { default: makeWASocket, useMultiFileAuthState, Browsers } = pkg
```

## Features

- Full WhatsApp Web API support
- Multi-device support with QR code and pairing code authentication
- LID (Link ID) addressing support for both personal chats and groups
- Group status/story sending functionality
- Anti-delete status support
- Session management and restoration
- Message sending, receiving, and manipulation
- Group management
- Privacy settings
- Profile management
- And much more!

## Status Posting Methods

```javascript
// Post text status
await sock.sendTextStatus("Hello World!", {
    font: 5,
    backgroundColor: "#FF5733",
    textColor: "#FFFFFF",
    statusJidList: ["2547xxxxxxx@s.whatsapp.net"]
});

// Post image status
await sock.sendImageStatus("https://example.com/image.jpg", {
    caption: "Check this out!",
    statusJidList: ["2547xxxxxxx@s.whatsapp.net"]
});

// Post video status
await sock.sendVideoStatus("https://example.com/video.mp4", {
    caption: "Watch this!",
    statusJidList: ["2547xxxxxxx@s.whatsapp.net"]
});

// Post audio status
await sock.sendAudioStatus(audioBuffer, {
    ptt: true,
    statusJidList: ["2547xxxxxxx@s.whatsapp.net"]
});
```

## Documentation

Full documentation is available at [github.com/Davex-254/davebaileys](https://github.com/Davex-254/davebaileys)
