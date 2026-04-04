/**
 * Client-side contact-info detection.
 * The same logic runs server-side in messages.py — this is just for instant UI feedback.
 */

const PATTERNS: { re: RegExp; label: string }[] = [
  // Kenyan phone numbers
  {
    re: /\b(?:\+?254|0)[17]\d[\s\-.]?\d{3}[\s\-.]?\d{3}[\s\-.]?\d{3}\b/i,
    label: 'phone number',
  },
  // Generic 10-digit sequence (with optional separators)
  {
    re: /\b\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d[\s\-.]?\d\b/,
    label: 'phone number',
  },
  // Email address
  {
    re: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i,
    label: 'email address',
  },
  // Messaging apps / links
  {
    re: /\b(?:whatsapp|telegram|signal|viber|wa\.me|t\.me)\b/i,
    label: 'messaging app',
  },
  // Social handles
  { re: /@[a-zA-Z0-9_]{2,}/, label: 'social handle' },
  // Explicit contact-sharing phrases
  {
    re: /\b(?:call me|my number|my phone|reach me|contact me|email me|phone me|ring me|text me|inbox me|dm me|slide into|hit me up|my whatsapp|find me on|add me on)\b/i,
    label: 'contact request',
  },
  // Spelled-out digit sequences (5+ consecutive number words)
  {
    re: /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|oh)(?:\s+(?:zero|one|two|three|four|five|six|seven|eight|nine|oh)){4,}\b/i,
    label: 'phone number (written out)',
  },
];

export interface ContactCheckResult {
  flagged: boolean;
  reason?: string;
}

export function detectContactInfo(text: string): ContactCheckResult {
  for (const { re, label } of PATTERNS) {
    if (re.test(text)) {
      return { flagged: true, reason: label };
    }
  }
  return { flagged: false };
}
