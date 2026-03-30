function extractXmlValue(xml: string, tag: string) {
  const cdataMatch = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`, "s"));
  if (cdataMatch?.[1] !== undefined) return cdataMatch[1];

  const textMatch = xml.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, "s"));
  return textMatch?.[1]?.trim() || null;
}

export function parseWechatXml(xml: string) {
  return {
    toUserName: extractXmlValue(xml, "ToUserName"),
    fromUserName: extractXmlValue(xml, "FromUserName"),
    createTime: extractXmlValue(xml, "CreateTime"),
    msgType: extractXmlValue(xml, "MsgType"),
    event: extractXmlValue(xml, "Event"),
    eventKey: extractXmlValue(xml, "EventKey"),
    content: extractXmlValue(xml, "Content"),
    ticket: extractXmlValue(xml, "Ticket"),
    msgId: extractXmlValue(xml, "MsgId"),
  };
}
