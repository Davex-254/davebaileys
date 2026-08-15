import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeInteropSocket } from './interop.js';
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    return makeInteropSocket(newConfig);
};
export default makeWASocket;
//# sourceMappingURL=index.js.map