import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentList from '../components/DocumentList';
import DocumentEditor from '../components/DocumentEditor';
import VariablePanel from '../components/VariablePanel';
import SyntaxPanel from '../components/SyntaxPanel';
import { getDocuments, createDocument, updateDocument } from '../services/api';
import { Document, Variable } from '../types';

interface MainScreenProps {
  userId: string | null;
}

const MainScreen: React.FC<MainScreenProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activePanel, setActivePanel] = useState<'variables' | 'syntax'>('variables');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDocuments = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const docs = await getDocuments(userId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateDocument = async () => {
    if (!userId) return;

    const newDoc: Partial<Document> = {
      title: 'New Document',
      content: 'Start typing your document with variables like ${VariableName}...',
      metadata: { variables: [], count: 0, types_found: [] },
      user_id: userId,
    };

    try {
      const created = await createDocument(newDoc);
      setDocuments([created, ...documents]);
      setSelectedDocument(created);
      setShowEditor(true);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowEditor(true);
  };

  const handleUpdateDocument = async (updatedDoc: Document) => {
    try {
      const updated = await updateDocument(updatedDoc);
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
      setSelectedDocument(updated);
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const handleVariableUpdate = (variables: Variable[]) => {
    if (selectedDocument) {
      const updatedDoc = {
        ...selectedDocument,
        metadata: {
          ...selectedDocument.metadata,
          variables,
          count: variables.length,
        },
      };
      handleUpdateDocument(updatedDoc);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary">
      <div className="safe-top safe-bottom">
        {/* Header */}
        <header className="glass-effect border-b border-secondary/20 sticky top-0 z-40 safe-top">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                  <i className="fa fa-sync text-white text-lg"></i>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Smart Info Sync</h1>
              </div>
              <button
                onClick={() => navigate('/ai-guidance')}
                className="w-10 h-10 md:w-12 md:h-12 bg-secondary hover:bg-secondary-dark rounded-xl flex items-center justify-center transition-all duration-300 glow-hover"
                aria-label="AI Guidance"
              >
                <i className="fa fa-robot text-white text-lg"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          {!showEditor || !isMobile ? (
            <div className="space-y-6">
              {/* Search and Create */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <i className="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
                <button
                  onClick={handleCreateDocument}
                  className="px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-xl font-medium hover:shadow-lg hover:shadow-secondary/50 transition-all duration-300 flex items-center justify-center space-x-2 min-h-[48px]"
                >
                  <i className="fa fa-plus"></i>
                  <span>New Document</span>
                </button>
              </div>

              {/* Document List */}
              <DocumentList
                documents={filteredDocuments}
                isLoading={isLoading}
                onSelectDocument={handleSelectDocument}
                selectedDocumentId={selectedDocument?.id}
              />
            </div>
          ) : null}

          {/* Editor View - Desktop Split, Mobile Full */}
          {showEditor && selectedDocument && (
            <div className={`${isMobile ? 'fixed inset-0 z-50 bg-primary' : 'mt-6'}`}>
              {isMobile && (
                <div className="glass-effect border-b border-secondary/20 px-4 py-3 flex items-center safe-top">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <i className="fa fa-arrow-left"></i>
                  </button>
                  <h2 className="ml-3 text-lg font-semibold text-white truncate flex-1">
                    {selectedDocument.title}
                  </h2>
                  <div className="flex bg-white/5 rounded-lg p-1 ml-3">
                    <button
                      onClick={() => setActivePanel('variables')}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        activePanel === 'variables' 
                          ? 'bg-secondary text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Variables
                    </button>
                    <button
                      onClick={() => setActivePanel('syntax')}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        activePanel === 'syntax' 
                          ? 'bg-secondary text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Syntax
                    </button>
                  </div>
                </div>
              )}
              
              <div className={`${isMobile ? 'h-full overflow-y-auto' : 'grid md:grid-cols-3 gap-6'}`}>
                <DocumentEditor
                  document={selectedDocument}
                  onUpdate={handleUpdateDocument}
                  isMobile={isMobile}
                />
                
                {isMobile ? (
                  activePanel === 'variables' ? (
                    <VariablePanel
                      document={selectedDocument}
                      onVariableUpdate={handleVariableUpdate}
                      isMobile={isMobile}
                    />
                  ) : (
                    <SyntaxPanel
                      document={selectedDocument}
                      isMobile={isMobile}
                    />
                  )
                ) : (
                  <>
                    <VariablePanel
                      document={selectedDocument}
                      onVariableUpdate={handleVariableUpdate}
                      isMobile={isMobile}
                    />
                    <SyntaxPanel
                      document={selectedDocument}
                      isMobile={isMobile}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && !showEditor && (
          <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-secondary/20 safe-bottom z-50">
            <div className="flex items-center justify-around py-2">
              <button className="flex flex-col items-center justify-center py-2 px-4 text-secondary">
                <i className="fa fa-table text-xl mb-1"></i>
                <span className="text-xs">Documents</span>
              </button>
              <button
                onClick={handleCreateDocument}
                className="flex flex-col items-center justify-center py-2 px-4 text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa fa-plus text-xl mb-1"></i>
                <span className="text-xs">Create</span>
              </button>
              <button
                onClick={() => navigate('/ai-guidance')}
                className="flex flex-col items-center justify-center py-2 px-4 text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa fa-robot text-xl mb-1"></i>
                <span className="text-xs">AI Guide</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default MainScreen;