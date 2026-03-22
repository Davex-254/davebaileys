# davexbaileys

  [![npm version](https://img.shields.io/npm/v/davexbaileys.svg)](https://www.npmjs.com/package/davexbaileys)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

  A lightweight, full-featured WhatsApp Web API library for Node.js — maintained by **Dave Tech**.

  ## Installation

  ```bash
  npm install davexbaileys
  ```

  ## Quick Start

  ```js
  const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('davexbaileys');

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ version, auth: state });
  sock.ev.on('creds.update', saveCreds);
  ```

  ---

  ## Feature Reference

  ### Connection & Version
  - `fetchLatestBaileysVersion()` — get bundled WA version
  - `fetchLatestWaWebVersion()` — fetch live WA version from WhatsApp web
  - Multi-device (MD) with pairing code or QR
  - Auto reconnect, smart keepalive

  ---

  ### Messaging
  - Send text, images, videos, audio, documents, stickers, GIFs, reactions, polls, contacts, locations, events
  - Edit, delete, forward messages
  - Quote/reply, mention contacts
  - `sock.sendMessage(jid, { pin: key })` — pin/unpin a message in a chat
  - `sock.pinMessage(jid, key, type)` — explicit pin (type=1 pin, type=2 unpin)

  ---

  ### Private Chat Commands
  | Method | Description |
  |--------|-------------|
  | `sock.pinChat(jid, true/false)` | Pin or unpin a chat |
  | `sock.archiveChat(jid, lastMsgs)` | Archive a chat |
  | `sock.unarchiveChat(jid, lastMsgs)` | Unarchive a chat |
  | `sock.markChatRead(jid, lastMsgs)` | Mark chat as read |
  | `sock.markChatUnread(jid, lastMsgs)` | Mark chat as unread |
  | `sock.muteChat(jid, durationMs)` | Mute a chat (ms=0 to unmute) |
  | `sock.unmuteChat(jid)` | Unmute a chat |
  | `sock.deleteChat(jid, lastMsgs)` | Delete a chat |
  | `sock.clearChat(jid, lastMsgs)` | Clear all messages |
  | `sock.star(jid, messages, star)` | Star/unstar messages |
  | `sock.addOrEditContact(jid, contact)` | Add or edit a contact |
  | `sock.removeContact(jid)` | Remove a contact |
  | `sock.chatModify(mod, jid)` | Raw chat modification |

  ---

  ### Privacy & Settings
  | Method | Description |
  |--------|-------------|
  | `sock.updateLastSeenPrivacy(value)` | Who sees your last seen (`all`/`contacts`/`contact_blacklist`/`none`) |
  | `sock.updateOnlinePrivacy(value)` | Online status visibility |
  | `sock.updateProfilePicturePrivacy(value)` | Profile photo visibility |
  | `sock.updateStatusPrivacy(value)` | Status (about) text visibility |
  | `sock.updateReadReceiptsPrivacy(value)` | Read receipts (blue ticks) |
  | `sock.updateCallPrivacy(value)` | Who can call you |
  | `sock.updateGroupsAddPrivacy(value)` | Who can add you to groups |
  | `sock.updateGroupsJoinPrivacy(value)` | Alias for groups add privacy |
  | `sock.updateAboutPrivacy(value)` | Bio/about visibility |
  | `sock.updateMessagesPrivacy(value)` | Messages privacy |
  | `sock.updateDefaultDisappearingMode(duration)` | Default disappearing mode (seconds) |
  | `sock.updateDisableLinkPreviewsPrivacy(bool)` | Disable/enable link previews |
  | `sock.updateStatusResharePrivacy(bool)` | Prevent others from resharing your status |
  | `sock.silenceUnknownCallers()` | Silence calls from unknown numbers |
  | `sock.allowUnknownCallers()` | Allow calls from everyone |
  | `sock.fetchPrivacySettings()` | Fetch all current privacy settings |
  | `sock.fetchDisappearingDuration(...jids)` | Fetch disappearing message settings for contacts |
  | `sock.updateProfileStatus(text)` | Update bio/about text |
  | `sock.updateProfileName(name)` | Update display name |
  | `sock.updateProfilePicture(jid, buffer)` | Update profile picture |
  | `sock.removeProfilePicture(jid)` | Remove profile picture |

  ---

  ### Group Commands
  - Create, leave, join by invite link/code
  - Add, remove, promote, demote participants
  - Update subject, description, icon, settings
  - Toggle ephemeral (disappearing messages)
  - `sock.groupSettingUpdate(jid, setting)` — lock/unlock settings

  #### Anti-Feature Helpers (Group Moderation)
  ```js
  const { isAntiLink, isAntiSticker, isAntiImage, isAntiVideo, isAntiAudio,
          isAntiDocument, isAntiViewOnce, isAntiBug, isAntiFiles,
          getMessageType, hasLink, extractLinks,
          isSticker, isImage, isVideo, isAudio, isDocument,
          isViewOnce, isReaction, isPoll, isGif, isForwarded,
          LINK_REGEX } = require('davexbaileys');

  sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (msg.key.fromMe || !msg.key.remoteJid.endsWith('@g.us')) return;

      if (isAntiLink(msg))    { /* delete message, warn user */ }
      if (isAntiSticker(msg)) { /* no stickers allowed */ }
      if (isAntiImage(msg))   { /* no images */ }
      if (isAntiVideo(msg))   { /* no videos */ }
      if (isAntiAudio(msg))   { /* no voice notes */ }
      if (isAntiDocument(msg)){ /* no documents */ }
      if (isAntiViewOnce(msg)){ /* no view-once messages */ }
      if (isAntiBug(msg))     { /* potential crash message */ }
      if (isAntiFiles(msg))   { /* no files of any kind */ }

      console.log('Message type:', getMessageType(msg));
  });
  ```

  #### Anti-Group-Mention (detect group JIDs in messages/statuses)
  ```js
  const { isAntiGroupMention, getGroupMentions } = require('davexbaileys');

  // true if any @g.us JID is mentioned in the message
  if (isAntiGroupMention(msg)) {
      const groups = getGroupMentions(msg); // array of group JIDs mentioned
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Group mentions are not allowed!' });
  }
  ```

  ---

  ### Newsletter (Channel) Commands
  | Method | Description |
  |--------|-------------|
  | `sock.newsletterCreate(name, desc)` | Create a channel |
  | `sock.newsletterFollow(jid)` | Follow a channel |
  | `sock.newsletterUnfollow(jid)` | Unfollow |
  | `sock.newsletterMute(jid)` | Mute a channel |
  | `sock.newsletterUnmute(jid)` | Unmute |
  | `sock.newsletterMetadata(type, key)` | Get channel metadata |
  | `sock.newsletterSubscribers(jid)` | Get subscribers |
  | `sock.newsletterReactMessage(jid, serverId, emoji)` | React to a post |
  | `sock.newsletterFetchMessages(jid, count, since)` | Fetch posts |
  | `sock.newsletterUpdateName(jid, name)` | Update channel name |
  | `sock.newsletterUpdateDescription(jid, desc)` | Update description |
  | `sock.newsletterUpdatePicture(jid, buffer)` | Update channel photo |
  | `sock.newsletterRemovePicture(jid)` | Remove channel photo |
  | `sock.newsletterDelete(jid)` | Delete channel |
  | `sock.newsletterChangeOwner(jid, newOwnerJid)` | Transfer ownership |
  | `sock.subscribeNewsletterUpdates(jid)` | Subscribe to live updates |

  **Events:**
  ```js
  sock.ev.on('newsletter.reaction', ({ id, server_id, reaction }) => {});
  sock.ev.on('newsletter.view',     ({ id, server_id, count }) => {});
  sock.ev.on('newsletter-participants.update', update => {});
  sock.ev.on('newsletter-settings.update',    update => {});
  ```

  > Auto-react: davexbaileys automatically reacts 👍 to new posts from the Dave Tech channel.

  ---

  ### WhatsApp Business
  - `sock.getCatalog({ jid, limit, cursor })`
  - `sock.getCollections(jid, limit)`
  - `sock.getOrderDetails(orderId, tokenBase64)`
  - `sock.getBusinessProfile(jid)`
  - `sock.addOrEditQuickReply(quickReply)` — business quick replies
  - `sock.removeQuickReply(timestamp)`

  ---

  ### Link Preview
  ```js
  // Enable rich link previews:
  const sock = makeWASocket({ generateHighQualityLinkPreview: true, ... });

  // Disable link previews in your account settings:
  await sock.updateDisableLinkPreviewsPrivacy(true);

  // Utility helper (basic preview object):
  const { generateLinkPreview } = require('davexbaileys');
  const preview = generateLinkPreview('https://example.com', 'Example', 'Description');
  ```

  ---

  ## Author

  **Dave Tech**  
  GitHub: [Davex-254](https://github.com/Davex-254)  
  Channel: [Dave Tech on WhatsApp](https://whatsapp.com/channel/0029Vb6wIVU9Bb5w69FQvt0W)

  ## License

  MIT
  