export type QueueEntry = {
  socketId: string;
  clientId: string;
  joinedAt: number;
};

const queue: QueueEntry[] = [];

export function enqueue(entry: QueueEntry): void {
  const exists = queue.some((item) => item.socketId === entry.socketId);
  if (!exists) {
    queue.push(entry);
  }
}

export function dequeue(socketId: string): void {
  const index = queue.findIndex((item) => item.socketId === socketId);
  if (index >= 0) {
    queue.splice(index, 1);
  }
}

export function popMatchPair(): [QueueEntry, QueueEntry] | null {
  if (queue.length < 2) {
    return null;
  }
  const first = queue.shift();
  const second = queue.shift();
  if (!first || !second) {
    return null;
  }
  return [first, second];
}

export function isQueued(socketId: string): boolean {
  return queue.some((item) => item.socketId === socketId);
}
