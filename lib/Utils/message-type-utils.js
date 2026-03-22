"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIncomingCall = exports.isVideoCall = exports.isAntiCall = exports.isGroupCall = exports.getActionParticipants = exports.isAntiDemote = exports.isAntiPromote = exports.getMessageType = exports.generateLinkPreview = exports.isAntiBot = exports.isAntiFiles = exports.isAntiBug = exports.isAntiViewOnce = exports.isAntiDocument = exports.isAntiVideo = exports.isAntiAudio = exports.isAntiImage = exports.isAntiSticker = exports.isAntiLink = exports.isViewOnce = exports.isDocument = exports.isVideo = exports.isAudio = exports.isImage = exports.isSticker = exports.isGif = exports.isReaction = exports.isPoll = exports.isLocation = exports.isContact = exports.isLiveLocation = exports.isButton = exports.isForwarded = exports.extractLinks = exports.hasLink = exports.LINK_REGEX = void 0;

// ─── link regex ─────────────────────────────────────────────────────────────
//
// Comprehensive URL/link detection regex.
// Covers:
//   • http:// / https:// / ftp:// — full URLs with or without path/query
//   • www.domain.com — bare www prefix
//   • WhatsApp-specific:  chat.whatsapp.com  /  wa.me  /  whatsapp.com
//   • Common messaging/social: t.me  discord.gg  bit.ly  tinyurl.com
//   • Any two-part domain like  example.co.uk  foo.io  bar.xyz
//
// How it works with hasLink / extractLinks:
//   LINK_REGEX is global (g flag). Always reset lastIndex before calling .test()
//   because global regexes maintain state between calls. The helpers do this for you.

