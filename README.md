<div align="center">
  <h1>davexbaileys</h1>
  <p>A full-featured WhatsApp Web API library for Node.js — built for bots, automation, and real integrations.</p>

  [![npm version](https://img.shields.io/npm/v/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
  [![npm downloads](https://img.shields.io/npm/dm/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
  [![License](https://img.shields.io/npm/l/davexbaileys.svg)](https://github.com/Davex-254/davexbaileys/blob/main/LICENSE)
  [![Node](https://img.shields.io/node/v/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
</div>

---

> **Disclaimer:** This project is not affiliated with, endorsed by, or connected to WhatsApp or Meta in any way. Use responsibly. Do not use for spamming, bulk messaging, or stalkerware.

---

## Installation

```bash
npm install davexbaileys
```

```bash
yarn add davexbaileys
```

---

## Quick Start

### QR Code Login

```javascript
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('davexbaileys')
const { Boom } = require('@hapi/boom')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

    const sock = makeWASocket({
        auth: state,
        browser: Browsers.ubuntu('MyBot'),
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (connection === 'close') {
            const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('Connected!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        if (text === 'ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'pong 🏓' }, { quoted: msg })
        }
    })
}

startBot()
```

### Pairing Code Login (No QR)

```javascript
const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
})

sock.ev.on('connection.update', async ({ connection }) => {
    if (connection === 'connecting') {
        const phoneNumber = '254700000000' // your number without +
        const code = await sock.requestPairingCode(phoneNumber)
        console.log('Pairing code:', code)
    }
})
```

---

## Sending Messages

### Text

```javascript
await sock.sendMessage(jid, { text: 'Hello!' })

// With mention
await sock.sendMessage(jid, {
    text: '@user Hello!',
    mentions: ['254700000000@s.whatsapp.net']
})

// Reply to a message
await sock.sendMessage(jid, { text: 'Reply' }, { quoted: originalMsg })
```

### Images & Videos

```javascript
// From file
await sock.sendMessage(jid, {
    image: { url: './photo.jpg' },
    caption: 'Check this out'
})

// From URL
await sock.sendMessage(jid, {
    video: { url: 'https://example.com/video.mp4' },
    caption: 'Watch this',
    gifPlayback: false
})
```

### Audio & Voice Notes

```javascript
// Audio file
await sock.sendMessage(jid, { audio: { url: './audio.mp3' } })

// Voice note (PTT)
await sock.sendMessage(jid, {
    audio: { url: './voice.ogg' },
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true
})
```

### Documents

```javascript
await sock.sendMessage(jid, {
    document: { url: './file.pdf' },
    mimetype: 'application/pdf',
    fileName: 'document.pdf'
})
```

### Stickers

```javascript
await sock.sendMessage(jid, { sticker: { url: './sticker.webp' } })
```

### Location

```javascript
await sock.sendMessage(jid, {
    location: { degreesLatitude: -1.286389, degreesLongitude: 36.817223 }
})
```

### Buttons & Polls

```javascript
// Poll
await sock.sendMessage(jid, {
    poll: {
        name: 'Choose one',
        values: ['Option A', 'Option B', 'Option C'],
        selectableCount: 1
    }
})
```

### Forward a Message

```javascript
await sock.reshare(jid, originalMsg)
```

### Send to Status (Story)

```javascript
await sock.sendToStatus(
    { text: 'My status update ✨' },
    { statusJidList: ['254700000000@s.whatsapp.net'] }
)
```

### Edit a Sent Message

```javascript
await sock.editMessage(jid, originalMsgId, 'Updated text here')
```

### Delete a Message

```javascript
await sock.sendMessage(jid, { delete: messageKey })
```

### React to a Message

```javascript
await sock.sendMessage(jid, {
    react: { text: '🔥', key: messageKey }
})
```

---

## Receiving Messages — Events

```javascript
// New message
sock.ev.on('messages.upsert', ({ messages, type }) => { ... })

// Message status update (delivered, read, etc.)
sock.ev.on('messages.update', updates => { ... })

// Receipts (group delivery/read per user)
sock.ev.on('message-receipt.update', updates => { ... })

// Connection state
sock.ev.on('connection.update', update => { ... })

// Group updates (join, leave, promote, etc.)
sock.ev.on('groups.update', updates => { ... })

// Group participant changes
sock.ev.on('group-participants.update', ({ id, participants, action }) => { ... })

// Contacts update
sock.ev.on('contacts.update', updates => { ... })

// Presence (typing, online)
sock.ev.on('presence.update', ({ id, presences }) => { ... })

// Incoming calls
sock.ev.on('call', calls => { ... })
```

---

## Group Management

```javascript
// Get group info
const metadata = await sock.groupMetadata(groupJid)

// Create a group
const group = await sock.groupCreate('Group Name', ['254700000000@s.whatsapp.net'])

// Add / remove / promote / demote participants
await sock.groupParticipantsUpdate(groupJid, [jid], 'add')     // 'add' | 'remove' | 'promote' | 'demote'

// Update group subject (name)
await sock.groupUpdateSubject(groupJid, 'New Name')

// Update group description
await sock.groupUpdateDescription(groupJid, 'New description')

// Toggle group settings
await sock.groupSettingUpdate(groupJid, 'announcement')   // 'announcement' | 'not_announcement' | 'locked' | 'unlocked'

// Invite link
const link = await sock.groupInviteCode(groupJid)
const fullLink = 'https://chat.whatsapp.com/' + link

// Join via link
await sock.groupAcceptInvite('INVITE_CODE')

// Leave group
await sock.groupLeave(groupJid)
```

---

## Chat Utilities

```javascript
// Archive / unarchive
await sock.chatModify({ archive: true, lastMessages: [msg] }, jid)

// Pin / unpin
await sock.pinChat(jid, true)

// Mark as read
await sock.readMessages([messageKey])

// Delete chat
await sock.chatModify({ delete: true, lastMessages: [msg] }, jid)

// Mute for 8 hours
await sock.chatModify({ mute: 8 * 60 * 60 * 1000 }, jid)

// Disappearing messages (7 days = 604800)
await sock.sendMessage(jid, {
    disappearingMessagesInChat: 604800
})
```

---

## Profile & Privacy

```javascript
// Update display name
await sock.updateProfileName('My Name')

// Update bio
await sock.updateProfileStatus('My status text')

// Update profile picture
await sock.updateProfilePicture(jid, { url: './photo.jpg' })

// Remove profile picture
await sock.removeProfilePicture(jid)

// Fetch profile picture URL
const url = await sock.profilePictureUrl(jid, 'image')

// Privacy settings — each has its own function
await sock.updateReadReceiptsPrivacy('all')          // 'all' | 'none'
await sock.updateProfilePicturePrivacy('contacts')   // 'all' | 'contacts' | 'contact_blacklist' | 'none'
await sock.updateStatusPrivacy('contacts')
await sock.updateOnlinePrivacy('all')                // 'all' | 'match_last_seen'
await sock.updateLastSeenPrivacy('contacts')
await sock.updateGroupsAddPrivacy('contacts')

// Fetch current privacy settings
const privacy = await sock.fetchPrivacySettings(true)

// Update presence (available / unavailable)
await sock.sendPresenceUpdate('available')    // 'available' | 'unavailable'

// Typing indicator in a chat
await sock.sendPresenceUpdate('composing', jid)
await sock.sendPresenceUpdate('paused', jid)
```

---

## Newsletters (Channels)

```javascript
// Get channel metadata
const meta = await sock.newsletterMetadata('invite', 'INVITE_CODE')
const meta = await sock.newsletterMetadata('jid', channelJid)

// Follow / unfollow
await sock.newsletterFollow(channelJid)
await sock.newsletterUnfollow(channelJid)

// Mute / unmute
await sock.newsletterMute(channelJid)
await sock.newsletterUnmute(channelJid)

// Create a channel
const channel = await sock.newsletterCreate('Channel Name', { description: 'About this channel' })

// Update channel name / description
await sock.newsletterUpdate(channelJid, { name: 'New Name', description: 'New description' })

// Delete a channel (you must be admin)
await sock.newsletterDelete(channelJid)
```

---

## Anti-Utilities (Built-in Bot Helpers)

All checkers live on `sock.antiUtils` and correctly unwrap view-once, ephemeral, and documentWithCaption messages automatically.

```javascript
const { antiUtils } = sock

// Message type detection
antiUtils.getType(msg)          // 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'document' | 'gif' | 'contact' | 'location' | 'reaction' | 'poll' | 'unknown'
antiUtils.getText(msg)          // extracts plain text from any message type

// Individual checkers
antiUtils.isSticker(msg)        // antisticker
antiUtils.isImage(msg)          // antiimage
antiUtils.isAudio(msg)          // antiaudio
antiUtils.isVideo(msg)          // antivideo
antiUtils.isDocument(msg)       // antidocument / antifiles
antiUtils.isGif(msg)            // gif loop detection
antiUtils.isViewOnce(msg)       // antiviewonce
antiUtils.isForwarded(msg)      // antiforward
antiUtils.isContact(msg)        // contact card detection
antiUtils.isLocation(msg)       // location detection
antiUtils.isStatus(msg)         // status/story broadcast
antiUtils.isFromBot(msg)        // antibot — sender is a WA bot account
antiUtils.hasLink(msg)          // antilink — catches http, https, wa.me, t.me, bit.ly, etc.
antiUtils.hasMention(msg)       // antitag / antimention — @-mentions of users
antiUtils.hasGroupMention(msg)  // @g.us group/community mentions
antiUtils.isBugMessage(msg)     // antibug — null bytes, RTL overrides, crash chars
antiUtils.isVirtex(msg)         // antivirtex — Virtex crash exploit patterns
```

Example — antilink in a group:

```javascript
sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return
    if (!msg.key.remoteJid.endsWith('@g.us')) return  // groups only

    if (sock.antiUtils.hasLink(msg)) {
        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key })
        await sock.sendMessage(msg.key.remoteJid, { text: '🚫 Links not allowed here.' })
    }
})
```

---

## Download Media

```javascript
const { downloadMediaMessage } = require('davexbaileys')

const buffer = await downloadMediaMessage(msg, 'buffer', {})
// buffer is a Buffer you can save to disk or process
```

---

## Business Profile

```javascript
// Update business profile
await sock.updateBussinesProfile({
    description: 'We sell everything',
    email: 'contact@mybusiness.com',
    website: ['https://mybusiness.com'],
    category: 'Shopping & Retail'
})
```

---

## Configuration Options

```javascript
const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu('MyBot'),  // or Browsers.macOS('Desktop') / Browsers.windows('MyBot')
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),  // suppress logs: require('pino')
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
    fireInitQueries: true,
    generateHighQualityLinkPreview: false,
    shouldIgnoreJid: jid => isJidBroadcast(jid),  // optional filter
    getMessage: async key => undefined  // optional message store
})
```

---

## Links

- **npm:** https://www.npmjs.com/package/davexbaileys
- **GitHub:** https://github.com/Davex-254/davexbaileys
- **Issues:** https://github.com/Davex-254/davexbaileys/issues

---

## License

MIT © [Davex-254](https://github.com/Davex-254)
