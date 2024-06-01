import {
  getContentType,
  proto,
} from "@whiskeysockets/baileys";
import Message from "../../models/Message";
import getQuotedMessageId from "./getQuotedMessageId";


const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { id: quoted },
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

export default verifyQuotedMessage;