const LINK_REGEX = /(?:(?:https?|ftp):\/\/(?:www\.)?|www\.)[-a-z0-9@:%._+~#=]{1,256}\.(?:com|net|org|edu|gov|io|co|app|ly|me|gg|xyz|info|biz|tv|cc|uk|ng|ke|tz|gh|za|us|ca|de|fr|br|in|pk|bd|ph|id|vn|ru|tr|mx|ar|au|nz|eu|mobi|tech|online|site|web|store|shop|link|click|live|news|media|digital|cloud|dev|ai|bot|api|chat|social|group|team|chat|wa|app|web|blog|page|tk|ml|ga|cf|gq)(?::[0-9]{1,5})?(?:\/[^\s<>'"(){}|\\^[\]`]*)?/gi;
exports.LINK_REGEX = LINK_REGEX;

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the innermost / normalised message content object.
 * Unwraps ephemeral, view-once, documentWithCaption, and editedMessage wrappers
 * exactly as official Baileys does internally.
 */
const normalise = (msg) => {
    const m = (msg === null || msg === void 0 ? void 0 : msg.message) || msg;
    if (!m) return null;
    return m.ephemeralMessage?.message
        || m.viewOnceMessage?.message
        || m.viewOnceMessageV2?.message
        || m.viewOnceMessageV2Extension?.message
        || m.documentWithCaptionMessage?.message
        || m.editedMessage?.message?.protocolMessage?.editedMessage
        || m;
};

/**
 * Get the caption or text body from any supported message type.
 * Checks: plain text, extendedText, image/video/document/audio captions.
 */
const getCaption = (msg) => {
    const m = normalise(msg);
    if (!m) return '';
    return m.conversation
        || m.extendedTextMessage?.text
        || m.imageMessage?.caption
        || m.videoMessage?.caption
        || m.documentMessage?.caption
        || m.audioMessage?.caption
        || '';
};

// ─── link detection ──────────────────────────────────────────────────────────

/**
 * Returns true if the message body contains any URL or link.
 * Resets LINK_REGEX.lastIndex before every call (required for global /g regex).
 */
const hasLink = (msg) => {
    const text = getCaption(msg);
    if (!text) return false;
    LINK_REGEX.lastIndex = 0;
    return LINK_REGEX.test(text);
};
exports.hasLink = hasLink;

/**
 * Returns all URLs found in the message (empty array = none).
 * Resets LINK_REGEX.lastIndex before every call.
 */
const extractLinks = (msg) => {
    const text = getCaption(msg);
    if (!text) return [];
    LINK_REGEX.lastIndex = 0;
    return text.match(LINK_REGEX) || [];
};
exports.extractLinks = extractLinks;

// ─── message type detectors ──────────────────────────────────────────────────
//
// All functions accept a full WebMessageInfo object (from messages.upsert) OR
// the raw message content object — both work because of the normalise() helper.

const isSticker      = (msg) => !!(normalise(msg)?.stickerMessage);
const isImage        = (msg) => !!(normalise(msg)?.imageMessage);
const isVideo        = (msg) => {
    const m = normalise(msg);
    // gif is technically a video — exclude gif from isVideo so they don't double-match
    return !!(m?.videoMessage) && !m?.videoMessage?.gifPlayback;
};
const isAudio        = (msg) => !!(normalise(msg)?.audioMessage);
const isDocument     = (msg) => !!(normalise(msg)?.documentMessage || normalise(msg)?.documentWithCaptionMessage);
const isLocation     = (msg) => !!(normalise(msg)?.locationMessage || normalise(msg)?.liveLocationMessage);
const isLiveLocation = (msg) => !!(normalise(msg)?.liveLocationMessage);
const isContact      = (msg) => !!(normalise(msg)?.contactMessage || normalise(msg)?.contactsArrayMessage);
const isReaction     = (msg) => !!(normalise(msg)?.reactionMessage);
const isPoll         = (msg) => !!(normalise(msg)?.pollCreationMessage || normalise(msg)?.pollCreationMessageV2 || normalise(msg)?.pollCreationMessageV3);
const isGif          = (msg) => {
    const m = normalise(msg);
    return !!(m?.videoMessage?.gifPlayback || m?.gifMessage);
};
const isButton       = (msg) => {
    const m = normalise(msg);
    return !!(m?.buttonsMessage || m?.templateMessage || m?.interactiveMessage || m?.listMessage);
};
const isForwarded    = (msg) => {
    const m = normalise(msg);
    // contextInfo.forwardingScore > 0 means the message was forwarded
    // chain on contextInfo objects (undefined = falsy → || falls through correctly)
    const ctx = m?.extendedTextMessage?.contextInfo
        || m?.imageMessage?.contextInfo
        || m?.videoMessage?.contextInfo
        || m?.documentMessage?.contextInfo
        || m?.audioMessage?.contextInfo
        || m?.stickerMessage?.contextInfo;
    return !!((ctx?.forwardingScore) ?? 0);
};
const isViewOnce     = (msg) => {
    // view-once wrapper lives on the outer message object, not inside normalise()
    const m = (msg === null || msg === void 0 ? void 0 : msg.message) || msg;
    return !!(m?.viewOnceMessage || m?.viewOnceMessageV2 || m?.viewOnceMessageV2Extension);
};

exports.isSticker      = isSticker;
exports.isImage        = isImage;
exports.isVideo        = isVideo;
exports.isAudio        = isAudio;
exports.isDocument     = isDocument;
exports.isLocation     = isLocation;
exports.isLiveLocation = isLiveLocation;
exports.isContact      = isContact;
exports.isReaction     = isReaction;
exports.isPoll         = isPoll;
exports.isGif          = isGif;
exports.isButton       = isButton;
exports.isForwarded    = isForwarded;
exports.isViewOnce     = isViewOnce;

// ─── anti-feature detectors ───────────────────────────────────────────────────
//
// All antiX functions take a WebMessageInfo object from messages.upsert.
// They return true if the message matches the policy and should be actioned.

/** Anti-link: message contains a URL or link */
const isAntiLink     = (msg) => hasLink(msg);
/** Anti-sticker: message is a sticker */
const isAntiSticker  = (msg) => isSticker(msg);
/** Anti-image: message is an image (not gif) */
const isAntiImage    = (msg) => isImage(msg);
/** Anti-video: message is a video (not gif) */
const isAntiVideo    = (msg) => isVideo(msg);
/** Anti-audio: message is a voice/audio note */
const isAntiAudio    = (msg) => isAudio(msg);
/** Anti-document: message is a document/file */
const isAntiDocument = (msg) => isDocument(msg);
/** Anti-viewonce: message is a view-once (disappearing) message */
const isAntiViewOnce = (msg) => isViewOnce(msg);

/**
 * Anti-bug: detect crash / malicious messages.
 * Checks for:
 *   1. Zero-width / invisible Unicode characters used in WhatsApp crash exploits
 *   2. RTL override characters (Unicode bidi abuse)
 *   3. Suspiciously long words with no spaces (common in crash-string payloads)
 */
const isAntiBug = (msg) => {
    const text = getCaption(msg);
    if (!text) return false;
    if (/[\u200e\u200f\u200b\u200c\u200d\ufeff\u2028\u2029]/g.test(text)) return true;
    if (/[\u202a-\u202e\u2066-\u2069]/g.test(text)) return true;
    if (text.length > 2000 && !text.includes(' ')) return true;
    return false;
};

/**
 * Anti-files: message is ANY file type
 * (image, video, audio, document, sticker — but NOT gif or viewonce separately).
 * Use as a catch-all to block all media uploads.
 */
const isAntiFiles = (msg) => isDocument(msg) || isAudio(msg) || isVideo(msg) || isImage(msg) || isSticker(msg) || isGif(msg);

/**
 * Anti-bot: detect messages that appear to be from a bot or auto-responder.
 * Checks:
 *   1. message.key.fromMe is true (sent by self/bot)
 *   2. message key participant is a known bot JID (@bot)
 *   3. The message key remoteJid ends with @bot
 *   4. Message contains typical bot-auto-reply markers
 *
 * Useful in group bots to prevent bot-on-bot loops.
 */
const isAntiBot = (msg) => {
    if (!msg) return false;
    const jid = msg.key?.remoteJid || '';
    const participant = msg.key?.participant || '';
    if (jid.endsWith('@bot') || participant.endsWith('@bot')) return true;
    // fromMe = the bot itself sent this (loop guard)
    if (msg.key?.fromMe === true) return true;
    return false;
};

exports.isAntiLink     = isAntiLink;
exports.isAntiSticker  = isAntiSticker;
exports.isAntiImage    = isAntiImage;
exports.isAntiVideo    = isAntiVideo;
exports.isAntiAudio    = isAntiAudio;
exports.isAntiDocument = isAntiDocument;
exports.isAntiViewOnce = isAntiViewOnce;
exports.isAntiBug      = isAntiBug;
exports.isAntiFiles    = isAntiFiles;
exports.isAntiBot      = isAntiBot;

// ─── getMessageType ───────────────────────────────────────────────────────────

/**
 * Returns a human-readable type string for any message.
 * Useful for switch/case routing in bot handlers.
 */
const getMessageType = (msg) => {
    if (isViewOnce(msg))      return 'viewonce';
    if (isGif(msg))           return 'gif';
    if (isSticker(msg))       return 'sticker';
    if (isImage(msg))         return 'image';
    if (isVideo(msg))         return 'video';
    if (isAudio(msg))         return 'audio';
    if (isDocument(msg))      return 'document';
    if (isReaction(msg))      return 'reaction';
    if (isPoll(msg))          return 'poll';
    if (isLiveLocation(msg))  return 'liveLocation';
    if (isLocation(msg))      return 'location';
    if (isContact(msg))       return 'contact';
    if (isButton(msg))        return 'button';
    const m = normalise(msg);
    if (m?.conversation || m?.extendedTextMessage) {
        return hasLink(msg) ? 'text-with-link' : 'text';
    }
    return 'unknown';
};
exports.getMessageType = getMessageType;

/**
 * Generate a simple link preview object for a given URL.
 * Shape matches what Baileys expects in extendedTextMessage.contextInfo.
 * For full rich previews use makeWASocket({ generateHighQualityLinkPreview: true }).
 */
const generateLinkPreview = (url, title, description, thumbnailUrl) => {
    return {
        matchedText: url,
        canonicalUrl: url,
        title: title || url,
        description: description || '',
        jpegThumbnail: undefined,
        highQualityThumbnail: thumbnailUrl ? { url: thumbnailUrl } : undefined
    };
};
exports.generateLinkPreview = generateLinkPreview;

// ─── group-participants.update detectors ─────────────────────────────────────
//
// Source: lib/Utils/process-message.js (official Baileys)
//   emitParticipantsUpdate = (action) =>
//     ev.emit('group-participants.update', { id, author, participants, action })
//
// Event shape:
//   id           — group JID
//   author       — JID of who performed the action
//   participants — string[] of JIDs affected
//   action       — 'promote' | 'demote' | 'add' | 'remove' | 'leave' | 'modify'
//
// Usage:
//   sock.ev.on('group-participants.update', async (update) => {
//     if (isAntiPromote(update)) { /* undo it */ }
//     if (isAntiDemote(update))  { /* undo it */ }
//     const affected = getActionParticipants(update); // array of JIDs
//   });

const isAntiPromote       = (update) => (update?.action) === 'promote';
const isAntiDemote        = (update) => (update?.action) === 'demote';
const getActionParticipants = (update) => update?.participants || [];

exports.isAntiPromote       = isAntiPromote;
exports.isAntiDemote        = isAntiDemote;
exports.getActionParticipants = getActionParticipants;

// ─── call detectors ───────────────────────────────────────────────────────────
//
// Source: lib/Socket/messages-recv.js  handleCall() (official Baileys / gifted-baileys)
//
// Event shape (call object from ev.emit('call', [call])):
//   call.chatId   — remoteJid of where the call came in (group or user)
//   call.from     — caller JID
//   call.id       — unique call id
//   call.status   — 'offer' | 'accept' | 'reject' | 'timeout' | 'terminate'
//   call.isVideo  — true for video call
//   call.isGroup  — true when call is FROM a group (official flag, set from 'group-jid' attr)
//   call.groupJid — group JID if isGroup
//   call.offline  — received while bot was offline
//
// To reject:  await sock.rejectCall(call.id, call.from)
//
// Usage:
//   sock.ev.on('call', async (calls) => {
//     for (const call of calls) {
//       if (isAntiCall(call) && call.status === 'offer') {
//         await sock.rejectCall(call.id, call.from);
//       }
//     }
//   });

/**
 * Returns true if the call is a GROUP call.
 * Uses official Baileys call.isGroup flag (set from the binary node 'group-jid' attr).
 */
const isGroupCall    = (call) => !!(call?.isGroup);
/** Alias: same as isGroupCall, antiCall naming convention */
const isAntiCall     = isGroupCall;
/** Returns true if the call is a video call (group or private) */
const isVideoCall    = (call) => !!(call?.isVideo);
/** Returns true if the call is a new incoming offer (not accept/reject/timeout) */
const isIncomingCall = (call) => (call?.status) === 'offer';

exports.isGroupCall    = isGroupCall;
exports.isAntiCall     = isAntiCall;
exports.isVideoCall    = isVideoCall;
exports.isIncomingCall = isIncomingCall;
