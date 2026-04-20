import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Something went wrong</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            The page encountered an error. Please try reloading or contact support if the issue persists.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-transform"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
