import {
  getContentType,
  proto,
} from "@whiskeysockets/baileys";


const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  return getContentType(msg.message);
};

export default getTypeMessage;
