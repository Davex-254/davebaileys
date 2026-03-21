# davexbaileys

  [![npm version](https://img.shields.io/npm/v/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  A lightweight, full-featured WhatsApp Web API library for Node.js — maintained by **Dave Tech**.

  > Built on top of the Baileys protocol layer with extended features for bots, channels, groups, and business.

  ## Installation

  ```bash
  npm install davexbaileys
  ```

  ## Usage

  ```js
  const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('davexbaileys');

  const { version } = await fetchLatestBaileysVersion(); // fetches live from WhatsApp
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({ version, auth: state });
  sock.ev.on('creds.update', saveCreds);
  ```

  ## Features

  ### Connection
  - `fetchLatestBaileysVersion()` — fetches live WA version from WhatsApp web (no stale versions)
  - `fetchLatestWaWebVersion()` — alternative live version fetch
  - Multi-device (MD) support with pairing code & QR
  - Automatic reconnection with smart keepalive

  ### Messaging
  - Send text, images, videos, audio, documents, stickers, reactions, polls
  - Edit and delete messages
  - Quote / reply, forward, mention contacts

  ### Groups
  - Create, update, leave, join (invite link or code)
  - Manage participants (add, remove, promote, demote)
  - Update group settings (subject, description, icon, restrictions)
  - `isAntiGroupMention(message, participants, threshold?)` — detect mass @everyone mentions

  ```js
  // Anti group mention detection
  sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.key.fromMe && msg.key.remoteJid.endsWith('@g.us')) {
          const meta = await sock.groupMetadata(msg.key.remoteJid);
          if (sock.isAntiGroupMention(msg, meta.participants.map(p => p.id))) {
              // Someone mentioned everyone — take action
              await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Mass mentions are not allowed!' });
          }
      }
  });
  ```

  ### Private Chat Commands
  - `sock.pinChat(jid, true|false)` — pin or unpin a chat
  - `sock.archiveChat(jid, lastMessages)` — archive a chat
  - `sock.unarchiveChat(jid, lastMessages)` — unarchive a chat
  - `sock.markChatRead(jid, lastMessages)` — mark chat as read
  - `sock.markChatUnread(jid, lastMessages)` — mark chat as unread
  - `sock.chatModify(mod, jid)` — raw chat modification
  - `sock.star(jid, messages, star)` — star/unstar messages

  ### Newsletter (Channel) Commands
  - `sock.newsletterCreate(name, description)` — create a new channel
  - `sock.newsletterFollow(jid)` — follow a channel
  - `sock.newsletterUnfollow(jid)` — unfollow a channel
  - `sock.newsletterMute(jid)` / `sock.newsletterUnmute(jid)` — mute/unmute
  - `sock.newsletterMetadata(type, key)` — get channel metadata
  - `sock.newsletterSubscribers(jid)` — get subscriber list
  - `sock.newsletterReactMessage(jid, serverId, emoji)` — react to a channel post
  - `sock.newsletterFetchMessages(jid, count, since, after)` — fetch channel messages
  - `sock.newsletterUpdateName(jid, name)` — update channel name
  - `sock.newsletterUpdateDescription(jid, description)` — update channel description
  - `sock.newsletterUpdatePicture(jid, buffer)` — update channel picture
  - `sock.newsletterRemovePicture(jid)` — remove channel picture
  - `sock.newsletterDelete(jid)` — delete channel
  - `sock.newsletterChangeOwner(jid, newOwnerJid)` — transfer ownership
  - `sock.subscribeNewsletterUpdates(jid)` — subscribe to live updates

  > **Auto-react:** davexbaileys automatically reacts 👍 to new posts from the Dave Tech official channel.

  ### WhatsApp Business Commands
  - `sock.getCatalog({ jid, limit, cursor })` — fetch business product catalog
  - `sock.getCollections(jid, limit)` — fetch product collections
  - `sock.getOrderDetails(orderId, tokenBase64)` — get order details
  - `sock.getBusinessProfile(jid)` — get business profile

  ### Privacy & Settings
  - `sock.updateLastSeenPrivacy(value)`
  - `sock.updateOnlinePrivacy(value)`
  - `sock.updateProfilePicturePrivacy(value)`
  - `sock.updateStatusPrivacy(value)`
  - `sock.updateReadReceiptsPrivacy(value)`
  - `sock.updateGroupsAddPrivacy(value)`
  - `sock.updateDefaultDisappearingMode(duration)`
  - `sock.updateBlockStatus(jid, action)`

  ### Newsletter Events
  ```js
  sock.ev.on('newsletter.reaction', update => { /* { id, server_id, reaction } */ });
  sock.ev.on('newsletter.view', update => { /* { id, server_id, count } */ });
  sock.ev.on('newsletter-participants.update', update => { /* participant changes */ });
  sock.ev.on('newsletter-settings.update', update => { /* settings changes */ });
  ```

  ## Author

  **Dave Tech**  
  GitHub: [Davex-254](https://github.com/Davex-254)  
  Channel: [Dave Tech on WhatsApp](https://whatsapp.com/channel/0029Vb6wIVU9Bb5w69FQvt0W)

  ## License

  MIT
  