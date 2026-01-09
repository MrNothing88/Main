import React, { useState, useEffect, useCallback } from 'react';
import { Document } from '../types';
import { parseVariables } from '../utils/variableParser';
import debounce from '../utils/debounce';

interface DocumentEditorProps {
  document: Document;
  onUpdate: (doc: Document) => void;
  isMobile: boolean;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, onUpdate, isMobile }) => {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
  }, [document]);

  const debouncedUpdate = useCallback(
    debounce(async (updatedTitle: string, updatedContent: string) => {
      setIsSaving(true);
      const variables = parseVariables(updatedContent);
      const updatedDoc: Document = {
        ...document,
        title: updatedTitle,
        content: updatedContent,
        metadata: {
          variables,
          count: variables.length,
          types_found: [...new Set(variables.map(v => v.type))],
        },
      };
      await onUpdate(updatedDoc);
      setIsSaving(false);
    }, 1000),
    [document, onUpdate]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedUpdate(newTitle, content);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedUpdate(title, newContent);
  };

  return (
    <div className={`${isMobile ? 'p-4' : ''} space-y-4`}>
      <div className="glass-effect border border-secondary/20 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <i className="fa fa-edit text-secondary mr-2"></i>
            Editor
          </h2>
          {isSaving && (
            <span className="text-xs text-gray-400 flex items-center">
              <i className="fa fa-spinner animate-spin mr-2"></i>
              Saving...
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
              placeholder="Enter document title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={isMobile ? 12 : 16}
              className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors resize-none font-mono text-sm"
              placeholder="Type your content with variables like ${VariableName}..."
            />
          </div>

          <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
              <i className="fa fa-info-circle text-secondary mr-2"></i>
              Variable Syntax Guide
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              <p><code className="bg-white/10 px-2 py-1 rounded">{'${Name}'}</code> - Simple text variable</p>
              <p><code className="bg-white/10 px-2 py-1 rounded">{'${*Required}'}</code> - Required variable</p>
              <p><code className="bg-white/10 px-2 py-1 rounded">{'${Date::date::YYYY-MM-DD}'}</code> - Date variable</p>
              <p><code className="bg-white/10 px-2 py-1 rounded">{'${Amount::number}'}</code> - Number variable</p>
              <p><code className="bg-white/10 px-2 py-1 rounded">{'${Text::~Default}'}</code> - With default value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;