import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryAI, createAIInteraction } from '../services/api';
import { AIInteraction } from '../types';

interface AIGuidanceScreenProps {
  userId: string | null;
}

const AIGuidanceScreen: React.FC<AIGuidanceScreenProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactions, setInteractions] = useState<AIInteraction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ai_interactions');
    if (stored) {
      setInteractions(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !userId) return;

    setIsLoading(true);
    const userQuery = query;
    setQuery('');

    try {
      const response = await queryAI(userQuery);
      
      const newInteraction: AIInteraction = {
        id: crypto.randomUUID(),
        query: userQuery,
        response: JSON.stringify(response, null, 2),
        user_id: userId,
        document_id: null,
        created_at: new Date().toISOString(),
      };

      const updatedInteractions = [newInteraction, ...interactions];
      setInteractions(updatedInteractions);
      localStorage.setItem('ai_interactions', JSON.stringify(updatedInteractions));

      await createAIInteraction(newInteraction);
    } catch (error) {
      console.error('AI query failed:', error);
      const errorInteraction: AIInteraction = {
        id: crypto.randomUUID(),
        query: userQuery,
        response: 'Sorry, I encountered an error processing your request. Please try again.',
        user_id: userId,
        document_id: null,
        created_at: new Date().toISOString(),
      };
      const updatedInteractions = [errorInteraction, ...interactions];
      setInteractions(updatedInteractions);
      localStorage.setItem('ai_interactions', JSON.stringify(updatedInteractions));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    'Extract variables from: Hello ${Name}, welcome to ${CompanyName}',
    'What variable types are supported?',
    'How do I create a required variable?',
    'Explain transform options',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary">
      <div className="safe-top safe-bottom">
        {/* Header */}
        <header className="glass-effect border-b border-secondary/20 sticky top-0 z-40 safe-top">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/main')}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <i className="fa fa-arrow-left"></i>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center">
                <i className="fa fa-robot text-white text-lg"></i>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white">AI Guidance</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 pb-32 md:pb-6 max-w-4xl">
          {/* Suggested Queries */}
          {interactions.length === 0 && (
            <div className="mb-6 animate-slide-up">
              <h2 className="text-lg font-semibold text-white mb-4">Try asking:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQueries.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="p-4 bg-white/5 border border-secondary/20 rounded-xl text-left text-sm text-gray-300 hover:bg-white/10 hover:border-secondary/40 transition-all duration-300"
                  >
                    <i className="fa fa-lightbulb text-secondary mr-2"></i>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactions */}
          <div className="space-y-4 mb-6">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="space-y-3 animate-fade-in">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] md:max-w-[75%] bg-gradient-to-r from-secondary to-secondary-dark rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-white text-sm md:text-base break-words">{interaction.query}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] md:max-w-[75%] glass-effect border border-secondary/20 rounded-2xl rounded-tl-sm px-4 py-3">
                    <pre className="text-gray-300 text-sm md:text-base whitespace-pre-wrap break-words font-sans">
                      {interaction.response}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="glass-effect border border-secondary/20 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Form - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-secondary/20 safe-bottom z-50">
          <form onSubmit={handleSubmit} className="container mx-auto px-4 py-4 max-w-4xl">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask AI about variables, document processing..."
                  rows={1}
                  className="w-full px-4 py-3 bg-white/5 border border-secondary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors resize-none"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-secondary/50 transition-all duration-300 flex-shrink-0"
                aria-label="Send query"
              >
                {isLoading ? (
                  <i className="fa fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa fa-paper-plane"></i>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIGuidanceScreen;