const lib = require('./lib/index.js');

let passed = 0;
let failed = 0;

function check(label, condition) {
    if (condition) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.log(`  ✗ ${label}`);
        failed++;
    }
}

console.log('\n=== davebaileys verification ===\n');

// ── 1. Core exports ──────────────────────────────────────────────────────────
console.log('1. Core exports');
const coreExports = [
    'makeWASocket', 'useMultiFileAuthState', 'DisconnectReason',
    'Browsers', 'proto', 'BufferJSON', 'WAProto',
    'normalizeMessageContent', 'extractMessageContent', 'getContentType',
    'downloadMediaMessage', 'generateWAMessage', 'generateWAMessageContent',
    'prepareWAMessageMedia', 'generateForwardMessageContent',
    'decryptMessageNode', 'decodeMessageNode',
    'isJidGroup', 'isJidUser', 'isJidNewsletter', 'isJidBot',
    'isLidUser', 'jidNormalizedUser', 'jidEncode', 'jidDecode',
    'areJidsSameUser', 'S_WHATSAPP_NET',
    'ALL_WA_PATCH_NAMES', 'XWAPaths', 'QueryIds',
    'WAMessageStatus', 'WAMessageStubType',
    'makeCacheableSignalKeyStore', 'initAuthCreds',
    'globalLidMapping', 'createLidMappingStore',
    'encodeSyncdPatch', 'decodeSyncdPatch',
    'getUrlInfo', 'makeEventBuffer',
    'NO_MESSAGE_FOUND_ERROR_TEXT', 'MISSING_KEYS_ERROR_TEXT', 'NACK_REASONS'
];
for (const name of coreExports) {
    check(name, typeof lib[name] !== 'undefined');
}

// ── 2. makeWASocket builds a socket object ───────────────────────────────────
console.log('\n2. Socket object');
const { makeWASocket, useMultiFileAuthState, initAuthCreds, makeCacheableSignalKeyStore } = lib;

// Build a minimal in-memory auth state so makeWASocket doesn't need real files
const memKeys = {};
const memState = {
    creds: initAuthCreds(),
    keys: makeCacheableSignalKeyStore({
        get: async (type, ids) => {
            const data = {};
            for (const id of ids) data[id] = (memKeys[type] || {})[id];
            return data;
        },
        set: async (data) => {
            for (const [type, vals] of Object.entries(data)) {
                memKeys[type] = memKeys[type] || {};
                Object.assign(memKeys[type], vals);
            }
        }
    }, lib.pino ? lib.pino({ level: 'silent' }) : console)
};

let sock;
try {
    const pino = require('pino');
    sock = makeWASocket({
        auth: memState,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: lib.Browsers.ubuntu('TestBot'),
        connectTimeoutMs: 100
    });
    check('makeWASocket() returns object', typeof sock === 'object' && sock !== null);
} catch (e) {
    check('makeWASocket() returns object', false);
    console.log('    Error:', e.message);
}

