import React from 'react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onSelectDocument: (doc: Document) => void;
  selectedDocumentId?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  onSelectDocument,
  selectedDocumentId,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-effect border border-secondary/20 rounded-xl p-4 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="glass-effect border border-secondary/20 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
          <i className="fa fa-file text-2xl text-secondary"></i>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
        <p className="text-gray-400">Create your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelectDocument(doc)}
          className={`w-full text-left glass-effect border rounded-xl p-4 transition-all duration-300 hover:border-secondary/60 ${
            selectedDocumentId === doc.id
              ? 'border-secondary glow'
              : 'border-secondary/20'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate flex-1 pr-4">
              {doc.title}
            </h3>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {doc.metadata?.count > 0 && (
                <span className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-lg">
                  {doc.metadata.count} vars
                </span>
              )}
              <i className="fa fa-chevron-right text-gray-400 text-sm"></i>
            </div>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 break-words">
            {doc.content}
          </p>
          {doc.created_at && (
            <p className="text-xs text-gray-500 mt-2">
              {new Date(doc.created_at).toLocaleDateString()}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

export default DocumentList;