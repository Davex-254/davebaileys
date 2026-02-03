"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBusinessSocket = void 0;
const business_1 = require("../Utils/business");
const WABinary_1 = require("../WABinary");
const generic_utils_1 = require("../WABinary/generic-utils");
const messages_recv_1 = require("./messages-recv");
const Utils_1 = require("../Utils");
const DaveStatus = require("./gcstatus");
const makeBusinessSocket = (config) => {
    const sock = (0, messages_recv_1.makeMessagesRecvSocket)(config);
    const { authState, query, waUploadToServer, relayMessage } = sock;
    
    // Initialize DaveStatus for status posting
    const daveStatus = new DaveStatus(Utils_1, waUploadToServer, relayMessage, config, sock);
    const getCatalog = async ({ jid, limit, cursor }) => {
        var _a;
        jid = jid || ((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id);
        jid = (0, WABinary_1.jidNormalizedUser)(jid);
        const queryParamNodes = [
            {
                tag: 'limit',
                attrs: {},
                content: Buffer.from((limit || 10).toString())
            },
            {
                tag: 'width',
                attrs: {},
                content: Buffer.from('100')
            },
            {
                tag: 'height',
                attrs: {},
                content: Buffer.from('100')
            }
        ];
        if (cursor) {
            queryParamNodes.push({
                tag: 'after',
                attrs: {},
                content: cursor
            });
        }
        const result = await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'get',
                xmlns: 'w:biz:catalog'
            },
            content: [
                {
                    tag: 'product_catalog',
                    attrs: {
                        jid,
                        allow_shop_source: 'true'
                    },
                    content: queryParamNodes
                }
            ]
        });
        return (0, business_1.parseCatalogNode)(result);
    };
    const getCollections = async (jid, limit = 51) => {
        var _a;
        jid = jid || ((_a = authState.creds.me) === null || _a === void 0 ? void 0 : _a.id);
        jid = (0, WABinary_1.jidNormalizedUser)(jid);
        const result = await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'get',
                xmlns: 'w:biz:catalog',
                smax_id: '35'
            },
            content: [
                {
                    tag: 'collections',
                    attrs: {
                        biz_jid: jid
                    },
                    content: [
                        {
                            tag: 'collection_limit',
                            attrs: {},
                            content: Buffer.from(limit.toString())
                        },
                        {
                            tag: 'item_limit',
                            attrs: {},
                            content: Buffer.from(limit.toString())
                        },
                        {
                            tag: 'width',
                            attrs: {},
                            content: Buffer.from('100')
                        },
                        {
                            tag: 'height',
                            attrs: {},
                            content: Buffer.from('100')
                        }
                    ]
                }
            ]
        });
        return (0, business_1.parseCollectionsNode)(result);
    };
    const getOrderDetails = async (orderId, tokenBase64) => {
        const result = await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'get',
                xmlns: 'fb:thrift_iq',
                smax_id: '5'
            },
            content: [
                {
                    tag: 'order',
                    attrs: {
                        op: 'get',
                        id: orderId
                    },
                    content: [
                        {
                            tag: 'image_dimensions',
                            attrs: {},
                            content: [
                                {
                                    tag: 'width',
                                    attrs: {},
                                    content: Buffer.from('100')
                                },
                                {
                                    tag: 'height',
                                    attrs: {},
                                    content: Buffer.from('100')
                                }
                            ]
                        },
                        {
                            tag: 'token',
                            attrs: {},
                            content: Buffer.from(tokenBase64)
                        }
                    ]
                }
            ]
        });
        return (0, business_1.parseOrderDetailsNode)(result);
    };
    const productUpdate = async (productId, update) => {
        update = await (0, business_1.uploadingNecessaryImagesOfProduct)(update, waUploadToServer);
        const editNode = (0, business_1.toProductNode)(productId, update);
        const result = await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'set',
                xmlns: 'w:biz:catalog'
            },
            content: [
                {
                    tag: 'product_catalog_edit',
                    attrs: { v: '1' },
                    content: [
                        editNode,
                        {
                            tag: 'width',
                            attrs: {},
                            content: '100'
                        },
                        {
                            tag: 'height',
                            attrs: {},
                            content: '100'
                        }
                    ]
                }
            ]
        });
        const productCatalogEditNode = (0, generic_utils_1.getBinaryNodeChild)(result, 'product_catalog_edit');
        const productNode = (0, generic_utils_1.getBinaryNodeChild)(productCatalogEditNode, 'product');
        return (0, business_1.parseProductNode)(productNode);
    };
    const productCreate = async (create) => {
        // ensure isHidden is defined
        create.isHidden = !!create.isHidden;
        create = await (0, business_1.uploadingNecessaryImagesOfProduct)(create, waUploadToServer);
        const createNode = (0, business_1.toProductNode)(undefined, create);
        const result = await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'set',
                xmlns: 'w:biz:catalog'
            },
            content: [
                {
                    tag: 'product_catalog_add',
                    attrs: { v: '1' },
                    content: [
                        createNode,
                        {
                            tag: 'width',
                            attrs: {},
                            content: '100'
                        },
                        {
                            tag: 'height',
                            attrs: {},
                            content: '100'
                        }
                    ]
                }
            ]
        });
        const productCatalogAddNode = (0, generic_utils_1.getBinaryNodeChild)(result, 'product_catalog_add');
        const productNode = (0, generic_utils_1.getBinaryNodeChild)(productCatalogAddNode, 'product');
        return (0, business_1.parseProductNode)(productNode);
    };
    const productDelete = async (productIds) => {
        const result = await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'set',
                xmlns: 'w:biz:catalog'
            },
            content: [
                {
                    tag: 'product_catalog_delete',
                    attrs: { v: '1' },
                    content: productIds.map(id => ({
                        tag: 'product',
                        attrs: {},
                        content: [
                            {
                                tag: 'id',
                                attrs: {},
                                content: Buffer.from(id)
                            }
                        ]
                    }))
                }
            ]
        });
        const productCatalogDelNode = (0, generic_utils_1.getBinaryNodeChild)(result, 'product_catalog_delete');
        return {
            deleted: +((productCatalogDelNode === null || productCatalogDelNode === void 0 ? void 0 : productCatalogDelNode.attrs.deleted_count) || 0)
        };
    };
    // ============ STATUS POSTING METHODS ============
    
    /**
     * Post text to your status
     * @param {string} text - The text to post
     * @param {Object} options - Optional settings
     * @param {string} options.font - Font style (0-9)
     * @param {string} options.backgroundColor - Background color hex
     * @param {string} options.textColor - Text color hex
     * @param {Array} options.statusJidList - List of JIDs to show status to (contacts/groups)
     */
    const sendTextStatus = async (text, options = {}) => {
        const jids = options.statusJidList || [];
        return await daveStatus.sendStatusToGroups({
            text,
            font: options.font,
            backgroundColor: options.backgroundColor,
            textColor: options.textColor
        }, jids);
    };

    /**
     * Post image to your status
     * @param {Buffer|string} image - Image buffer or URL
     * @param {Object} options - Optional settings
     * @param {string} options.caption - Caption for the image
     * @param {Array} options.statusJidList - List of JIDs to show status to
     */
    const sendImageStatus = async (image, options = {}) => {
        const jids = options.statusJidList || [];
        return await daveStatus.sendStatusToGroups({
            image: typeof image === 'string' ? { url: image } : image,
            caption: options.caption
        }, jids);
    };

    /**
     * Post video to your status
     * @param {Buffer|string} video - Video buffer or URL
     * @param {Object} options - Optional settings
     * @param {string} options.caption - Caption for the video
     * @param {Array} options.statusJidList - List of JIDs to show status to
     */
    const sendVideoStatus = async (video, options = {}) => {
        const jids = options.statusJidList || [];
        return await daveStatus.sendStatusToGroups({
            video: typeof video === 'string' ? { url: video } : video,
            caption: options.caption
        }, jids);
    };

    /**
     * Post audio/voice note to your status
     * @param {Buffer|string} audio - Audio buffer or URL
     * @param {Object} options - Optional settings
     * @param {boolean} options.ptt - Whether it's a voice note (default: true)
     * @param {string} options.backgroundColor - Background color hex
     * @param {Array} options.statusJidList - List of JIDs to show status to
     */
    const sendAudioStatus = async (audio, options = {}) => {
        const jids = options.statusJidList || [];
        return await daveStatus.sendStatusToGroups({
            audio: typeof audio === 'string' ? { url: audio } : audio,
            ptt: options.ptt !== false,
            backgroundColor: options.backgroundColor
        }, jids);
    };

    /**
     * Post any content to status (flexible method)
     * @param {Object} content - Content object (text, image, video, audio, etc.)
     * @param {Array} statusJidList - List of JIDs to show status to
     */
    const sendStatus = async (content, statusJidList = []) => {
        return await daveStatus.sendStatusToGroups(content, statusJidList);
    };

    /**
     * Post status to a specific group
     * @param {string} groupJid - Group JID
     * @param {Object} content - Content to post
     * @param {Object} options - Additional options
     */
    const sendGroupStatus = async (groupJid, content, options = {}) => {
        return await daveStatus.sendGroupStatus(groupJid, content, options);
    };

    return {
        ...sock,
        logger: config.logger,
        getOrderDetails,
        getCatalog,
        getCollections,
        productCreate,
        productDelete,
        productUpdate,
        // Status posting methods
        sendTextStatus,
        sendImageStatus,
        sendVideoStatus,
        sendAudioStatus,
        sendStatus,
        sendGroupStatus,
        daveStatus  // Expose full DaveStatus instance for advanced usage
    };
};
exports.makeBusinessSocket = makeBusinessSocket;
