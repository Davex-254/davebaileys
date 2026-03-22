"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupMentions = exports.isAntiGroupMention = exports.extractGroupMetadata = exports.makeGroupsSocket = void 0;
const WAProto_1 = require("../../WAProto");
const Types_1 = require("../Types");
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const chats_1 = require("./chats");

  // ─── isAntiGroupMention / getGroupMentions ─────────────────────────────────
  //
  // CORRECT MEANING (clarified from official WhatsApp bot implementations):
  //
  //   "Anti Group Mention" = detect when someone posts a PRIVATE STATUS UPDATE
  //   (remoteJid === 'status@broadcast') that @-mentions a GROUP JID (@g.us).
  //
  //   • In WhatsApp, when you write a status and tag a group using @, that group's
  //     JID (ending in @g.us) appears in contextInfo.mentionedJid of the status message.
  //   • Bots use this to detect when their group is being mentioned in someone's status,
  //     or to prevent members from posting statuses that mention other groups.
  //   • This is NOT about messages sent inside a group — it is about STATUS messages
  //     that contain a group @-mention.
  //
  // How WhatsApp status messages work in Baileys:
  //   message.key.remoteJid === 'status@broadcast'   (STORIES_JID from jid-utils.js)
  //   message.key.participant === '2547xxx@s.whatsapp.net'  (who posted the status)
  //
  // Source for mentionedJid: official Baileys Utils/messages.js line 481:
  //   key.contextInfo.mentionedJid = message.mentions;
  //
  // Source for STORIES_JID: official Baileys WABinary/jid-utils.js line 8:
  //   exports.STORIES_JID = 'status@broadcast';
  //   exports.isJidStatusBroadcast = (jid) => jid === 'status@broadcast';
  //
  // Usage:
  //   sock.ev.on('messages.upsert', async ({ messages }) => {
  //     for (const msg of messages) {
  //       if (isAntiGroupMention(msg)) {
  //         // msg.key.participant = the person who posted the status
  //         // getGroupMentions(msg) = array of @g.us JIDs they tagged
  //         console.log('Status mentions groups:', getGroupMentions(msg));
  //       }
  //     }
  //   });

  const STORIES_JID = 'status@broadcast';

  /**
   * Extract all group JIDs (@g.us) mentioned in a STATUS message's contextInfo.mentionedJid.
   *
   * Works on all message types that can appear in a status:
   *   extendedText, image, video, document, audio, sticker.
   *
   * Bug-fixed in v2.5.18/v2.5.19:
   *   Chains on contextInfo OBJECTS (undefined = falsy → || falls through correctly).
   *   Previous version chained getAllMentioned() which returned [] (truthy), breaking the chain.
   *
   * @param message - WebMessageInfo from messages.upsert
   * @returns string[] of @g.us JIDs mentioned — empty = no group mentions
   */
  const getGroupMentions = (message) => {
      const msg = (message === null || message === void 0 ? void 0 : message.message) || null;
      if (!msg) return [];
      // chain on contextInfo OBJECTS — undefined is falsy, so || falls through correctly
      const contextInfo =
          msg.extendedTextMessage?.contextInfo ||
          msg.imageMessage?.contextInfo ||
          msg.videoMessage?.contextInfo ||
          msg.documentMessage?.contextInfo ||
          msg.audioMessage?.contextInfo ||
          msg.stickerMessage?.contextInfo ||
          null;
      const mentionedJids = (contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.mentionedJid) || [];
      return mentionedJids.filter(jid => typeof jid === 'string' && jid.endsWith('@g.us'));
  };

  /**
   * Returns true when a PRIVATE STATUS UPDATE (@broadcast) @-mentions a group JID.
   *
   * This is the correct "antiGroupMention" meaning used in WhatsApp bots:
   *   — someone posts a status and tags a group in it.
   *
   * Internally checks:
   *   1. message.key.remoteJid === 'status@broadcast'  (it IS a status)
   *   2. contextInfo.mentionedJid contains at least one @g.us JID
   *
   * To also act on group-to-group mentions (inside group chats), use getGroupMentions()
   * directly and check message.key.remoteJid.endsWith('@g.us') yourself.
   */
  const isAntiGroupMention = (message) => {
      const remoteJid = (message === null || message === void 0 ? void 0 : message.key?.remoteJid) || '';
      if (remoteJid !== STORIES_JID) return false;
      return getGroupMentions(message).length > 0;
  };

  const makeGroupsSocket = (config) => {
    const sock = (0, chats_1.makeChatsSocket)(config);
    const { authState, ev, query, upsertMessage } = sock;
    const groupQuery = async (jid, type, content) => query({
        tag: 'iq',
        attrs: {
            type,
            xmlns: 'w:g2',
            to: jid
        },
        content
    });
    const groupMetadata = async (jid) => {
        const result = await groupQuery(jid, 'get', [{ tag: 'query', attrs: { request: 'interactive' } }]);
        return (0, exports.extractGroupMetadata)(result);
    };
    const groupFetchAllParticipating = async () => {
        const result = await query({
            tag: 'iq',
            attrs: {
                to: '@g.us',
                xmlns: 'w:g2',
                type: 'get'
            },
            content: [
                {
                    tag: 'participating',
                    attrs: {},
                    content: [
                        { tag: 'participants', attrs: {} },
                        { tag: 'description', attrs: {} }
                    ]
                }
            ]
        });
        const data = {};
        const groupsChild = (0, WABinary_1.getBinaryNodeChild)(result, 'groups');
        if (groupsChild) {
            const groups = (0, WABinary_1.getBinaryNodeChildren)(groupsChild, 'group');
            for (const groupNode of groups) {
                const meta = (0, exports.extractGroupMetadata)({
                    tag: 'result',
                    attrs: {},
                    content: [groupNode]
                });
                data[meta.id] = meta;
            }
        }
        sock.ev.emit('groups.update', Object.values(data));
        return data;
    };
    sock.ws.on('CB:ib,,dirty', async (node) => {
        const { attrs } = (0, WABinary_1.getBinaryNodeChild)(node, 'dirty');
        if (attrs.type !== 'groups') {
            return;
        }
        await groupFetchAllParticipating();
        await sock.cleanDirtyBits('groups');
    });
    return {
        ...sock,
        groupMetadata,
        groupCreate: async (subject, participants) => {
            const key = (0, Utils_1.generateMessageIDV2)();
            const result = await groupQuery('@g.us', 'set', [
                {
                    tag: 'create',
                    attrs: {
                        subject,
                        key
                    },
                    content: participants.map(jid => ({
                        tag: 'participant',
                        attrs: { jid }
                    }))
                }
            ]);
            return (0, exports.extractGroupMetadata)(result);
        },
        groupLeave: async (id) => {
            await groupQuery('@g.us', 'set', [
                {
                    tag: 'leave',
                    attrs: {},
                    content: [{ tag: 'group', attrs: { id } }]
                }
            ]);
        },
        groupUpdateSubject: async (jid, subject) => {
            await groupQuery(jid, 'set', [
                {
                    tag: 'subject',
                    attrs: {},
                    content: Buffer.from(subject, 'utf-8')
                }
            ]);
        },
        groupRequestParticipantsList: async (jid) => {
            const result = await groupQuery(jid, 'get', [
                {
                    tag: 'membership_approval_requests',
                    attrs: {}
                }
            ]);
            const node = (0, WABinary_1.getBinaryNodeChild)(result, 'membership_approval_requests');
            const participants = (0, WABinary_1.getBinaryNodeChildren)(node, 'membership_approval_request');
            return participants.map(v => v.attrs);
        },
        groupRequestParticipantsUpdate: async (jid, participants, action) => {
            const result = await groupQuery(jid, 'set', [
                {
                    tag: 'membership_requests_action',
                    attrs: {},
                    content: [
                        {
                            tag: action,
                            attrs: {},
                            content: participants.map(jid => ({
                                tag: 'participant',
                                attrs: { jid }
                            }))
                        }
                    ]
                }
            ]);
            const node = (0, WABinary_1.getBinaryNodeChild)(result, 'membership_requests_action');
            const nodeAction = (0, WABinary_1.getBinaryNodeChild)(node, action);
            const participantsAffected = (0, WABinary_1.getBinaryNodeChildren)(nodeAction, 'participant');
            return participantsAffected.map(p => {
                return { status: p.attrs.error || '200', jid: p.attrs.jid };
            });
        },
        groupParticipantsUpdate: async (jid, participants, action) => {
            const result = await groupQuery(jid, 'set', [
                {
                    tag: action,
                    attrs: {},
                    content: participants.map(jid => ({
                        tag: 'participant',
                        attrs: { jid }
                    }))
                }
            ]);
            const node = (0, WABinary_1.getBinaryNodeChild)(result, action);
            const participantsAffected = (0, WABinary_1.getBinaryNodeChildren)(node, 'participant');
            return participantsAffected.map(p => {
                return { status: p.attrs.error || '200', jid: p.attrs.jid, content: p };
            });
        },
        groupUpdateDescription: async (jid, description) => {
            var _a;
            const metadata = await groupMetadata(jid);
            const prev = (_a = metadata.descId) !== null && _a !== void 0 ? _a : null;
            await groupQuery(jid, 'set', [
                {
                    tag: 'description',
                    attrs: {
                        ...(description ? { id: (0, Utils_1.generateMessageIDV2)() } : { delete: 'true' }),
                        ...(prev ? { prev } : {})
                    },
                    content: description ? [{ tag: 'body', attrs: {}, content: Buffer.from(description, 'utf-8') }] : undefined
                }
            ]);
        },
        groupInviteCode: async (jid) => {
            const result = await groupQuery(jid, 'get', [{ tag: 'invite', attrs: {} }]);
            const inviteNode = (0, WABinary_1.getBinaryNodeChild)(result, 'invite');
            return inviteNode === null || inviteNode === void 0 ? void 0 : inviteNode.attrs.code;
        },
        groupRevokeInvite: async (jid) => {
            const result = await groupQuery(jid, 'set', [{ tag: 'invite', attrs: {} }]);
            const inviteNode = (0, WABinary_1.getBinaryNodeChild)(result, 'invite');
            return inviteNode === null || inviteNode === void 0 ? void 0 : inviteNode.attrs.code;
        },
        groupAcceptInvite: async (code) => {
            const results = await groupQuery('@g.us', 'set', [{ tag: 'invite', attrs: { code } }]);
            const result = (0, WABinary_1.getBinaryNodeChild)(results, 'group');
            return result === null || result === void 0 ? void 0 : result.attrs.jid;
        },
        /**
         * revoke a v4 invite for someone
         * @param groupJid group jid
         * @param invitedJid jid of person you invited
         * @returns true if successful
         */
        groupRevokeInviteV4: async (groupJid, invitedJid) => {
            const result = await groupQuery(groupJid, 'set', [
                { tag: 'revoke', attrs: {}, content: [{ tag: 'participant', attrs: { jid: invitedJid } }] }
            ]);
            return !!result;
        },
        /**
         * accept a GroupInviteMessage
         * @param key the key of the invite message, or optionally only provide the jid of the person who sent the invite
         * @param inviteMessage the message to accept
         */
        groupAcceptInviteV4: ev.createBufferedFunction(async (key, inviteMessage) => {
            var _a;
            key = typeof key === 'string' ? { remoteJid: key } : key;
            const results = await groupQuery(inviteMessage.groupJid, 'set', [
                {
                    tag: 'accept',
                    attrs: {
                        code: inviteMessage.inviteCode,
                        expiration: inviteMessage.inviteExpiration.toString(),
                        admin: key.remoteJid
                    }
                }
            ]);
            // if we have the full message key
            // update the invite message to be expired
            if (key.id) {
                // create new invite message that is expired
                inviteMessage = WAProto_1.proto.Message.GroupInviteMessage.fromObject(inviteMessage);
                inviteMessage.inviteExpiration = 0;
                inviteMessage.inviteCode = '';
                ev.emit('messages.update', [
                    {
                        key,
                        update: {
                            message: {
                                groupInviteMessage: inviteMessage
                            }
                        }
                    }
                ]);
            }
            // generate the group add message
            await upsertMessage({
                key: {
                    remoteJid: inviteMessage.groupJid,
                    id: (0, Utils_1.generateMessageIDV2)((_a = sock.user) === null || _a === void 0 ? void 0 : _a.id),
                    fromMe: false,
                    participant: key.remoteJid
                },
                messageStubType: Types_1.WAMessageStubType.GROUP_PARTICIPANT_ADD,
                messageStubParameters: [authState.creds.me.id],
                participant: key.remoteJid,
                messageTimestamp: (0, Utils_1.unixTimestampSeconds)()
            }, 'notify');
            return results.attrs.from;
        }),
        groupGetInviteInfo: async (code) => {
            const results = await groupQuery('@g.us', 'get', [{ tag: 'invite', attrs: { code } }]);
            return (0, exports.extractGroupMetadata)(results);
        },
        groupToggleEphemeral: async (jid, ephemeralExpiration) => {
            const content = ephemeralExpiration
                ? { tag: 'ephemeral', attrs: { expiration: ephemeralExpiration.toString() } }
                : { tag: 'not_ephemeral', attrs: {} };
            await groupQuery(jid, 'set', [content]);
        },
        groupSettingUpdate: async (jid, setting) => {
            await groupQuery(jid, 'set', [{ tag: setting, attrs: {} }]);
        },
        groupMemberAddMode: async (jid, mode) => {
            await groupQuery(jid, 'set', [{ tag: 'member_add_mode', attrs: {}, content: mode }]);
        },
        groupJoinApprovalMode: async (jid, mode) => {
            await groupQuery(jid, 'set', [
                { tag: 'membership_approval_mode', attrs: {}, content: [{ tag: 'group_join', attrs: { state: mode } }] }
            ]);
        },
        groupFetchAllParticipating
    };
};
exports.makeGroupsSocket = makeGroupsSocket;
const extractGroupMetadata = (result) => {
    var _a, _b;
    const group = (0, WABinary_1.getBinaryNodeChild)(result, 'group');
    const descChild = (0, WABinary_1.getBinaryNodeChild)(group, 'description');
    let desc;
    let descId;
    let descOwner;
    let descOwnerJid;
    let descTime;
    if (descChild) {
        desc = (0, WABinary_1.getBinaryNodeChildString)(descChild, 'body');
        descOwner = descChild.attrs.participant ? (0, WABinary_1.jidNormalizedUser)(descChild.attrs.participant) : undefined;
        descOwnerJid = descChild.attrs.participant_pn ? (0, WABinary_1.jidNormalizedUser)(descChild.attrs.participant_pn) : undefined;
        descTime = +descChild.attrs.t;
        descId = descChild.attrs.id;
    }
    const groupId = group.attrs.id.includes('@') ? group.attrs.id : (0, WABinary_1.jidEncode)(group.attrs.id, 'g.us');
    const eph = (_a = (0, WABinary_1.getBinaryNodeChild)(group, 'ephemeral')) === null || _a === void 0 ? void 0 : _a.attrs.expiration;
    const memberAddMode = (0, WABinary_1.getBinaryNodeChildString)(group, 'member_add_mode') === 'all_member_add';
    const metadata = {
        id: groupId,
        addressingMode: group.attrs.addressing_mode,
        subject: group.attrs.subject,
        subjectOwner: group.attrs.s_o,
        subjectOwnerJid: group.attrs.s_o_pn,
        subjectTime: +group.attrs.s_t,
        size: (0, WABinary_1.getBinaryNodeChildren)(group, 'participant').length,
        creation: +group.attrs.creation,
        owner: group.attrs.creator ? (0, WABinary_1.jidNormalizedUser)(group.attrs.creator) : undefined,
        ownerJid: group.attrs.creator_pn ? (0, WABinary_1.jidNormalizedUser)(group.attrs.creator_pn) : undefined,
        desc,
        descId,
        descOwner,
        descOwnerJid,
        descTime,
        linkedParent: ((_b = (0, WABinary_1.getBinaryNodeChild)(group, 'linked_parent')) === null || _b === void 0 ? void 0 : _b.attrs.jid) || undefined,
        restrict: !!(0, WABinary_1.getBinaryNodeChild)(group, 'locked'),
        announce: !!(0, WABinary_1.getBinaryNodeChild)(group, 'announcement'),
        isCommunity: !!(0, WABinary_1.getBinaryNodeChild)(group, 'parent'),
        isCommunityAnnounce: !!(0, WABinary_1.getBinaryNodeChild)(group, 'default_sub_group'),
        joinApprovalMode: !!(0, WABinary_1.getBinaryNodeChild)(group, 'membership_approval_mode'),
        memberAddMode,
        participants: (0, WABinary_1.getBinaryNodeChildren)(group, 'participant').map(({ attrs }) => {
            let pn;
            let lid;
            if ((0, WABinary_1.isJidUser)(attrs.jid)) {
                pn = attrs.jid;
                lid = attrs.lid;
            }
            else if ((0, WABinary_1.isLidUser)(attrs.jid)) {
                lid = attrs.jid;
                pn = attrs.phone_number;
            }
            return {
                id: attrs.jid,
                pn,
                lid,
                jid: (0, WABinary_1.isJidUser)(attrs.jid) ? attrs.jid : (0, WABinary_1.jidNormalizedUser)(attrs.phone_number),
                admin: (attrs.type || null)
            };
        }) // Added missing closing parenthesis and brace for the map function
    };
    return metadata;
};
exports.extractGroupMetadata = extractGroupMetadata;
exports.isAntiGroupMention = isAntiGroupMention;
exports.getGroupMentions = getGroupMentions;
