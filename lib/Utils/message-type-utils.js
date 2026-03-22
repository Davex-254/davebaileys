"use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getMessageType = exports.generateLinkPreview = exports.isAntiFiles = exports.isAntiBug = exports.isAntiViewOnce = exports.isAntiDocument = exports.isAntiVideo = exports.isAntiAudio = exports.isAntiImage = exports.isAntiSticker = exports.isAntiLink = exports.isViewOnce = exports.isDocument = exports.isVideo = exports.isAudio = exports.isImage = exports.isSticker = exports.isGif = exports.isReaction = exports.isPoll = exports.isLocation = exports.isContact = exports.isLiveLocation = exports.isButton = exports.isForwarded = exports.hasLink = exports.LINK_REGEX = void 0;

  /**
   * Regex to detect URLs/links in messages (same pattern as official Baileys internals)
   * Matches http(s), ftp links and bare domains like example.com
   */
  const LINK_REGEX = /(?:(?:https?|ftp):\/\/|www\.)[a-z0-9-]+(?:\.[a-z0-9-]+)*(?::[0-9]+)?(?:\/[^\s]*)?/gi;
  exports.LINK_REGEX = LINK_REGEX;

  // ─── helpers ────────────────────────────────────────────────────────────────

  /**
   * Extract the innermost/normalised message content object
   */
  const normalise = (msg) => {
      var _a;
      const m = (msg === null || msg === void 0 ? void 0 : msg.message) || msg;
      if (!m) return null;
      // unwrap ephemeral / view-once / document-with-caption wrappers
      return m.ephemeralMessage?.message
          || m.viewOnceMessage?.message
          || m.viewOnceMessageV2?.message
          || m.viewOnceMessageV2Extension?.message
          || m.documentWithCaptionMessage?.message
          || m.editedMessage?.message?.protocolMessage?.editedMessage
          || m;
  };

  /**
   * Get the caption/text from any message type
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

  // ─── link detection ─────────────────────────────────────────────────────────

  /**
   * Returns true if the message body contains a URL/link
   */
  const hasLink = (msg) => {
      const text = getCaption(msg);
      LINK_REGEX.lastIndex = 0;
      return LINK_REGEX.test(text);
  };
  exports.hasLink = hasLink;

  /**
   * Extract all URLs from a message (returns empty array if none)
   */
  const extractLinks = (msg) => {
      const text = getCaption(msg);
      return text.match(LINK_REGEX) || [];
  };
  exports.extractLinks = extractLinks;

  // ─── type checks (return true/false) ────────────────────────────────────────

  const isSticker  = (msg) => !!(normalise(msg)?.stickerMessage);
  const isImage    = (msg) => !!(normalise(msg)?.imageMessage);
  const isVideo    = (msg) => !!(normalise(msg)?.videoMessage);
  const isAudio    = (msg) => !!(normalise(msg)?.audioMessage);
  const isDocument = (msg) => !!(normalise(msg)?.documentMessage || normalise(msg)?.documentWithCaptionMessage);
  const isLocation = (msg) => !!(normalise(msg)?.locationMessage || normalise(msg)?.liveLocationMessage);
  const isLiveLocation = (msg) => !!(normalise(msg)?.liveLocationMessage);
  const isContact  = (msg) => !!(normalise(msg)?.contactMessage || normalise(msg)?.contactsArrayMessage);
  const isReaction = (msg) => !!(normalise(msg)?.reactionMessage);
  const isPoll     = (msg) => !!(normalise(msg)?.pollCreationMessage || normalise(msg)?.pollCreationMessageV2 || normalise(msg)?.pollCreationMessageV3);
  const isGif      = (msg) => {
      const m = normalise(msg);
      return !!(m?.videoMessage?.gifPlayback || m?.gifMessage);
  };
  const isButton   = (msg) => {
      const m = normalise(msg);
      return !!(m?.buttonsMessage || m?.templateMessage || m?.interactiveMessage || m?.listMessage);
  };
  const isForwarded = (msg) => {
      var _a, _b, _c;
      const m = normalise(msg);
      const ctx = m?.extendedTextMessage?.contextInfo
          || m?.imageMessage?.contextInfo
          || m?.videoMessage?.contextInfo
          || m?.documentMessage?.contextInfo
          || m?.audioMessage?.contextInfo
          || m?.stickerMessage?.contextInfo;
      return !!((_a = ctx?.forwardingScore) !== null && _a !== void 0 ? _a : 0);
  };

  /**
   * Returns true if the message is a view-once message
   */
  const isViewOnce = (msg) => {
      const m = msg?.message || msg;
      return !!(m?.viewOnceMessage || m?.viewOnceMessageV2 || m?.viewOnceMessageV2Extension);
  };

  exports.isSticker  = isSticker;
  exports.isImage    = isImage;
  exports.isVideo    = isVideo;
  exports.isAudio    = isAudio;
  exports.isDocument = isDocument;
  exports.isLocation = isLocation;
  exports.isLiveLocation = isLiveLocation;
  exports.isContact  = isContact;
  exports.isReaction = isReaction;
  exports.isPoll     = isPoll;
  exports.isGif      = isGif;
  exports.isButton   = isButton;
  exports.isForwarded = isForwarded;
  exports.isViewOnce = isViewOnce;

  // ─── anti-feature detectors ──────────────────────────────────────────────────

  /** Anti-link: message has a URL → true */
  const isAntiLink     = (msg) => hasLink(msg);
  /** Anti-sticker: message is a sticker → true */
  const isAntiSticker  = (msg) => isSticker(msg);
  /** Anti-image: message is an image → true */
  const isAntiImage    = (msg) => isImage(msg);
  /** Anti-video: message is a video → true */
  const isAntiVideo    = (msg) => isVideo(msg);
  /** Anti-audio: message is a voice/audio note → true */
  const isAntiAudio    = (msg) => isAudio(msg);
  /** Anti-document: message is a document/file → true */
  const isAntiDocument = (msg) => isDocument(msg);
  /** Anti-viewonce: message is a view-once message → true */
  const isAntiViewOnce = (msg) => isViewOnce(msg);
  /**
   * Anti-bug: detect potentially malicious/crash messages.
   * Checks for zero-width characters, extremely long strings, or malformed content.
   */
  const isAntiBug = (msg) => {
      const text = getCaption(msg);
      if (!text) return false;
      // zero-width / invisible chars used in crash messages
      if (/[\u200e\u200f\u200b\u200c\u200d\ufeff\u2028\u2029]/g.test(text)) return true;
      // suspiciously long single "word" with no spaces
      if (text.length > 2000 && !text.includes(' ')) return true;
      // RTL override characters
      if (/[\u202a-\u202e]/g.test(text)) return true;
      return false;
  };
  /**
   * Anti-files: message contains ANY file type (doc, audio, video, image, sticker)
   */
  const isAntiFiles    = (msg) => isDocument(msg) || isAudio(msg) || isVideo(msg) || isImage(msg) || isSticker(msg);

  exports.isAntiLink     = isAntiLink;
  exports.isAntiSticker  = isAntiSticker;
  exports.isAntiImage    = isAntiImage;
  exports.isAntiVideo    = isAntiVideo;
  exports.isAntiAudio    = isAntiAudio;
  exports.isAntiDocument = isAntiDocument;
  exports.isAntiViewOnce = isAntiViewOnce;
  exports.isAntiBug      = isAntiBug;
  exports.isAntiFiles    = isAntiFiles;

  // ─── getMessageType ──────────────────────────────────────────────────────────

  /**
   * Returns a human-readable type string for the message
   */
  const getMessageType = (msg) => {
      if (isSticker(msg))    return 'sticker';
      if (isImage(msg))      return 'image';
      if (isGif(msg))        return 'gif';
      if (isVideo(msg))      return 'video';
      if (isAudio(msg))      return 'audio';
      if (isDocument(msg))   return 'document';
      if (isViewOnce(msg))   return 'viewonce';
      if (isReaction(msg))   return 'reaction';
      if (isPoll(msg))       return 'poll';
      if (isLocation(msg))   return 'location';
      if (isLiveLocation(msg)) return 'liveLocation';
      if (isContact(msg))    return 'contact';
      if (isButton(msg))     return 'button';
      const m = normalise(msg);
      if (m?.conversation || m?.extendedTextMessage) {
          if (hasLink(msg)) return 'text-with-link';
          return 'text';
      }
      return 'unknown';
  };
  exports.getMessageType = getMessageType;

  /**
   * Generate a simple link preview object for a URL.
   * For rich previews, pass generateHighQualityLinkPreview: true in makeWASocket config.
   * @param url - URL to generate preview for
   * @param title - optional title
   * @param description - optional description
   * @param thumbnailUrl - optional thumbnail image URL
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
  