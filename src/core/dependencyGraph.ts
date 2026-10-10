import type { Task } from '../types';

export interface BlockerCheckResult {
  isBlocked: boolean;
  unresolvedBlockers: Task[];
  resolvedBlockers: Task[];
}

export function checkTaskDependencies(
  task: Task,
  tasksById: Map<string, Task>
): BlockerCheckResult {
  if (!task.blockedByTaskIds || task.blockedByTaskIds.length === 0) {
    return {
      isBlocked: false,
      unresolvedBlockers: [],
      resolvedBlockers: []
    };
  }

  const unresolvedBlockers: Task[] = [];
  const resolvedBlockers: Task[] = [];

  for (const blockerId of task.blockedByTaskIds) {
    const blocker = tasksById.get(blockerId);
    if (blocker) {
      if (blocker.status === 'completed') {
        resolvedBlockers.push(blocker);
      } else {
        unresolvedBlockers.push(blocker);
      }
    }
  }

  return {
    isBlocked: unresolvedBlockers.length > 0,
    unresolvedBlockers,
    resolvedBlockers
  };
}

/**
 * Checks if adding blockerId -> targetTaskId would introduce a directed cycle.
 */
export function wouldCreateDependencyCycle(
  allTasks: Task[],
  proposedBlockerId: string,
  targetTaskId: string
): boolean {
  if (proposedBlockerId === targetTaskId) return true;

  const graph = new Map<string, string[]>();
  for (const t of allTasks) {
    graph.set(t.id, [...(t.blockedByTaskIds || [])]);
  }

  // Add the proposed edge: targetTaskId is blocked by proposedBlockerId
  const current = graph.get(targetTaskId) || [];
  graph.set(targetTaskId, [...current, proposedBlockerId]);

  // DFS to check if proposedBlockerId can reach targetTaskId
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const taskId of graph.keys()) {
    if (!visited.has(taskId)) {
      if (dfs(taskId)) return true;
    }
  }

  return false;
}

export interface GraphNode {
  id: string;
  title: string;
  status: string;
  isBlocked: boolean;
  blockersCount: number;
}

export interface GraphEdge {
  from: string; // Blocker ID
  to: string;   // Dependent Task ID
}

export function extractDependencyGraphData(allTasks: Task[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const tasksById = new Map(allTasks.map((t) => [t.id, t]));
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Filter only tasks involved in dependency relationships
  const involvedTaskIds = new Set<string>();

  for (const task of allTasks) {
    if (task.blockedByTaskIds && task.blockedByTaskIds.length > 0) {
      involvedTaskIds.add(task.id);
      for (const blockerId of task.blockedByTaskIds) {
        involvedTaskIds.add(blockerId);
        edges.push({
          from: blockerId,
          to: task.id
        });
      }
    }
  }

  for (const id of involvedTaskIds) {
    const task = tasksById.get(id);
    if (task) {
      const check = checkTaskDependencies(task, tasksById);
      nodes.push({
        id: task.id,
        title: task.title,
        status: task.status,
        isBlocked: check.isBlocked,
        blockersCount: check.unresolvedBlockers.length
      });
    }
  }

  return { nodes, edges };
}
