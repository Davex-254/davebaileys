# Davex-Baileys

A lightweight, full-featured WhatsApp Web API library for Node.js.

## Overview

This is a Node.js library (not a web app) that provides a programmatic interface for interacting with WhatsApp's Web API via WebSockets.

## Project Structure

- `lib/` - Core library source files
  - `Socket/` - WebSocket connection and message handling
  - `Signal/` - Signal protocol / E2E encryption
  - `WABinary/` - WhatsApp binary encoding/decoding
  - `Utils/` - Helper utilities
  - `Types/` - Type definitions
  - `WAUSync/` - USync protocol for contact/status sync
- `WAProto/` - Protobuf definitions and generated bindings
- `test.js` - Library verification script
- `engine-requirements.js` - Node.js version check

## Tech Stack

- **Runtime:** Node.js 20+
- **Package Manager:** npm
- **Communication:** WebSockets (`ws`)
- **Serialization:** Protocol Buffers (`protobufjs`)
- **Encryption:** libsignal (Signal protocol)
- **Logging:** pino

## Usage

```javascript
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('davex-baileys')
```

## Workflow

- **Start application** - runs `node test.js` to verify the library loads correctly (console output)
