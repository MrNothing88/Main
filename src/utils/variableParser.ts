import { VariableMetadata } from '../types';

export function parseVariables(content: string): VariableMetadata[] {
  const variableRegex = /\$\{([^}]+)\}/g;
  const variables: VariableMetadata[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const fullSyntax = match[1];
    const parts = fullSyntax.split('::');
    
    let name = parts[0];
    const required = name.startsWith('*');
    if (required) {
      name = name.substring(1);
    }

    if (seen.has(name)) continue;
    seen.add(name);

    let type = 'text';
    let defaultValue: string | null = null;
    let transform: string | null = null;
    let format: string | null = null;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('~')) {
        defaultValue = part.substring(1);
      } else if (part === 'textarea' || part === 'ta') {
        type = 'textarea';
      } else if (part === 'number') {
        type = 'number';
      } else if (part === 'date' || part === 'd') {
        type = 'date';
        if (i + 1 < parts.length) {
          format = parts[i + 1];
          i++;
        }
      } else if (part === 'transform') {
        type = 'transform';
        if (i + 1 < parts.length) {
          transform = parts[i + 1];
          i++;
        }
      } else if (part === 'hidden') {
        type = 'hidden';
      }
    }

    variables.push({
      name,
      type,
      required,
      default_value: defaultValue,
      transform,
      format,
      original_syntax: match[0],
    });
  }

  return variables;
}