
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Product } from '../types';

interface ShopGenieProps {
  products: Product[];
}

const ShopGenie: React.FC<ShopGenieProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const advice = await geminiService.getShoppingAdvice(query, products);
      setResponse(advice || 'I am sorry, I could not process that request.');
    } catch (err) {
      setResponse('Failed to connect to AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-semibold">Ask Genie</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Nexus Genie
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto bg-gray-50 text-sm">
            {response ? (
              <div className="space-y-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-900 border border-indigo-100 italic">
                  "{query}"
                </div>
                <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
                  {response}
                </div>
                <button 
                  onClick={() => setResponse(null)}
                  className="text-xs text-indigo-600 underline"
                >
                  Ask another question
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-4">
                <svg className="w-12 h-12 mb-2 text-indigo-100" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                </svg>
                <p>What can I help you find today? I know about all current listings.</p>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. 'Help me find a phone...'"
              className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShopGenie;
