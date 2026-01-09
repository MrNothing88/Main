import React, { useState } from 'react';
import { Document } from '../types';
import { parseVariables } from '../utils/variableParser';

interface SyntaxPanelProps {
  document: Document;
  isMobile: boolean;
}

const SyntaxPanel: React.FC<SyntaxPanelProps> = ({ document, isMobile }) => {
  const [activeTab, setActiveTab] = useState<'syntax' | 'actions'>('syntax');
  
  const variables = parseVariables(document.content);
  const syntaxElements = variables.map(v => v.original_syntax);

  const generateDocument = () => {
    // Create a new document with understanding and actions based on syntax
    const understanding = `This document contains ${variables.length} variable(s) with the following syntax patterns:\n\n` +
      variables.map(v => `• ${v.name} (${v.type}${v.required ? ', required' : ''})`).join('\n');
    
    const actions = variables.map(v => {
      const action = `Process variable "${v.name}" of type "${v.type}"`;
      if (v.required) return action + ' - REQUIRED';
      if (v.default_value) return action + ` with default: "${v.default_value}"`;
      return action;
    }).join('\n');

    const newContent = `DOCUMENT UNDERSTANDING:\n${understanding}\n\nACTIONS TO PERFORM:\n${actions}\n\nORIGINAL CONTENT:\n${document.content}`;
    
    // This would typically create a new document via API
    console.log('Generated document with understanding and actions:', newContent);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(newContent).then(() => {
      alert('Document with understanding and actions copied to clipboard!');
    });
  };

  return (
    <div className={`${isMobile ? 'p-4' : ''} space-y-4`}>
      <div className="glass-effect border border-secondary/20 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <i className="fa fa-code text-secondary mr-2"></i>
            Syntax Analysis
          </h2>
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('syntax')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'syntax' 
                  ? 'bg-secondary text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Syntax
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'actions' 
                  ? 'bg-secondary text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Actions
            </button>
          </div>
        </div>

        {activeTab === 'syntax' ? (
          <div className="space-y-4">
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <i className="fa fa-search text-secondary mr-2"></i>
                Detected Syntax ({syntaxElements.length})
              </h3>
              {syntaxElements.length === 0 ? (
                <p className="text-gray-400 text-sm">No variable syntax detected in document</p>
              ) : (
                <div className="space-y-2">
                  {syntaxElements.map((syntax, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <code className="text-secondary text-sm font-mono">{syntax}</code>
                      <div className="mt-1 text-xs text-gray-400">
                        Variable: {variables[index].name} | Type: {variables[index].type}
                        {variables[index].required && ' | Required'}
                        {variables[index].default_value && ` | Default: ${variables[index].default_value}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <i className="fa fa-lightbulb text-secondary mr-2"></i>
                Understanding
              </h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• Document contains <strong>{variables.length}</strong> variable(s)</p>
                <p>• Variable types found: <strong>{[...new Set(variables.map(v => v.type))].join(', ') || 'none'}</strong></p>
                <p>• Required variables: <strong>{variables.filter(v => v.required).length}</strong></p>
                <p>• Variables with defaults: <strong>{variables.filter(v => v.default_value).length}</strong></p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <i className="fa fa-cogs text-secondary mr-2"></i>
                Recommended Actions
              </h3>
              {variables.length === 0 ? (
                <p className="text-gray-400 text-sm">No actions available - add variables to enable processing</p>
              ) : (
                <div className="space-y-3">
                  {variables.map((variable, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{variable.name}</h4>
                          <p className="text-gray-400 text-xs mt-1">
                            Process {variable.type} variable
                            {variable.required && ' (Required)'}
                            {variable.default_value && ` with default: "${variable.default_value}"`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          {variable.required && (
                            <span className="w-2 h-2 bg-red-400 rounded-full" title="Required"></span>
                          )}
                          {variable.default_value && (
                            <span className="w-2 h-2 bg-green-400 rounded-full" title="Has default"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={generateDocument}
              disabled={variables.length === 0}
              className="w-full px-4 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-xl font-medium hover:shadow-lg hover:shadow-secondary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <i className="fa fa-file-alt"></i>
              <span>Generate Document with Understanding & Actions</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyntaxPanel;