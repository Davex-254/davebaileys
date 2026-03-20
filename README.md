<div align="center">
  <h1>Davex-Baileys</h1>
  <p>A WebSocket-based JavaScript library for interacting with the WhatsApp Web API</p>
  
  [![npm version](https://img.shields.io/npm/v/davex-baileys.svg)](https://www.npmjs.com/package/davex-baileys)
  [![npm downloads](https://img.shields.io/npm/dm/davex-baileys.svg)](https://www.npmjs.com/package/davex-baileys)
  [![License](https://img.shields.io/npm/l/davex-baileys.svg)](https://github.com/davex-baileys/davex-baileys/blob/main/LICENSE)
</div>

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

## Installation

```bash
npm install davex-baileys
```

Or using yarn:
```bash
yarn add davex-baileys
```

## Quick Start

### CommonJS (Recommended)
```javascript
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('davex-baileys')
```

### ES Modules / TypeScript
```javascript
import pkg from 'davex-baileys'
const { default: makeWASocket, useMultiFileAuthState, Browsers } = pkg
```

## Features

- Full WhatsApp Web API support
- Multi-device support with QR code and pairing code authentication
- LID (Link ID) addressing support for both personal chats and groups
- Group status/story sending functionality
- Session management and restoration
- Message sending, receiving, and manipulation
- Group management
- Privacy settings
- Profile management
- And much more!

## Documentation

Full documentation is available at [github.com/davex-baileys](https://github.com/davex-baileys)
