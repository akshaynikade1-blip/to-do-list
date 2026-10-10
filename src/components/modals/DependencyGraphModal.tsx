import React from 'react';
import { X, GitBranch, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTaskStore } from '../../stores/useTaskStore';
import { useUIStore } from '../../stores/useUIStore';
import { extractDependencyGraphData } from '../../core/dependencyGraph';

export const DependencyGraphModal: React.FC = () => {
  const { isDependencyGraphOpen, closeDependencyGraph, openTaskModal } = useUIStore();
  const { tasks } = useTaskStore();

  if (!isDependencyGraphOpen) return null;

  const { nodes, edges } = extractDependencyGraphData(tasks);
  const tasksById = new Map(tasks.map((t) => [t.id, t]));

  // Build simple 2D coordinate layout for SVG rendering
  const nodeCount = nodes.length;
  const radius = 140;
  const centerX = 220;
  const centerY = 170;

  const nodePositions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, idx) => {
    // If few nodes, spread linearly or circle
    if (nodeCount <= 2) {
      nodePositions.set(node.id, {
        x: centerX + (idx === 0 ? -90 : 90),
        y: centerY
      });
    } else {
      const angle = (idx / nodeCount) * 2 * Math.PI - Math.PI / 2;
      nodePositions.set(node.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Task Dependency Graph (DAG)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Visual relationship map of prerequisites & blocked tasks
              </p>
            </div>
          </div>
          <button
            onClick={closeDependencyGraph}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Graph Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {nodes.length > 0 ? (
            <>
              {/* Interactive SVG Canvas */}
              <div className="relative rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 440 340"
                  className="w-full h-64 select-none"
                >
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {edges.map((edge, idx) => {
                    const start = nodePositions.get(edge.from);
                    const end = nodePositions.get(edge.to);
                    if (!start || !end) return null;

                    return (
                      <g key={`edge-${idx}`}>
                        <line
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke="#10B981"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          markerEnd="url(#arrow)"
                          opacity="0.8"
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const pos = nodePositions.get(node.id);
                    if (!pos) return null;

                    const isDone = node.status === 'completed';
                    const isLocked = node.isBlocked;

                    const fillColor = isDone
                      ? '#10B981'
                      : isLocked
                      ? '#F59E0B'
                      : '#3B82F6';

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className="cursor-pointer"
                        onClick={() => {
                          const task = tasksById.get(node.id);
                          if (task) openTaskModal(task);
                        }}
                      >
                        <circle
                          r="18"
                          fill={fillColor}
                          fillOpacity="0.2"
                          stroke={fillColor}
                          strokeWidth="2.5"
                        />
                        <circle r="6" fill={fillColor} />
                        <text
                          y="32"
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-[11px] font-medium fill-[var(--text-primary)]"
                        >
                          {node.title.length > 18
                            ? `${node.title.slice(0, 16)}...`
                            : node.title}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend & Breakdown List */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Ready / Unlocked</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Locked by Blocker</span>
                </div>
              </div>

              {/* Dependency Chain Cards */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Active Dependency Chains
                </h4>
                {edges.map((edge, idx) => {
                  const blocker = tasksById.get(edge.from);
                  const dependent = tasksById.get(edge.to);
                  if (!blocker || !dependent) return null;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`font-semibold truncate ${
                            blocker.status === 'completed'
                              ? 'line-through text-emerald-500'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {blocker.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span
                          className={`font-semibold truncate ${
                            dependent.status === 'completed'
                              ? 'line-through text-emerald-500'
                              : 'text-amber-500'
                          }`}
                        >
                          {dependent.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] flex-shrink-0">
                        {blocker.status === 'completed' ? 'Unlocked' : 'Blocked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                No dependencies defined yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Edit any task and select "Blocked By Other Tasks" to create an automated prerequisite link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
