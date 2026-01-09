export function renderContent(
  content: string,
  variableValues: Record<string, string>
): string {
  const variableRegex = /\$\{([^}]+)\}/g;

  return content.replace(variableRegex, (match, fullSyntax) => {
    const parts = fullSyntax.split('::');
    let name = parts[0];
    
    const required = name.startsWith('*');
    if (required) {
      name = name.substring(1);
    }

    let value = variableValues[name] || '';
    let defaultValue: string | null = null;
    let transform: string | null = null;
    let isHidden = false;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('~')) {
        defaultValue = part.substring(1);
      } else if (part === 'transform') {
        if (i + 1 < parts.length) {
          transform = parts[i + 1];
          i++;
        }
      } else if (part === 'hidden') {
        isHidden = true;
      }
    }

    if (isHidden) {
      return '';
    }

    if (!value && defaultValue) {
      value = defaultValue;
    }

    if (transform && value) {
      switch (transform) {
        case 'uppercase':
          value = value.toUpperCase();
          break;
        case 'lowercase':
          value = value.toLowerCase();
          break;
        case 'capitalize':
          value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
          break;
        case 'titlecase':
          value = value
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          break;
      }
    }

    return value || match;
  });
}