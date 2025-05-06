import { randomBytes } from 'node:crypto';


export const getSessionId = () => {

    const LENGTH = 60;
    const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = randomBytes(LENGTH);
  
    return Array.from(bytes, byte => CHARSET[byte % CHARSET.length]).join('');

}