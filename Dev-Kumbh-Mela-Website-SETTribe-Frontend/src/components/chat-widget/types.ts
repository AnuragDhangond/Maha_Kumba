export interface Action {
  type: string;
  label: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: Action;
  autoPlay?: boolean;
  followups?: string[];
}
