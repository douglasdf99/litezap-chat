import {
  extractMessageContent,
  proto,
} from "@whiskeysockets/baileys";


export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  return body?.contextInfo?.stanzaId;
};

export default getQuotedMessageId;
