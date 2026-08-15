import type { GetCatalogOptions, ProductCreate, ProductUpdate, SocketConfig, WAMediaUpload } from '../Types/index.js';
import type { UpdateBussinesProfileProps } from '../Types/Bussines.js';
import { type BinaryNode } from '../WABinary/index.js';
export declare const makeBusinessSocket: (config: SocketConfig) => {
    logger: import("../Utils/logger").ILogger;
    getOrderDetails: (orderId: string, tokenBase64: string) => Promise<import("..").OrderDetails>;
    getCatalog: ({ jid, limit, cursor }: GetCatalogOptions) => Promise<{
        products: import("..").Product[];
        nextPageCursor: string | undefined;
    }>;
    getCollections: (jid?: string, limit?: number) => Promise<{
        collections: import("..").CatalogCollection[];
    }>;
    productCreate: (create: ProductCreate) => Promise<import("..").Product>;
    productDelete: (productIds: string[]) => Promise<{
        deleted: number;
    }>;
    productUpdate: (productId: string, update: ProductUpdate) => Promise<import("..").Product>;
    updateBussinesProfile: (args: UpdateBussinesProfileProps) => Promise<any>;
    updateCoverPhoto: (photo: WAMediaUpload) => Promise<number>;
    removeCoverPhoto: (id: string) => Promise<any>;
    sendMessageAck: (node: BinaryNode, errorCode?: number) => Promise<void>;
    sendRetryRequest: (node: BinaryNode, forceIncludeKeys?: boolean) => Promise<void>;
    rejectCall: (callId: string, callFrom: string) => Promise<void>;
    fetchMessageHistory: (count: number, oldestMsgKey: import("..").WAMessageKey, oldestMsgTimestamp: number | import("long").default) => Promise<string>;
    requestPlaceholderResend: (messageKey: import("..").WAMessageKey, msgData?: Partial<import("..").WAMessage>) => Promise<string | undefined>;
    messageRetryManager: import("..").MessageRetryManager | null;
    issuePrivacyTokens: (jids: string[], timestamp?: number) => Promise<any>;
    assertSessions: (jids: string[], force?: boolean) => Promise<boolean>;
    relayMessage: (jid: string, message: import("..").proto.IMessage, { messageId: msgId, participant, additionalAttributes, additionalNodes, useUserDevicesCache, useCachedGroupMetadata, statusJidList }: import("..").MessageRelayOptions) => Promise<string>;
    sendReceipt: (jid: string, participant: string | undefined, messageIds: string[], type: import("..").MessageReceiptType) => Promise<void>;
    sendReceipts: (keys: import("..").WAMessageKey[], type: import("..").MessageReceiptType) => Promise<void>;
    readMessages: (keys: import("..").WAMessageKey[]) => Promise<void>;
    refreshMediaConn: (forceGet?: boolean) => Promise<import("..").MediaConnInfo>;
    waUploadToServer: import("..").WAMediaUploadFunction;
    fetchPrivacySettings: (force?: boolean) => Promise<{
        [_: string]: string;
    }>;
    sendPeerDataOperationMessage: (pdoMessage: import("..").proto.Message.IPeerDataOperationRequestMessage) => Promise<string>;
    createParticipantNodes: (recipientJids: string[], message: import("..").proto.IMessage, extraAttrs?: BinaryNode["attrs"], dsmMessage?: import("..").proto.IMessage) => Promise<{
        nodes: BinaryNode[];
        shouldIncludeDeviceIdentity: boolean;
    }>;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<(import("..").JidWithDevice & {
        jid: string;
    })[]>;
    updateMemberLabel: (jid: string, memberLabel: string) => Promise<string>;
    toxicHandler: import("./groupStatus").ToxicHandler;
    userDevicesCache: import("..").PossiblyExtendedCacheStore | import("@cacheable/node-cache").NodeCache<import("..").JidWithDevice[]>;
    devicesMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    sendStatusMention: (content: Record<string, any>, jids?: string[]) => Promise<import("..").WAMessage>;
    updateMediaMessage: (message: import("..").WAMessage) => Promise<import("..").WAMessage>;
    sendMessage: (jid: string, content: import("..").AnyMessageContent, options?: import("..").MiscMessageGenerationOptions) => Promise<string | import("..").WAMessage | undefined>;
    sendInteractive: (jid: string, text: string, options?: {
        title?: string;
        subtitle?: string;
        footer?: string;
        buttonName?: string;
        quoted?: import("..").WAMessage;
    }) => Promise<string>;
    inappsignup: (jid: string, text: string, options?: {
        title?: string;
        subtitle?: string;
        footer?: string;
        buttonName?: string;
        quoted?: import("..").WAMessage;
    }) => Promise<string>;
    inapp_signup: (jid: string, text: string, options?: {
        title?: string;
        subtitle?: string;
        footer?: string;
        buttonName?: string;
        quoted?: import("..").WAMessage;
    }) => Promise<string>;
    checkUsername: (username: string, includeSuggestions?: boolean, sessionId?: string) => Promise<import("./username").UsernameCheckResult>;
    checkUsernameMulti: (usernames: string[]) => Promise<unknown>;
    setUsername: (username: string, options?: import("./username").SetUsernameOptions) => Promise<unknown>;
    deleteUsername: () => Promise<unknown>;
    getMyUsername: () => Promise<string | null>;
    getUsernameRecommendations: (source?: import("./username").UsernameSource | null) => Promise<unknown>;
    setUsernamePin: (pin: string | null) => Promise<unknown>;
    findUserByUsername: (username: string, pin?: string) => Promise<{
        jid: string;
        contact: boolean;
    } | null>;
    fetchContactUsernames: (...jids: string[]) => Promise<import("..").USyncQueryResultList[]>;
    USERNAME_QUERY_IDS: {
        readonly CHECK: "26124072630599518";
        readonly CHECK_MULTI: "27134626522840286";
        readonly SET: "27108705368767936";
        readonly GET: "32618050064506055";
        readonly GET_RECOMMENDATIONS: "26077456248616957";
        readonly PIN_SET: "25529696019976770";
    };
    USERNAME_CHECK_RESULT: {
        readonly SUCCESS: "SUCCESS";
        readonly INVALID: "INVALID";
    };
    USERNAME_SOURCE: {
        readonly FB: "FB";
        readonly IG: "IG";
        readonly USER_INPUT: "USER_INPUT";
        readonly SUGGESTION: "SUGGESTION";
    };
    newsletterCreate: (name: string, description?: string) => Promise<import("..").NewsletterMetadata>;
    newsletterUpdate: (jid: string, updates: import("..").NewsletterUpdate) => Promise<unknown>;
    newsletterSubscribers: (jid: string) => Promise<{
        subscribers: number;
    }>;
    newsletterMetadata: (type: "invite" | "jid", key: string) => Promise<import("..").NewsletterMetadata | null>;
    newsletterFollow: (jid: string) => Promise<unknown>;
    newsletterUnfollow: (jid: string) => Promise<unknown>;
    newsletterMute: (jid: string) => Promise<unknown>;
    newsletterUnmute: (jid: string) => Promise<unknown>;
    newsletterUpdateName: (jid: string, name: string) => Promise<unknown>;
    newsletterUpdateDescription: (jid: string, description: string) => Promise<unknown>;
    newsletterUpdatePicture: (jid: string, content: WAMediaUpload) => Promise<unknown>;
    newsletterRemovePicture: (jid: string) => Promise<unknown>;
    newsletterReactMessage: (jid: string, serverId: string, reaction?: string) => Promise<void>;
    newsletterFetchMessages: (jid: string, count: number, since: number, after: number) => Promise<any>;
    subscribeNewsletterUpdates: (jid: string) => Promise<{
        duration: string;
    } | null>;
    newsletterAdminCount: (jid: string) => Promise<number>;
    newsletterChangeOwner: (jid: string, newOwnerJid: string) => Promise<void>;
    newsletterDemote: (jid: string, userJid: string) => Promise<void>;
    newsletterDelete: (jid: string) => Promise<void>;
    groupMetadata: (jid: string) => Promise<import("..").GroupMetadata>;
    groupCreate: (subject: string, participants: string[]) => Promise<import("..").GroupMetadata>;
    groupLeave: (id: string) => Promise<void>;
    groupUpdateSubject: (jid: string, subject: string) => Promise<void>;
    groupRequestParticipantsList: (jid: string) => Promise<{
        [key: string]: string;
    }[]>;
    groupRequestParticipantsUpdate: (jid: string, participants: string[], action: "approve" | "reject") => Promise<{
        status: string;
        jid: string | undefined;
    }[]>;
    groupParticipantsUpdate: (jid: string, participants: string[], action: import("..").ParticipantAction) => Promise<{
        status: string;
        jid: string | undefined;
        content: BinaryNode;
    }[]>;
    groupUpdateDescription: (jid: string, description?: string) => Promise<void>;
    groupInviteCode: (jid: string) => Promise<string | undefined>;
    groupRevokeInvite: (jid: string) => Promise<string | undefined>;
    groupAcceptInvite: (code: string) => Promise<string | undefined>;
    groupRevokeInviteV4: (groupJid: string, invitedJid: string) => Promise<boolean>;
    groupAcceptInviteV4: (key: string | import("..").WAMessageKey, inviteMessage: import("..").proto.Message.IGroupInviteMessage) => Promise<any>;
    groupGetInviteInfo: (code: string) => Promise<import("..").GroupMetadata>;
    groupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    groupSettingUpdate: (jid: string, setting: "announcement" | "not_announcement" | "locked" | "unlocked") => Promise<void>;
    groupMemberAddMode: (jid: string, mode: "admin_add" | "all_member_add") => Promise<void>;
    groupJoinApprovalMode: (jid: string, mode: "on" | "off") => Promise<void>;
    groupFetchAllParticipating: () => Promise<{
        [_: string]: import("..").GroupMetadata;
    }>;
    serverProps: {
        privacyTokenOn1to1: boolean;
        profilePicPrivacyToken: boolean;
        lidTrustedTokenIssueToLid: boolean;
    };
    createCallLink: (type: "audio" | "video", event?: {
        startTime: number;
    }, timeoutMs?: number) => Promise<string | undefined>;
    getBotListV2: () => Promise<import("..").BotListInfo[]>;
    messageMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    placeholderResendCache: import("..").CacheStore;
    receiptMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    appStatePatchMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    notificationMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    upsertMessage: (msg: import("..").WAMessage, type: import("..").MessageUpsertType) => Promise<void>;
    appPatch: (patchCreate: import("..").WAPatchCreate) => Promise<void>;
    sendPresenceUpdate: (type: import("..").WAPresence, toJid?: string) => Promise<void>;
    presenceSubscribe: (toJid: string) => Promise<void>;
    profilePictureUrl: (jid: string, type?: "preview" | "image", timeoutMs?: number) => Promise<string | undefined>;
    fetchBlocklist: () => Promise<(string | undefined)[]>;
    fetchStatus: (...jids: string[]) => Promise<import("..").USyncQueryResultList[] | undefined>;
    fetchDisappearingDuration: (...jids: string[]) => Promise<import("..").USyncQueryResultList[] | undefined>;
    updateProfilePicture: (jid: string, content: WAMediaUpload, dimensions?: {
        width: number;
        height: number;
    }) => Promise<void>;
    removeProfilePicture: (jid: string) => Promise<void>;
    updateProfileStatus: (status: string) => Promise<void>;
    updateProfileName: (name: string) => Promise<void>;
    updateBlockStatus: (jid: string, action: "block" | "unblock") => Promise<void>;
    updateDisableLinkPreviewsPrivacy: (isPreviewsDisabled: boolean) => Promise<void>;
    updateCallPrivacy: (value: import("..").WAPrivacyCallValue) => Promise<void>;
    updateMessagesPrivacy: (value: import("..").WAPrivacyMessagesValue) => Promise<void>;
    updateLastSeenPrivacy: (value: import("..").WAPrivacyValue) => Promise<void>;
    updateOnlinePrivacy: (value: import("..").WAPrivacyOnlineValue) => Promise<void>;
    updateProfilePicturePrivacy: (value: import("..").WAPrivacyValue) => Promise<void>;
    updateStatusPrivacy: (value: import("..").WAPrivacyValue) => Promise<void>;
    updateReadReceiptsPrivacy: (value: import("..").WAReadReceiptsValue) => Promise<void>;
    updateGroupsAddPrivacy: (value: import("..").WAPrivacyGroupAddValue) => Promise<void>;
    updateDefaultDisappearingMode: (duration: number) => Promise<void>;
    getBusinessProfile: (jid: string) => Promise<import("..").WABusinessProfile | void>;
    resyncAppState: (collections: readonly ("critical_unblock_low" | "regular_high" | "regular_low" | "critical_block" | "regular")[], isInitialSync: boolean) => Promise<void>;
    chatModify: (mod: import("..").ChatModification, jid: string) => Promise<void>;
    cleanDirtyBits: (type: "account_sync" | "groups", fromTimestamp?: number | string) => Promise<void>;
    addOrEditContact: (jid: string, contact: import("..").proto.SyncActionValue.IContactAction) => Promise<void>;
    removeContact: (jid: string) => Promise<void>;
    addLabel: (jid: string, labels: import("../Types/Label").LabelActionBody) => Promise<void>;
    addChatLabel: (jid: string, labelId: string) => Promise<void>;
    removeChatLabel: (jid: string, labelId: string) => Promise<void>;
    addMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    removeMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    star: (jid: string, messages: {
        id: string;
        fromMe?: boolean;
    }[], star: boolean) => Promise<void>;
    addOrEditQuickReply: (quickReply: import("../Types/Bussines").QuickReplyAction) => Promise<void>;
    removeQuickReply: (timestamp: string) => Promise<void>;
    type: "md";
    ws: import("./Client").WebSocketClient;
    ev: import("..").BaileysEventEmitter & {
        process(handler: (events: Partial<import("..").BaileysEventMap>) => void | Promise<void>): () => void;
        buffer(): void;
        createBufferedFunction<A extends any[], T>(work: (...args: A) => Promise<T>): (...args: A) => Promise<T>;
        flush(): boolean;
        isBuffering(): boolean;
        destroy(): void;
    };
    authState: {
        creds: import("..").AuthenticationCreds;
        keys: import("..").SignalKeyStoreWithTransaction;
    };
    signalRepository: import("..").SignalRepositoryWithLIDStore;
    user: import("..").Contact | undefined;
    generateMessageTag: () => string;
    query: (node: BinaryNode, timeoutMs?: number) => Promise<any>;
    waitForMessage: <T>(msgId: string, timeoutMs?: number | undefined) => Promise<T | undefined>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: Uint8Array | Buffer) => Promise<void>;
    sendNode: (frame: BinaryNode) => Promise<void>;
    logout: (msg?: string) => Promise<void>;
    end: (error: Error | undefined) => Promise<void>;
    registerSocketEndHandler: (handler: (error: Error | undefined) => void | Promise<void>) => void;
    onUnexpectedError: (err: Error | import("@hapi/boom").Boom, msg: string) => void;
    uploadPreKeys: (count?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    digestKeyBundle: () => Promise<void>;
    rotateSignedPreKey: () => Promise<void>;
    requestPairingCode: (phoneNumber: string, customPairingCode?: string) => Promise<string>;
    updateServerTimeOffset: ({ attrs }: BinaryNode) => void;
    sendUnifiedSession: () => Promise<void>;
    wamBuffer: import("..").BinaryInfo;
    waitForConnectionUpdate: (check: (u: Partial<import("..").ConnectionState>) => Promise<boolean | undefined>, timeoutMs?: number) => Promise<void>;
    sendWAMBuffer: (wamBuffer: Buffer) => Promise<any>;
    executeUSyncQuery: (usyncQuery: import("..").USyncQuery) => Promise<import("..").USyncQueryResult | undefined>;
    onWhatsApp: (...phoneNumber: string[]) => Promise<{
        jid: string;
        exists: boolean;
    }[] | undefined>;
    fetchAccountReachoutTimelock: () => Promise<import("..").ReachoutTimelockState>;
    fetchNewChatMessageCap: () => Promise<import("..").NewChatMessageCapInfo>;
};
//# sourceMappingURL=business.d.ts.map