import React, { useState } from 'react';
import { GeneratedContent, ContentTheme, PublishingPlatform } from '../types';
import { User, Globe, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Send, Linkedin, Twitter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PostPreviewProps {
  content: GeneratedContent | null;
  isLoading: boolean;
}

const ThemeBadge: React.FC<{ theme: ContentTheme }> = ({ theme }) => {
  const colors = {
    [ContentTheme.Infrastructure]: 'bg-blue-900 text-blue-200 border-blue-700',
    [ContentTheme.Sovereignty]: 'bg-purple-900 text-purple-200 border-purple-700',
    [ContentTheme.Wealth]: 'bg-yellow-900 text-yellow-200 border-yellow-700',
    [ContentTheme.AI]: 'bg-emerald-900 text-emerald-200 border-emerald-700',
    [ContentTheme.Unclassified]: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${colors[theme] || colors[ContentTheme.Unclassified]}`}>
      {theme}
    </span>
  );
};

export const PostPreview: React.FC<PostPreviewProps> = ({ content, isLoading }) => {
  const [viewPlatform, setViewPlatform] = useState<'LINKEDIN' | 'X'>('LINKEDIN');

  if (!content && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-rd-dim border-2 border-dashed border-rd-panel rounded-xl p-8 bg-rd-dark/50">
        <div className="w-16 h-16 rounded-full bg-rd-panel mb-4 flex items-center justify-center">
          <Globe className="w-8 h-8 opacity-20" />
        </div>
        <p className="font-mono text-sm">AWAITING INPUT STREAM...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Platform Toggle */}
      <div className="flex gap-2 mb-4 justify-end">
        <button 
          onClick={() => setViewPlatform('LINKEDIN')}
          className={`p-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${viewPlatform === 'LINKEDIN' ? 'bg-[#0077b5] text-white' : 'bg-rd-panel text-gray-500'}`}
        >
          <Linkedin size={14} /> PREVIEW
        </button>
        <button 
          onClick={() => setViewPlatform('X')}
          className={`p-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${viewPlatform === 'X' ? 'bg-white text-black' : 'bg-rd-panel text-gray-500'}`}
        >
          <Twitter size={14} /> PREVIEW
        </button>
      </div>

      <div className={`bg-white text-black rounded-lg overflow-hidden shadow-2xl mx-auto border border-gray-200 relative w-full max-w-xl transition-all ${viewPlatform === 'X' ? 'max-w-md' : 'max-w-xl'}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
             <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-rd-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-rd-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-rd-black rounded-full animate-bounce"></div>
            </div>
            <p className="font-mono text-sm text-gray-600 animate-pulse">THINKING LIKE RD...</p>
          </div>
        )}

        {/* Header based on Platform */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white font-bold">
                  RD
                </div>
                {viewPlatform === 'LINKEDIN' && <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-sm leading-tight">Rume Dominic {viewPlatform === 'X' && <span className="text-gray-500 font-normal">@dominicrume</span>}</h3>
                  {viewPlatform === 'LINKEDIN' && <span className="text-gray-500 text-xs">• 1st</span>}
                </div>
                {viewPlatform === 'LINKEDIN' && (
                  <>
                    <p className="text-xs text-gray-500 leading-tight">Founder @ Vorem • Building Digital Sovereignty</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <span>1h</span>
                      <span>•</span>
                      <Globe size={12} />
                    </div>
                  </>
                )}
              </div>
            </div>
            <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {content && (
            <>
              {viewPlatform === 'LINKEDIN' && <div className="mb-3"><ThemeBadge theme={content.theme} /></div>}
              
              {/* Hook (Headline) */}
              <div className="font-bold mb-4 text-gray-900 text-base">
                {content.hook}
              </div>

              {/* Body */}
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed space-y-4">
                <ReactMarkdown 
                  components={{
                     strong: ({node, ...props}) => <span className="font-bold text-black" {...props} />,
                     ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1" {...props} />,
                     p: ({node, ...props}) => <div className="mb-3" {...props} />
                  }}
                >
                  {viewPlatform === 'X' ? content.body.substring(0, 280) + '...' : content.body}
                </ReactMarkdown>
              </div>

              {/* CTA */}
              <div className="mt-6 text-sm text-blue-600 font-medium hover:underline cursor-pointer">
                {content.cta}
              </div>
               
               <div className="mt-4 text-xs text-gray-400 font-mono">
                 #Vorem #Blockchain #Sovereignty #RD1
               </div>

               {viewPlatform === 'X' && (
                  <div className="mt-2 text-xs text-red-500 font-mono border-t pt-2 border-gray-100">
                     {content.body.length > 280 ? `⚠️ Content truncated for X (${content.body.length} chars)` : '✅ Fits in Tweet'}
                  </div>
               )}
            </>
          )}
        </div>

        {/* Engagement Footer */}
        <div className="px-4 py-2 border-t border-gray-100 mt-2">
          {viewPlatform === 'LINKEDIN' ? (
            <>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">👍</div>
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">❤️</div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] text-white">💡</div>
                </div>
                <span>842 • 124 comments</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-1">
                <button className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 rounded text-gray-500 text-sm font-medium transition-colors">
                  <ThumbsUp size={18} /> Like
                </button>
                <button className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 rounded text-gray-500 text-sm font-medium transition-colors">
                  <MessageSquare size={18} /> Comment
                </button>
                <button className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 rounded text-gray-500 text-sm font-medium transition-colors">
                  <Share2 size={18} /> Repost
                </button>
                <button className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 rounded text-gray-500 text-sm font-medium transition-colors">
                  <Send size={18} /> Send
                </button>
              </div>
            </>
          ) : (
             <div className="flex justify-between py-2 text-gray-500">
                <MessageSquare size={16} />
                <Share2 size={16} />
                <ThumbsUp size={16} />
                <Share2 size={16} />
             </div>
          )}
        </div>
      </div>
    </div>
  );
};