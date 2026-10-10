import type { Subtask } from '../types';

export interface SplitResult {
  subtasks: Subtask[];
  confidence: number;
  source: 'rule-based' | 'custom-provider';
}

export type TaskSplitterFn = (title: string, description?: string) => Promise<SplitResult>;

const HEURISTIC_PATTERNS: Array<{
  keywords: string[];
  generate: (title: string) => Array<{ title: string; minutes: number }>;
}> = [
  {
    keywords: ['write', 'draft', 'article', 'essay', 'blog', 'report', 'readme', 'doc'],
    generate: (t) => [
      { title: `Gather sources & outline key points for "${t.slice(0, 30)}"`, minutes: 15 },
      { title: `Write first rough draft (focus on momentum)`, minutes: 25 },
      { title: `Edit clarity, fix grammar & tone`, minutes: 15 },
      { title: `Format headings, links & publish/send`, minutes: 10 },
    ]
  },
  {
    keywords: ['clean', 'tidy', 'organize', 'declutter', 'room', 'desk', 'house', 'kitchen'],
    generate: () => [
      { title: 'Clear floor & major surfaces', minutes: 10 },
      { title: 'Sort items into keep / trash / relocate piles', minutes: 15 },
      { title: 'Wipe down surfaces & dust', minutes: 10 },
      { title: 'Take out trash and return items to their spots', minutes: 5 },
    ]
  },
  {
    keywords: ['build', 'code', 'develop', 'implement', 'feature', 'app', 'refactor', 'api', 'fix'],
    generate: (t) => [
      { title: `Review specs & define data model for "${t.slice(0, 30)}"`, minutes: 15 },
      { title: `Build core logic & state handlers`, minutes: 30 },
      { title: `Connect UI & verify edge cases`, minutes: 20 },
      { title: `Write tests & clean up git commit`, minutes: 15 },
    ]
  },
  {
    keywords: ['study', 'learn', 'read', 'course', 'exam', 'book', 'tutorial'],
    generate: () => [
      { title: 'Skim overview and table of contents', minutes: 10 },
      { title: 'Deep focus reading & annotate core ideas', minutes: 30 },
      { title: 'Summarize 3 key insights in your own words', minutes: 15 },
      { title: 'Create flashcards or practice exercise', minutes: 15 },
    ]
  },
  {
    keywords: ['design', 'mockup', 'wireframe', 'figma', 'ui', 'ux', 'prototype'],
    generate: (t) => [
      { title: `Collect references & moodboard for "${t.slice(0, 30)}"`, minutes: 15 },
      { title: `Wireframe layout & typography hierarchy`, minutes: 25 },
      { title: `Refine color palette, spacing & icons`, minutes: 20 },
      { title: `Export assets & review accessibility contrast`, minutes: 10 },
    ]
  },
  {
    keywords: ['meeting', 'interview', 'presentation', 'pitch', 'call', 'talk'],
    generate: () => [
      { title: 'Define agenda & desired outcome', minutes: 10 },
      { title: 'Prepare supporting slides or bullet notes', minutes: 20 },
      { title: 'Rehearse key points once out loud', minutes: 10 },
      { title: 'Send follow-up action items after call', minutes: 10 },
    ]
  }
];

export async function defaultRuleBasedSplitter(title: string, description?: string): Promise<SplitResult> {
  const combined = `${title} ${description || ''}`.toLowerCase();

  for (const pattern of HEURISTIC_PATTERNS) {
    const matches = pattern.keywords.some((kw) => combined.includes(kw));
    if (matches) {
      const generated = pattern.generate(title);
      return {
        subtasks: generated.map((item, idx) => ({
          id: `auto-sub-${Date.now()}-${idx}`,
          title: item.title,
          completed: false,
          estimatedMinutes: item.minutes
        })),
        confidence: 0.9,
        source: 'rule-based'
      };
    }
  }

  // Fallback 4-phase breakdown
  return {
    subtasks: [
      { id: `auto-sub-${Date.now()}-0`, title: `Clarify objective & define completion criteria`, completed: false, estimatedMinutes: 10 },
      { id: `auto-sub-${Date.now()}-1`, title: `Gather required inputs or resources`, completed: false, estimatedMinutes: 15 },
      { id: `auto-sub-${Date.now()}-2`, title: `Execute core portion of task`, completed: false, estimatedMinutes: 25 },
      { id: `auto-sub-${Date.now()}-3`, title: `Review results and wrap up`, completed: false, estimatedMinutes: 10 }
    ],
    confidence: 0.75,
    source: 'rule-based'
  };
}

// Pluggable custom splitter slot (for future LLM API integration)
let customSplitter: TaskSplitterFn | null = null;

export function registerCustomSplitter(fn: TaskSplitterFn | null) {
  customSplitter = fn;
}

export async function splitTaskIntoSubtasks(title: string, description?: string): Promise<SplitResult> {
  if (customSplitter) {
    try {
      return await customSplitter(title, description);
    } catch {
      // Fallback silently to rule-based on network/api error
      return defaultRuleBasedSplitter(title, description);
    }
  }
  return defaultRuleBasedSplitter(title, description);
}
