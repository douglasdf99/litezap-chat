import { isNil } from "lodash";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import Setting from "../../models/Setting";
import formatBody from "../../helpers/Mustache";
import verifyMessage from "./verifyMessage";
import verifyQueue from "./verifyQueue";
import getBodyMessage from "./getBodyMessage"
import Message from "../../models/Message";
import moment from "moment";

const updateTicketOption = async (ticket, option) => {
  await ticket.update({ queueOptionId: option?.id });
  await ticket.reload();
};

const isWithinTimeWindow = (updatedAt, minutes) => {
  const now = moment();
  const updateTime = moment(updatedAt);
  console.log(now, updateTime,updatedAt,  now.diff(updateTime, 'minutes'));
  return now.diff(updateTime, 'minutes') <= minutes;
};

const sendMessage = async (wbot, contact, ticket, message) => {
  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    { text: message }
  );
  await verifyMessage(sentMessage, ticket, contact);
};

const generateBotListMessage = async (wbot, contact, ticket, queueOptions, greetingMessage) => {
  const sectionsRows = queueOptions.map(option => ({
    title: option.title,
    rowId: `${option.option}`
  }));

  sectionsRows.push({
    title: "Menu inicial *[ # ]* - Voltar ao Menu Principal",
    rowId: `#`
  });

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

const generateBotButtonMessage = async (wbot, contact, ticket, queueOptions, greetingMessage) => {
  const buttons = queueOptions.map(option => ({
    buttonId: `${option.option}`,
    buttonText: { displayText: option.title },
    type: 4
  }));

  buttons.push({
    buttonId: `#`,
    buttonText: { displayText: "Menu inicial *[ 0 ]* Menu anterior" },
    type: 4
  });

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

const generateBotTextMessage = async (wbot, contact, ticket, queueOptions, greetingMessage) => {
  const options = queueOptions.map(option => `*[ ${option.option} ]* - ${option.title}`).join('\n');

  const textMessage = {
    text: formatBody(`\u200e${greetingMessage}\n\n${options}\n\n*[ 0 ]* - Menu anterior\n*[ # ]* - Menu inicial`, contact)
  };

  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    textMessage
  );

  await verifyMessage(sentMessage, ticket, contact);
};

const handleChartbot = async (ticket, msg, wbot, dontReadTheFirstQuestion = false) => {
  const queue = await Queue.findByPk(ticket.queueId, {
    include: [
      {
        model: QueueOption,
        as: "options",
        where: { parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"],
        ],
      },
    ],
  });

  const messageBody = getBodyMessage(msg);
  console.log("messageBody", messageBody)
  if (messageBody === "#") {
    await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
    await verifyQueue(wbot, msg, ticket, ticket.contact);
    return;
  }

  if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody === "0") {
    const option = await QueueOption.findByPk(ticket.queueOptionId);
    await ticket.update({ queueOptionId: option?.parentId });
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    console.log("ticket.queueOptionId", ticket.queueOptionId)
    const option = await QueueOption.findOne({
      where: { option: messageBody, parentId: ticket.queueOptionId }
    }) || await QueueOption.findOne({
      where: { parentId: ticket.queueOptionId }
    });
    console.log("option", option)
    if (option) await updateTicketOption(ticket, option);
  } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion) {
    console.log("ticket.queueOptionId 2", ticket.queueOptionId)
    const option = queue?.options.find(o => o.option == messageBody);
    if (option) await updateTicketOption(ticket, option);
  }

  await ticket.reload();

  if (!isNil(queue) && isNil(ticket.queueOptionId)) {
    const queueOptions = await QueueOption.findAll({
      where: { queueId: ticket.queueId, parentId: null },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    const options = queueOptions.map(option => `*[ ${option.option} ]* - ${option.title}`).join('\n');

    const textMessage = {
      text: formatBody(`\u200e${queue.greetingMessage}\n\n${options}\n\n*[ 0 ]* - Menu anterior\n*[ # ]* - Menu inicial`, ticket.contact)
    };

    const lastMessageFromMe = await Message.findOne({
      where: { ticketId: ticket.id, fromMe: true, body: textMessage.text },
      order: [["createdAt", "DESC"]],
    });

    if (lastMessageFromMe && isWithinTimeWindow(lastMessageFromMe?.createdAt, 1)) {
      console.log('aguando minutos')
      return
    }

    const companyId = ticket.companyId;
    const buttonActive = await Setting.findOne({ where: { key: "chatBotType", companyId } });

    if (buttonActive.value === "list") {
      return generateBotListMessage(wbot, ticket.contact, ticket, queueOptions, queue.greetingMessage);
    }
    if (buttonActive.value === "button" && queueOptions.length <= 4) {
      return generateBotButtonMessage(wbot, ticket.contact, ticket, queueOptions, queue.greetingMessage);
    }
    if (buttonActive.value === "text") {
      return generateBotTextMessage(wbot, ticket.contact, ticket, queueOptions, queue.greetingMessage);
    }
    if (buttonActive.value === "button" && queueOptions.length > 4) {
      return generateBotTextMessage(wbot, ticket.contact, ticket, queueOptions, queue.greetingMessage);
    }
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
    const queueOptions = await QueueOption.findAll({
      where: { parentId: ticket.queueOptionId },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    const options = queueOptions.map(option => `*[ ${option.option} ]* - ${option.title}`).join('\n');

    const textMessage = {
      text: formatBody(`\u200e${currentOption.message}\n\n${options}\n\n*[ 0 ]* - Menu anterior\n*[ # ]* - Menu inicial`, ticket.contact)
    };

    const lastMessageFromMe = await Message.findOne({
      where: { ticketId: ticket.id, fromMe: true, body: textMessage.text },
      order: [["createdAt", "DESC"]],
    });

    if (lastMessageFromMe && isWithinTimeWindow(lastMessageFromMe?.createdAt, 1)) {
      console.log('aguando minutos')
      return
    }

    const companyId = ticket.companyId;
    const buttonActive = await Setting.findOne({ where: { key: "chatBotType", companyId } });

    if (buttonActive.value === "list") {
      return generateBotListMessage(wbot, ticket.contact, ticket, queueOptions, currentOption.message);
    }
    if (buttonActive.value === "button" && queueOptions.length <= 4) {
      return generateBotButtonMessage(wbot, ticket.contact, ticket, queueOptions, currentOption.message);
    }
    if (buttonActive.value === "text") {
      return generateBotTextMessage(wbot, ticket.contact, ticket, queueOptions, currentOption.message);
    }
    if (buttonActive.value === "button" && queueOptions.length > 4) {
      return generateBotTextMessage(wbot, ticket.contact, ticket, queueOptions, currentOption.message);
    }
  }
};

export default handleChartbot;
