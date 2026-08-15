declare const VERSION = "4.6";
declare class Toolkit {
    constructor();
    static extractIE(text: any, { extract, hyperlink, citation, latex }?: {
        extract?: boolean | undefined;
        hyperlink?: boolean | undefined;
        citation?: boolean | undefined;
        latex?: boolean | undefined;
    }): {
        text: any;
        ie: never[];
        inline_entities: never[];
    } | {
        text: string;
        ie: ({
            type: string;
            ie: {
                key: string;
                text: any;
                url: any;
                width: number | null;
                height: number | null;
                font_height: number;
                padding: number;
                is_trusted?: undefined;
                reference_id?: undefined;
            };
        } | {
            type: string;
            ie: {
                key: string;
                text: any;
                url: any;
                is_trusted: boolean;
                width?: undefined;
                height?: undefined;
                font_height?: undefined;
                padding?: undefined;
                reference_id?: undefined;
            };
        } | {
            type: string;
            ie: {
                reference_id: number;
                key: string;
                text: string;
                url: any;
                width?: undefined;
                height?: undefined;
                font_height?: undefined;
                padding?: undefined;
                is_trusted?: undefined;
            };
        })[];
        inline_entities: ({
            key: any;
            metadata: {
                display_name: any;
                is_trusted: any;
                url: any;
                __typename: string;
                reference_id?: undefined;
                reference_url?: undefined;
                reference_title?: undefined;
                reference_display_name?: undefined;
                sources?: undefined;
            };
        } | {
            key: any;
            metadata: {
                reference_id: any;
                reference_url: any;
                reference_title: any;
                reference_display_name: any;
                sources: never[];
                __typename: string;
                display_name?: undefined;
                is_trusted?: undefined;
                url?: undefined;
            };
        } | {
            key: any;
            metadata: {
                latex_expression: any;
                font_height: number;
                padding: number;
                __typename: string;
            };
        })[];
    };
    static resize(buffer: any, x: any, y: any, fit?: string): Promise<any>;
    static waitAllPromises(input: any): Promise<any>;
    static fetchBuffer(url: any, options?: {}, config?: {}): Promise<Buffer<ArrayBuffer>>;
    static resolveLatexDimensions(url: any, font_height: any): Promise<{
        url: any;
        width: number;
        height: any;
    }>;
    static toUrl(_client: any, path: any, mediaType?: string): Promise<any>;
    static resolveMedia(_client: any, media: any, mediaType?: string, { resolveUrl, resolveWAUrl, result, resize, width, height, }?: {
        resolveUrl?: boolean | undefined;
        resolveWAUrl?: boolean | undefined;
        result?: string | undefined;
        resize?: boolean | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }): any;
    static getMp4Duration(buffer: any, { silent }?: {
        silent?: boolean | undefined;
    }): number;
    static getMp4Preview(videoBuffer: any, { time, result, resize, width, height, silent, }?: {
        result?: string | undefined;
        resize?: boolean | undefined;
        width?: number | undefined;
        height?: number | undefined;
        silent?: boolean | undefined;
    }): Promise<unknown>;
}
declare class BaseBuilder {
    constructor();
    setTitle(title: any): this;
    setSubtitle(subtitle: any): this;
    setBody(body: any): this;
    setFooter(footer: any): this;
    setContextInfo(obj: any): this;
    addPayload(obj: any): this;
    static resize(buffer: any, x: any, y: any, fit?: string): Promise<any>;
    static fetchBuffer(url: any, options?: {}, config?: {}): Promise<Buffer<ArrayBuffer>>;
}
declare class Button extends BaseBuilder {
    #private;
    constructor(client: any);
    setVideo(path: any, options?: {}): this;
    setImage(path: any, options?: {}): this;
    setDocument(path: any, options?: {}): this;
    setMedia(obj: any): this;
    setLocation(thumbnail: any, name?: string, address?: string): Promise<this>;
    clearButtons(): this;
    setParams(obj: any): this;
    addButton(name: any, params: any): this;
    makeRow(header?: string, title?: string, description?: string, id?: string): this;
    makeSection(title?: string, highlight_label?: string): this;
    addSelection(title: any, options?: {}): this;
    addReply(display_text?: string, id?: string, options?: {}): this;
    addCall(display_text?: string, id?: string, options?: {}): this;
    addReminder(display_text?: string, id?: string, options?: {}): this;
    addCancelReminder(display_text?: string, id?: string, options?: {}): this;
    addAddress(display_text?: string, id?: string, options?: {}): this;
    addLocation(options?: {}): this;
    addUrl(display_text?: string, url?: string, webview_interaction?: boolean, options?: {}): this;
    addCopy(display_text?: string, copy_code?: string, options?: {}): this;
    static paramsList: {
        limited_time_offer: {
            text: string;
            url: string;
            copy_code: string;
            expiration_time: string;
        };
        bottom_sheet: {
            in_thread_buttons_limit: string;
            divider_indices: string[];
            list_title: string;
            button_title: string;
        };
        tap_target_configuration: {
            title: string;
            description: string;
            canonical_url: string;
            domain: string;
            buttonIndex: string;
        };
    };
    toCard(): Promise<{
        body: {
            text: any;
        };
        footer: {
            text: any;
        };
        header: any;
        nativeFlowMessage: {
            messageParamsJson: string;
            buttons: any;
        };
    }>;
    build(jid: any, { mentions, ...options }?: {}): Promise<import("../index.js").WAMessage>;
    send(jid: any, { ...options }?: {}): Promise<import("../index.js").WAMessage>;
    setButton(name: any, params: any): this;
    run(jid: any, sock: any, options?: {}): Promise<import("../index.js").WAMessage>;
}
declare class ButtonV2 extends BaseBuilder {
    #private;
    constructor(client: any);
    addButton(displayText?: string, buttonId?: `${string}-${string}-${string}-${string}-${string}`): this;
    addRawButton(obj: any): this;
    setThumbnail(path: any): this;
    setMedia(obj: any): this;
    setLocation(thumbnail: any, name?: string, address?: string): Promise<this>;
    build(jid: any, { mentions, ...options }?: {}): Promise<import("../index.js").WAMessage>;
    send(jid: any, { ...options }?: {}): Promise<import("../index.js").WAMessage>;
    run(jid: any, sock: any, options?: {}): Promise<import("../index.js").WAMessage>;
}
declare class Carousel extends BaseBuilder {
    #private;
    constructor(client: any);
    addCard(card: any): this;
    build(jid: any, { ...options }?: {}): import("../index.js").WAMessage;
    send(jid: any, { ...options }?: {}): Promise<import("../index.js").WAMessage>;
    run(jid: any, sock: any, options?: {}): Promise<import("../index.js").WAMessage>;
}
declare class AIRich extends BaseBuilder {
    #private;
    constructor(client: any);
    static newLayout(name: any, data: any, extra?: {}): {
        view_model: {
            [x: string]: any;
            __typename: string;
        };
    };
    addSubmessage(submessage: any): this;
    addSection(section: any): this;
    addText(text: any, { hyperlink, citation, latex }?: {
        hyperlink?: boolean | undefined;
        citation?: boolean | undefined;
        latex?: boolean | undefined;
    }): this;
    addCode(language: any, code: any): this;
    addTable(table: any, { hyperlink, citation, latex }?: {
        hyperlink?: boolean | undefined;
        citation?: boolean | undefined;
        latex?: boolean | undefined;
    }): this;
    addSource(sources?: never[]): this;
    addReels(reelsItems?: never[]): this;
    addImage(imageUrl: any, { resolveUrl }?: {
        resolveUrl?: boolean | undefined;
    }): this;
    addVideo(videoUrl: any, { autoFill }?: {
        autoFill?: boolean | undefined;
    }): this;
    addProduct(data?: {}): this;
    addPost(data?: {}): this;
    addTip(text: any): this;
    addSuggest(suggestion: any, { scroll, layout }?: {
        scroll?: boolean | undefined;
    }): this;
    build({ forwarded, notification, includesUnifiedResponse, includesSubmessages, quoted, quotedParticipant, ...options }?: {
        forwarded?: boolean | undefined;
        notification?: boolean | undefined;
        includesUnifiedResponse?: boolean | undefined;
        includesSubmessages?: boolean | undefined;
    }): Promise<any>;
    send(jid: any, { forwarded, notification, includesUnifiedResponse, includesSubmessages, ...options }?: {}): Promise<any>;
    run(jid: any, sock: any, options?: {}): Promise<any>;
    static tokenizer(code: any, lang?: string): {
        codeBlock: any[];
        unified_codeBlock: {
            content: any;
            type: any;
        }[];
    };
    static toTableMetadata(arr: any, { hyperlink, citation, latex }?: {
        hyperlink?: boolean | undefined;
        citation?: boolean | undefined;
        latex?: boolean | undefined;
    }): {
        title: string;
        rows: {
            isHeading?: boolean | undefined;
            items: any[];
        }[];
        unified_rows: {
            markdown_cells?: {
                inline_entities?: never[] | ({
                    key: any;
                    metadata: {
                        display_name: any;
                        is_trusted: any;
                        url: any;
                        __typename: string;
                        reference_id?: undefined;
                        reference_url?: undefined;
                        reference_title?: undefined;
                        reference_display_name?: undefined;
                        sources?: undefined;
                    };
                } | {
                    key: any;
                    metadata: {
                        reference_id: any;
                        reference_url: any;
                        reference_title: any;
                        reference_display_name: any;
                        sources: never[];
                        __typename: string;
                        display_name?: undefined;
                        is_trusted?: undefined;
                        url?: undefined;
                    };
                } | {
                    key: any;
                    metadata: {
                        latex_expression: any;
                        font_height: number;
                        padding: number;
                        __typename: string;
                    };
                })[] | undefined;
                text: any;
            }[] | undefined;
            is_header: boolean;
            cells: any[];
        }[];
    };
}
export { VERSION, Button, ButtonV2, Carousel, AIRich, Toolkit };
//# sourceMappingURL=index.d.ts.map