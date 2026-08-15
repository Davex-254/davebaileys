import type { USyncQueryProtocol } from '../../Types/USync.js';
import { type BinaryNode } from '../../WABinary/index.js';
export type TextStatusData = {
    text: string | null;
    emoji: string | null;
    setAt: Date;
    expiresAt: Date | null;
};
export declare class USyncTextStatusProtocol implements USyncQueryProtocol {
    name: string;
    getQueryElement(): BinaryNode;
    getUserElement(): null;
    parser(node: BinaryNode): TextStatusData | null;
}
//# sourceMappingURL=USyncTextStatusProtocol.d.ts.map