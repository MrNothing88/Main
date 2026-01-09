import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-dark rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center px-4 animate-fade-in">
        <div className="mb-8 inline-block">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-secondary to-secondary-dark rounded-3xl flex items-center justify-center shadow-2xl glow">
            <i className="fa fa-sync text-4xl text-white animate-spin" style={{ animationDuration: '3s' }}></i>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-shadow">
          Smart Info Sync
        </h1>
        
        <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
          Intelligent document management with AI-powered insights
        </p>

        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;