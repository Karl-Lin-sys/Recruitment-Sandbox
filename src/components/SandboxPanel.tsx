import React, { useState } from 'react';
import { FileText, Users, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateSandboxContent } from '../services/geminiService';

export function SandboxPanel() {
  const [rawNotes, setRawNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ jd: string; guide: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'jd' | 'guide'>('jd');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!rawNotes.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const { jd, guide } = await generateSandboxContent(rawNotes);
      setResult({ jd, guide });
    } catch (err: any) {
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = activeTab === 'jd' ? result.jd : result.guide;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <div className="p-6 pb-2 border-b border-gray-200 bg-white shadow-sm z-10">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Recruitment Sandbox
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Turn your raw thoughts and messy notes into a polished LinkedIn Job Description and a structured Behavioral Interview Guide.
        </p>
        
        <div className="relative mb-4">
          <textarea
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Paste your unorganized notes here... e.g., 'Looking for a senior frontend dev. Needs React, TypeScript. Must be good at mentoring juniors. Fast-paced startup vibe...'"
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !rawNotes.trim()}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Assets
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        {result ? (
          <>
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center gap-2 ${
                  activeTab === 'jd'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('jd')}
              >
                <FileText className="w-4 h-4" />
                LinkedIn Job Profile
              </button>
              <button
                className={`flex-1 py-3 px-4 font-medium text-sm flex items-center justify-center gap-2 ${
                  activeTab === 'guide'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('guide')}
              >
                <Users className="w-4 h-4" />
                Interview Guide
              </button>
            </div>
            <div className="relative flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <button
                onClick={handleCopy}
                className="absolute top-4 right-6 p-2 bg-white border border-gray-200 rounded-md shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all z-10 flex items-center gap-2 text-sm"
              >
                {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
              </button>
              
              <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="markdown-body prose prose-blue max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
                  <Markdown>{activeTab === 'jd' ? result.jd : result.guide}</Markdown>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
             <FileText className="w-16 h-16 mb-4 text-gray-300" />
             <p>Your generated Job Description and Interview Guide will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