if (sock) {
    // Core send/recv functions
    const socketFns = [
        'sendMessage', 'relayMessage', 'sendPresenceUpdate',
        'updateProfileName', 'updateProfileStatus', 'updateProfilePicture',
        'removeProfilePicture', 'profilePictureUrl',
        'updateLastSeenPrivacy', 'updateOnlinePrivacy',
        'updateProfilePicturePrivacy', 'updateStatusPrivacy',
        'updateReadReceiptsPrivacy', 'updateGroupsAddPrivacy',
        'fetchPrivacySettings',
        'readMessages', 'pinChat', 'archiveChat', 'chatModify',
        'groupCreate', 'groupMetadata', 'groupParticipantsUpdate',
        'groupUpdateSubject', 'groupUpdateDescription', 'groupSettingUpdate',
        'groupInviteCode', 'groupAcceptInvite', 'groupLeave',
        'groupFetchAllParticipating',
        'newsletterMetadata', 'newsletterFollow', 'newsletterUnfollow',
        'newsletterMute', 'newsletterUnmute', 'newsletterCreate',
        'newsletterUpdate', 'newsletterDelete',
        'updateBussinesProfile',
        'addOrEditContact', 'removeContact',
        'createCallLink',
        'editMessage', 'sendToStatus', 'reshare'
    ];
    console.log('\n3. Socket functions');
    for (const fn of socketFns) {
        check(fn, typeof sock[fn] === 'function');
    }

    // antiUtils
    console.log('\n4. antiUtils checkers');
    const au = sock.antiUtils;
    check('antiUtils exists', typeof au === 'object' && au !== null);
    const checkers = [
        'isStatus', 'isSticker', 'isImage', 'isAudio', 'isVideo',
        'isDocument', 'isContact', 'isLocation', 'isGif',
        'isViewOnce', 'isForwarded', 'isFromBot',
        'hasLink', 'hasMention', 'hasGroupMention',
        'isBugMessage', 'isVirtex',
        'getText', 'getType'
    ];
    for (const fn of checkers) {
        check(fn, typeof au?.[fn] === 'function');
    }

    // antiUtils correctness with real-ish messages
    console.log('\n5. antiUtils correctness');
    const fakeText = { message: { conversation: 'hello world' } };
    const fakeLink = { message: { conversation: 'check https://wa.me/254700000000' } };
    const fakeMention = { message: { extendedTextMessage: { text: 'hi', contextInfo: { mentionedJid: ['254700000000@s.whatsapp.net'] } } } };
    const fakeGroupMention = { message: { extendedTextMessage: { text: 'hi', contextInfo: { mentionedJid: ['123@g.us'] } } } };
    const fakeViewOnce = { message: { viewOnceMessage: { message: { imageMessage: {} } } } };
    const fakeSticker = { message: { stickerMessage: { fileSha256: Buffer.alloc(32) } } };
    const fakeForwarded = { message: { extendedTextMessage: { text: 'fwd', contextInfo: { isForwarded: true } } } };
    const fakeStatus = { key: { remoteJid: 'status@broadcast' } };
    const fakeBot = { key: { participant: '13135550001@c.us' } };
    const fakeBug = { message: { conversation: 'hello\u0000world' } };
    const fakeVirtex = { message: { conversation: '\u202e'.repeat(10) } };

    check('getText("hello world")', au.getText(fakeText) === 'hello world');
    check('getType(text) === "text"', au.getType(fakeText) === 'text');
    check('getType(sticker) === "sticker"', au.getType(fakeSticker) === 'sticker');
    check('hasLink detects https://wa.me', au.hasLink(fakeLink) === true);
    check('hasLink(plain text) = false', au.hasLink(fakeText) === false);
    check('hasMention detects @user', au.hasMention(fakeMention) === true);
    check('hasMention(no mentions) = false', au.hasMention(fakeText) === false);
    check('hasGroupMention detects @g.us', au.hasGroupMention(fakeGroupMention) === true);
    check('hasGroupMention(@user) = false', au.hasGroupMention(fakeMention) === false);
    check('isViewOnce(viewOnceMessage)', au.isViewOnce(fakeViewOnce) === true);
    check('isViewOnce(plain text) = false', au.isViewOnce(fakeText) === false);
    check('isSticker(stickerMessage)', au.isSticker(fakeSticker) === true);
    check('isForwarded(forwarded msg)', au.isForwarded(fakeForwarded) === true);
    check('isStatus(status@broadcast)', au.isStatus(fakeStatus) === true);
    check('isFromBot(bot jid)', au.isFromBot(fakeBot) === true);
    check('isFromBot(normal user) = false', au.isFromBot({ key: { participant: '254700000000@s.whatsapp.net' } }) === false);
    check('isBugMessage(null byte)', au.isBugMessage(fakeBug) === true);
    check('isBugMessage(normal) = false', au.isBugMessage(fakeText) === false);
    check('isVirtex(RTL overrides)', au.isVirtex(fakeVirtex) === true);
    check('isVirtex(normal) = false', au.isVirtex(fakeText) === false);

    // extractGroupMetadata addressing mode fix
    console.log('\n6. extractGroupMetadata addressingMode');
    const { extractGroupMetadata } = require('./lib/Socket/groups.js');
    const mockGroupNode = {
        content: [{
            tag: 'group',
            attrs: {
                id: '123456789@g.us',
                subject: 'Test Group',
                s_o: '254700000000@s.whatsapp.net',
                s_t: '1700000000',
                creation: '1700000000',
                addressing_mode: 'lid'
            },
            content: []
        }]
    };
    try {
        const meta = extractGroupMetadata(mockGroupNode);
        check('addressingMode keeps original case ("lid")', meta.addressingMode === 'lid');
        check('addressingMode not uppercased to "LID"', meta.addressingMode !== 'LID');
        check('id is set', !!meta.id);
        check('subject is set', meta.subject === 'Test Group');
        check('participants is array', Array.isArray(meta.participants));
    } catch (e) {
        check('extractGroupMetadata runs without error', false);
        console.log('    Error:', e.message);
    }

    // pn group (no addressing_mode defaults to "pn")
    const mockPnGroupNode = {
        content: [{
            tag: 'group',
            attrs: { id: '987654321@g.us', subject: 'PN Group', s_o: '254700000000@s.whatsapp.net', s_t: '1700000000', creation: '1700000000' },
            content: []
        }]
    };
    try {
        const meta = extractGroupMetadata(mockPnGroupNode);
        check('addressingMode defaults to "pn" when unset', meta.addressingMode === 'pn');
    } catch (e) {
        check('extractGroupMetadata PN group runs', false);
    }

    // close the socket cleanly
    try { sock.ws?.close(); } catch {}
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`Passed: ${passed}   Failed: ${failed}   Total: ${passed + failed}`);
if (failed === 0) {
    console.log('\n✅ All checks passed — library is ready.\n');
} else {
    console.log('\n⚠️  Some checks failed — see above.\n');
    process.exit(1);
}
