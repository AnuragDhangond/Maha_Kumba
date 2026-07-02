import type { Action } from './types';

export function cleanMarkdownLeadingSpaces(rawMarkdown: string): string {
  return rawMarkdown
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      // Keep markdown list blocks, headers, blockquotes, and code fences as is, but trim normal indented paragraphs
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('>') || trimmed.startsWith('#') || trimmed.startsWith('`') || /^\d+\./.test(trimmed)) {
        // Keep list indentations if it's nested (e.g. starts with spaces but has content)
        if (line.startsWith('  ') && (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed))) {
          return line; // nested lists need indentation
        }
        return trimmed;
      }
      // If it's a regular text line, trim all leading/trailing space to prevent it from becoming an indented code block
      return trimmed;
    })
    .join('\n');
}

export function sanitizeJsonString(jsonStr: string): string {
  let sanitized = jsonStr.trim();
  const messageStartIdx = sanitized.indexOf('"message"');
  if (messageStartIdx !== -1) {
    const firstQuoteIdx = sanitized.indexOf('"', messageStartIdx + 9);
    if (firstQuoteIdx !== -1) {
      const actionIdx = sanitized.indexOf('"action"');
      if (actionIdx !== -1) {
        const lastQuoteIdx = sanitized.lastIndexOf('"', actionIdx - 1);
        if (lastQuoteIdx > firstQuoteIdx) {
          const messageVal = sanitized.substring(firstQuoteIdx + 1, lastQuoteIdx);
          const escapedMessageVal = messageVal.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
          sanitized = sanitized.substring(0, firstQuoteIdx + 1) + escapedMessageVal + sanitized.substring(lastQuoteIdx);
        }
      }
    }
  }
  return sanitized;
}

export function parseMessageContent(content: string): { text: string; action?: Action } {
  let text = content.trim();
  let action: Action | undefined = undefined;

  try {
    // 1. Check if the entire content is a JSON codeblock or a raw JSON
    let cleanJsonStr = text;
    if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    if (cleanJsonStr.startsWith('{') && cleanJsonStr.endsWith('}')) {
      const sanitized = sanitizeJsonString(cleanJsonStr);
      try {
        const parsed = JSON.parse(sanitized);
        if (parsed.message && parsed.action) {
          return {
            text: cleanMarkdownLeadingSpaces(parsed.message),
            action: parsed.action
          };
        }
      } catch (innerErr) {
        // Fallback to regex match below
      }
    }

    // 2. Extract structured JSON block containing the action payload from within any raw conversational text
    const jsonMatch = text.match(/\{[\s\S]*"action"\s*:[\s\S]*\}/);
    if (jsonMatch) {
      const potentialJson = jsonMatch[0].trim();
      const sanitized = sanitizeJsonString(potentialJson);
      try {
        const parsed = JSON.parse(sanitized);
        if (parsed.message && parsed.action) {
          action = parsed.action;
          
          // Prepend any markdown text generated before the JSON block to preserve complete details
          const textBeforeJson = content.split(jsonMatch[0])[0].trim();
          let cleanMessage = cleanMarkdownLeadingSpaces(parsed.message);
          
          if (textBeforeJson) {
            text = cleanMarkdownLeadingSpaces(textBeforeJson) + '\n\n' + cleanMessage;
          } else {
            text = cleanMessage;
          }
          
          // Also append any text generated after the JSON block (e.g. references)
          const textAfterJson = content.split(jsonMatch[0])[1]?.trim();
          if (textAfterJson && textAfterJson.length > 0) {
            text = text + '\n\n' + cleanMarkdownLeadingSpaces(textAfterJson);
          }
          
          return { text, action };
        }
      } catch (e) {
        // Invalid JSON inside match, fallback
      }
    }
  } catch (e) {
    // Parsing error
  }

  return { text: cleanMarkdownLeadingSpaces(text) };
}

export function isEmergencyMessage(content: string, action?: Action): boolean {
  if (action && (action.type === 'emergency' || action.label?.toLowerCase().includes('emergency') || action.label?.toLowerCase().includes('sos'))) {
    return true;
  }
  const lowerText = content.toLowerCase();
  return lowerText.includes('🚨') || lowerText.includes('emergency helplines') || lowerText.includes('sos') || (lowerText.includes('police') && lowerText.includes('ambulance') && lowerText.includes('112'));
}
