import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-10 max-w-lg w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            An unexpected error occurred. The development team has been notified.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-xs text-red-700 overflow-auto max-h-32">
                                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                                {this.state.error.toString()}
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25"
                        >
                            Return to Homepage
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
