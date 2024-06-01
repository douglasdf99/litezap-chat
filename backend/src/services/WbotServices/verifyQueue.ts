import moment from "moment";
import { head } from "lodash";
import formatBody from "../../helpers/Mustache";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import Setting from "../../models/Setting";
import verifyMessage from "./verifyMessage";
import { isWithinBusinessHours } from "../../utils/businessHours";
import getBodyMessage from "./getBodyMessage"

const sendMessage = async (wbot, contact, ticket, message) => {
  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, 
    { text: message }
  );
  await verifyMessage(sentMessage, ticket, contact);
};

const verifyBusinessHoursAndSendMessage = async (wbot, contact, ticket, queue) => {
  const now = new Date();
  if (!isWithinBusinessHours(now, queue.schedules)) {
    const outOfHoursMessage = formatBody(`${queue.outOfHoursMessage}\n\n*[ # ]* - Voltar ao Menu Principal`, ticket.contact);
    await sendMessage(wbot, contact, ticket, outOfHoursMessage);
    await UpdateTicketService({
      ticketData: { queueId: null, chatbot: false },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });
    return false;
  }
  return true;
};

const generateBotListMessage = async (wbot, contact, ticket, queues, greetingMessage) => {
  const sectionsRows = queues.map((queue, index) => ({
    title: queue.name,
    rowId: `${index + 1}`
  }));

  const listMessage = {
    text: formatBody(`\u200e${greetingMessage}`, contact),
    buttonText: "Escolha uma opção",
    sections: [{ rows: sectionsRows }]
  };

  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    listMessage
  );

  await verifyMessage(sentMessage, ticket, contact);
};

const generateBotButtonMessage = async (wbot, contact, ticket, queues, greetingMessage) => {
  const buttons = queues.map((queue, index) => ({
    buttonId: `${index + 1}`,
    buttonText: { displayText: queue.name },
    type: 4
  }));

  const buttonMessage = {
    text: formatBody(`\u200e${greetingMessage}`, contact),
    buttons,
    headerType: 4
  };

  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    buttonMessage
  );

  await verifyMessage(sentMessage, ticket, contact);
};

const generateBotTextMessage = async (wbot, contact, ticket, queues, greetingMessage) => {
  const options = queues.map((queue, index) => `*[ ${index + 1} ]* - ${queue.name}`).join('\n');

  const textMessage = {
    text: formatBody(`\u200e${greetingMessage}\n\n${options}`, contact)
  };

  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    textMessage
  );

  await verifyMessage(sentMessage, ticket, contact);
};

const verifyQueue = async (wbot, msg, ticket, contact) => {
    console.log("verifyQueue");
  const { queues, greetingMessage: defaultGreetingMessage } = await ShowWhatsAppService(wbot.id!, ticket.companyId);
  const greetingMessage = defaultGreetingMessage || queues[0]?.greetingMessage || "";

  if (queues.length === 1) {
    const firstQueue = head(queues);
    const chatbot = firstQueue?.options?.length > 0;

    await UpdateTicketService({
      ticketData: { queueId: firstQueue?.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });

    return;
  }

  const selectedOption = getBodyMessage(msg);
  const choosenQueue = queues[+selectedOption - 1];

  const companyId = ticket.companyId;

  const buttonActive = await Setting.findOne({ where: { key: "chatBotType", companyId } });

  if (choosenQueue) {
    const chatbot = choosenQueue?.options?.length > 0;

    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });

    const withinBusinessHours = await verifyBusinessHoursAndSendMessage(wbot, contact, ticket, choosenQueue);
    if (!withinBusinessHours) return;

    const queueGreetingMessage = choosenQueue.greetingMessage || greetingMessage;
    const body = formatBody(`\u200e${queueGreetingMessage}`, ticket.contact);
    await sendMessage(wbot, contact, ticket, body);

  } else {
    if (buttonActive.value === "list") {
      return generateBotListMessage(wbot, contact, ticket, queues, greetingMessage);
    }

    if (buttonActive.value === "button" && queues.length <= 4) {
      return generateBotButtonMessage(wbot, contact, ticket, queues, greetingMessage);
    }

    if (buttonActive.value === "text") {
      return generateBotTextMessage(wbot, contact, ticket, queues, greetingMessage);
    }

    if (buttonActive.value === "button" && queues.length > 4) {
      return generateBotTextMessage(wbot, contact, ticket, queues, greetingMessage);
    }
  }
};

export default verifyQueue;
