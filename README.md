<div align="center">

# davexbaileys

**A fast, lightweight WhatsApp Web API library for Node.js**

[![npm](https://img.shields.io/npm/v/davexbaileys?color=crimson)](https://www.npmjs.com/package/davexbaileys)
[![npm downloads](https://img.shields.io/npm/dm/davexbaileys)](https://www.npmjs.com/package/davexbaileys)
[![license](https://img.shields.io/npm/l/davexbaileys)](https://github.com/Davex-254/davebaileys/blob/main/LICENSE)

</div>

---

> **Disclaimer:** This project is not affiliated with or endorsed by WhatsApp. Use responsibly. Do not use for spam, bulk messaging, or stalkerware.

---

## Why davexbaileys?

- No browser, no Selenium — connects directly via **WebSocket**
- Based on the latest official WhatsApp multi-device protocol
- Built-in fix for the **428 reconnection loop** that kills deployed bots
- Pure ESM — works cleanly with modern Node.js (v20+)

---

## Installation

```bash
npm install davexbaileys
```

---

## Requirements

- **Node.js v20 or higher**
- This package is **ESM only** — use `import`, not `require`

---

## Getting Started

### Save & Restore Session

```js
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from 'davexbaileys'
import { Boom } from '@hapi/boom'

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('session')

    const sock = makeWASocket({ auth: state })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) console.log('QR code:', qr)

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            if (code !== DisconnectReason.loggedOut) start()
        } else if (connection === 'open') {
            console.log('Connected!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            console.log(msg)
        }
    })
}

start()
```

### Connect with Pairing Code (no QR)

```js
const sock = makeWASocket({ auth: state })

if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode('2547XXXXXXXX') // full number, no +
    console.log('Pairing code:', code)
}
```

---

## Sending Messages

```js
// Text
await sock.sendMessage(jid, { text: 'Hello!' })

// Reply / quote
await sock.sendMessage(jid, { text: 'Got it' }, { quoted: msg })

// Mention someone
await sock.sendMessage(jid, {
    text: '@254700000000 hey!',
    mentions: ['254700000000@s.whatsapp.net']
})

// Image
await sock.sendMessage(jid, {
    image: { url: './image.jpg' },
    caption: 'Check this out'
})

// Video
await sock.sendMessage(jid, {
    video: { url: './video.mp4' },
    caption: 'Watch this'
})

// Audio
await sock.sendMessage(jid, {
    audio: { url: './audio.mp3' },
    mimetype: 'audio/mp4'
})

// React to a message
await sock.sendMessage(jid, {
    react: { text: '🔥', key: msg.key }
})

// Delete for everyone
await sock.sendMessage(jid, {
    delete: msg.key
})
```

---

## WhatsApp JID Format

| Type | Format |
|------|--------|
| Personal chat | `254700000000@s.whatsapp.net` |
| Group | `123456789-123456@g.us` |
| Broadcast | `status@broadcast` |

---

## Groups

```js
// Create
const group = await sock.groupCreate('My Group', ['254700000000@s.whatsapp.net'])

// Add / remove participants
await sock.groupParticipantsUpdate(jid, ['254700000000@s.whatsapp.net'], 'add')    // or 'remove'

// Promote / demote
await sock.groupParticipantsUpdate(jid, ['254700000000@s.whatsapp.net'], 'promote') // or 'demote'

// Get invite link
const code = await sock.groupInviteCode(jid)

// Join by invite code
await sock.groupAcceptInvite('abc123')

// Group info
const meta = await sock.groupMetadata(jid)

// Leave
await sock.groupLeave(jid)
```

---

## Privacy & Profile

```js
// Block / unblock
await sock.updateBlockStatus(jid, 'block')   // or 'unblock'

// Change display name
await sock.updateProfileName('My Name')

// Change status
await sock.updateProfileStatus('Available')

// Update profile picture
await sock.updateProfilePicture(jid, { url: './photo.jpg' })

// Fetch someone's profile picture
const url = await sock.profilePictureUrl(jid, 'image')
```

---

## Reading Messages & Presence

```js
// Mark messages as read
await sock.readMessages([msg.key])

// Update presence (in a chat)
await sock.sendPresenceUpdate('composing', jid)  // typing
await sock.sendPresenceUpdate('paused', jid)     // stopped typing
```

---

## Downloading Media

```js
import { downloadMediaMessage } from 'davexbaileys'

sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
        if (msg.message?.imageMessage) {
            const buffer = await downloadMediaMessage(msg, 'buffer', {})
            // save or process buffer
        }
    }
})
```

---

## Caching Group Metadata (Recommended for group bots)

```js
import { NodeCache } from '@cacheable/node-cache'

const groupCache = new NodeCache({ stdTTL: 300 })

const sock = makeWASocket({
    auth: state,
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
})

sock.ev.on('groups.update', async ([event]) => {
    groupCache.set(event.id, await sock.groupMetadata(event.id))
})
```

---

## Links

- **npm:** https://www.npmjs.com/package/davexbaileys
- **GitHub:** https://github.com/Davex-254/davebaileys

---

## License

MIT — © Davex-254
