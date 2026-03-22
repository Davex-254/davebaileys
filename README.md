# davexbaileys

  [![npm version](https://img.shields.io/npm/v/davexbaileys?style=flat-square&color=blue)](https://www.npmjs.com/package/davexbaileys)
  [![npm downloads](https://img.shields.io/npm/dm/davexbaileys?style=flat-square&color=green)](https://www.npmjs.com/package/davexbaileys)
  [![npm total](https://img.shields.io/npm/dt/davexbaileys?style=flat-square&color=orange&label=total+downloads)](https://www.npmjs.com/package/davexbaileys)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
  [![Node.js >=20](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?style=flat-square)](https://nodejs.org)

  > A lightweight, full-featured WhatsApp Web API library for Node.js — maintained by **Dave Tech**.

  ## Install

  ```bash
  npm install davexbaileys
  ```

  ## Requirements

  - **Node.js** `>=20.0.0` (same as official [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys))

  ## Quick Start

  ```js
  const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('davexbaileys');

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ version, auth: state });
  sock.ev.on('creds.update', saveCreds);
  ```

  📦 Full docs & API reference → **[npmjs.com/package/davexbaileys](https://www.npmjs.com/package/davexbaileys)**

  ## Author

  **Dave Tech** — [WhatsApp Channel](https://whatsapp.com/channel/0029Vb6wIVU9Bb5w69FQvt0W)

  ## License

  [MIT](LICENSE) © Dave Tech
  