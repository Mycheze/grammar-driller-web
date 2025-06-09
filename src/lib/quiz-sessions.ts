// Simple in-memory session storage
// Works because Next.js keeps this in memory during development
const sessions = new Map<string, any>();

export function createSession(sessionId: string, data: any) {
  sessions.set(sessionId, {
    ...data,
    createdAt: Date.now()
  });
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId: string, updates: any) {
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