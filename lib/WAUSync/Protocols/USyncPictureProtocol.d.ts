import type { USyncQueryProtocol } from '../../Types/USync.js';
import { type BinaryNode } from '../../WABinary/index.js';
import type { USyncUser } from '../USyncUser.js';
export type PictureData = {
    id: string | null;
    directPath: string | null;
    hash: string | null;
};
export declare class USyncPictureProtocol implements USyncQueryProtocol {
    name: string;
    type: 'image' | 'preview';
    constructor(type?: 'image' | 'preview');
    getQueryElement(): BinaryNode;
    getUserElement(user: USyncUser): BinaryNode | null;
    parser(node: BinaryNode): PictureData | null;
}
//# sourceMappingURL=USyncPictureProtocol.d.ts.map