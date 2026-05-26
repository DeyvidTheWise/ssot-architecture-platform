import type { Server as HttpServer } from "http";

type ProjectEventCallback = (eventName: string, payload: unknown) => void;

const projectSubscribers = new Map<string, Set<ProjectEventCallback>>();

export const initializeWebsocket = (_server: HttpServer): void => {
  // Transport adapter intentionally minimal for Phase 4.
};

export const subscribeProject = (projectId: string, callback: ProjectEventCallback): (() => void) => {
  if (!projectSubscribers.has(projectId)) {
    projectSubscribers.set(projectId, new Set<ProjectEventCallback>());
  }

  projectSubscribers.get(projectId)!.add(callback);

  return () => {
    const subscribers = projectSubscribers.get(projectId);
    if (!subscribers) {
      return;
    }

    subscribers.delete(callback);
    if (subscribers.size === 0) {
      projectSubscribers.delete(projectId);
    }
  };
};

export const emitToProject = (projectId: string, eventName: string, payload: unknown): void => {
  const subscribers = projectSubscribers.get(projectId);
  if (!subscribers) {
    return;
  }

  subscribers.forEach((callback) => {
    callback(eventName, payload);
  });
};