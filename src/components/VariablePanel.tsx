import React, { useState, useEffect } from 'react';
import { Document, Variable } from '../types';
import { getVariables, createVariable, updateVariable } from '../services/api';
import { renderContent } from '../utils/variableRenderer';

interface VariablePanelProps {
  document: Document;
  onVariableUpdate: (variables: Variable[]) => void;
  isMobile: boolean;
}

const VariablePanel: React.FC<VariablePanelProps> = ({ document, onVariableUpdate, isMobile }) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVariables();
  }, [document.id]);

  const loadVariables = async () => {
    setIsLoading(true);
    try {
      const vars = await getVariables(document.id);
      setVariables(vars);
      const values: Record<string, string> = {};
      vars.forEach(v => {
        values[v.name] = v.value || v.default_value || '';
      });
      setVariableValues(values);
    } catch (error) {
      console.error('Failed to load variables:', error);
      if (document.metadata?.variables) {
        const metaVars = document.metadata.variables.map(v => ({
          id: crypto.randomUUID(),
          name: v.name,
          value: v.default_value || '',
          type: v.type,
          default_value: v.default_value,
          document_id: document.id,
        }));
        setVariables(metaVars);
        const values: Record<string, string> = {};
        metaVars.forEach(v => {
          values[v.name] = v.value || v.default_value || '';
        });
        setVariableValues(values);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableChange = async (name: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));

    const existingVar = variables.find(v => v.name === name);
    const metaVar = document.metadata?.variables?.find(v => v.name === name);

    try {
      if (existingVar) {
        const updated = await updateVariable({
          ...existingVar,
          value,
        });
        setVariables(variables.map(v => v.id === updated.id ? updated : v));
      } else if (metaVar) {
        const newVar: Partial<Variable> = {
          name,
          value,
          type: metaVar.type,
          default_value: metaVar.default_value,
          document_id: document.id,
        };
        const created = await createVariable(newVar);
        setVariables([...variables, created]);
      }
    } catch (error) {
      console.error('Failed to save variable:', error);
    }
  };

  const renderedContent = renderContent(document.content, variableValues);
  const metaVariables = document.metadata?.variables || [];

  return (
    <div className={`${isMobile ? 'p-4' : ''} space-y-4`}>
      {/* Variable Inputs */}
      <div className="glass-effect border border-secondary/20 rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fa fa-sliders text-secondary mr-2"></i>
          Variables ({metaVariables.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                <div className="h-10 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : metaVariables.length === 0 ? (
          <div className="text-center py-8">
            <i className="fa fa-code text-4xl text-gray-600 mb-3"></i>
            <p className="text-gray-400 text-sm">No variables detected</p>
            <p className="text-gray-500 text-xs mt-1">Add variables to your content using {'${VariableName}'}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
            {metaVariables.map((variable) => (
              <div key={variable.name}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {variable.name}
                  {variable.required && <span className="text-red-400 ml-1">*</span>}
                  <span className="ml-2 text-xs text-gray-500">({variable.type})</span>
                </label>
                {variable.type === 'textarea' ? (
                  <textarea
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    rows={3}
                    placeholder={variable.default_value || `Enter ${variable.name}...`}
                    className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors resize-none"
                  />
                ) : variable.type === 'number' ? (
                  <input
                    type="number"
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    placeholder={variable.default_value || `Enter ${variable.name}...`}
                    className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                  />
                ) : variable.type === 'date' ? (
                  <input
                    type="date"
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    placeholder={variable.default_value || `Enter ${variable.name}...`}
                    className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="glass-effect border border-secondary/20 rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fa fa-eye text-secondary mr-2"></i>
          Live Preview
        </h2>
        <div className="bg-white/5 border border-secondary/20 rounded-xl p-4 min-h-[200px] max-h-96 overflow-y-auto scrollbar-hide">
          <pre className="text-gray-300 text-sm whitespace-pre-wrap break-words font-sans">
            {renderedContent}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default VariablePanel;