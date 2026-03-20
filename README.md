<div align="center">
  <h1>davexbaileys</h1>
  <p>A WebSocket-based JavaScript library for interacting with the WhatsApp Web API</p>

  [![npm version](https://img.shields.io/npm/v/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
  [![npm downloads](https://img.shields.io/npm/dm/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
  [![License](https://img.shields.io/npm/l/davexbaileys.svg)](https://github.com/Davex-254/davebaileys/blob/main/LICENSE)
</div>

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

## Installation

```bash
npm install davexbaileys
```

Or using yarn:
```bash
yarn add davexbaileys
```

## Quick Start

This package is pure ESM. Use `import` syntax:

```javascript
import makeWASocket, { useMultiFileAuthState, Browsers } from 'davexbaileys'
```

### Basic Connection Example

```javascript
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from 'davexbaileys'
import { Boom } from '@hapi/boom'

const { state, saveCreds } = await useMultiFileAuthState('auth_info')

const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
})

sock.ev.on('creds.update', saveCreds)

sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('Scan QR:', qr)

    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)
            && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        if (shouldReconnect) connectToWA()
    } else if (connection === 'open') {
        console.log('Connected!')
    }
})
```

## Features

- Full WhatsApp Web API support — based on official [@WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) v7.0.0-rc.9
- Multi-device support with QR code and pairing code authentication
- LID (Link ID) addressing support for personal chats and groups
- Session stability fix for deployed servers (no more 428 reconnection loops)
- Message sending, receiving, and manipulation
- Group management
- Newsletter / channel support
- Privacy settings
- Profile management
- And much more!

## Documentation

Full documentation is available at [github.com/Davex-254/davebaileys](https://github.com/Davex-254/davebaileys)
