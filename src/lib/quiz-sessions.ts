// Simple in-memory session storage
// Works because Next.js keeps this in memory during development

interface SessionData {
  createdAt: number;
  [key: string]: unknown;
}

const sessions = new Map<string, SessionData>();

export function createSession(sessionId: string, data: Record<string, unknown>) {
  sessions.set(sessionId, {
    ...data,
    createdAt: Date.now()
  });
}

export function getSession(sessionId: string): SessionData | null {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId: string, updates: Record<string, unknown>) {
  const session = sessions.get(sessionId);
  if (session) {
    sessions.set(sessionId, { ...session, ...updates });
    return true;
  }
  return false;
}

export function sessionExists(sessionId: string) {
  return sessions.has(sessionId);
}

// Debug function
export function getSessionCount() {
  return sessions.size;
}