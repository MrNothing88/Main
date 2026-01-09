export interface User {
  id: string;
  provider: string;
  created_at?: string;
}

export interface VariableMetadata {
  name: string;
  type: string;
  required: boolean;
  default_value: string | null;
  transform: string | null;
  format: string | null;
  original_syntax: string;
}

export interface DocumentMetadata {
  variables: VariableMetadata[];
  count: number;
  types_found: string[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  user_id: string;
  created_at?: string;
}

export interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
  default_value: string | null;
  document_id: string;
  created_at?: string;
}

export interface AIInteraction {
  id: string;
  query: string;
  response: string;
  document_id: string | null;
  user_id: string;
  created_at?: string;
}