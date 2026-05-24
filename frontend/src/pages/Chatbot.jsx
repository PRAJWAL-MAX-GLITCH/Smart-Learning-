import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import aiService from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { 
    Sparkles, Trash2, Send, Loader2, ArrowLeft, 
    BookOpen, MessageSquare, GraduationCap, Code2, 
    Calculator, Atom, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Chatbot = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Fetch message history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                setFetchingHistory(true);
                const data = await aiService.getChatHistory();
                setMessages(data.history || []);
            } catch (err) {
                console.error("Failed to load chat history", err);
                toast.error("Could not load chat history");
            } finally {
                setFetchingHistory(false);
            }
        };
        loadHistory();
    }, []);

    // Send Message
    const handleSend = async (textToSend) => {
        const text = textToSend || input;
        if (!text.trim() || loading) return;

        setInput('');
        setLoading(true);

        // Add user message to UI immediately
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: text,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const data = await aiService.sendChatMessage(text);
            const botMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.reply,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error("Failed to send message", err);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Sorry, I couldn't understand that. Try asking in a simpler way.",
                created_at: new Date().toISOString(),
                is_error: true
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error("Failed to communicate with AI");
        } finally {
            setLoading(false);
            // Re-focus input
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Clear Chat
    const handleClearChat = async () => {
        if (messages.length === 0) {
            toast.error("Nothing to clear!");
            return;
        }

        const confirmClear = window.confirm("Are you sure you want to clear your chat history? This cannot be undone.");
        if (!confirmClear) return;

        try {
            setLoading(true);
            await aiService.clearChatHistory();
            setMessages([]);
            toast.success("Chat history cleared!");
        } catch (err) {
            console.error("Failed to clear chat history", err);
            toast.error("Could not clear chat history");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuery = (queryText) => {
        handleSend(queryText);
    };

    const formatMessageTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    };

    // Helper to format/parse text line breaks and inline code ticks
    const renderMessageContent = (content) => {
        if (!content) return '';
        
        // Simple inline code backticks parser e.g. `code` -> <code>
        const parts = content.split(/(`[^`]+`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={i} className="px-2 py-0.5 bg-gray-150 font-mono text-xs rounded text-blue-600 break-words">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            return part;
        });
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-xs font-black uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Panel: Info and controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                                        <Sparkles size={24} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">AI Assistant</h2>
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Universal Support</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-50 pt-6">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick Instructions</h4>
                                    <p className="text-xs text-gray-500 font-bold leading-relaxed">
                                        Ask anything from Math, Science, or Programming. I will explain concepts using simple language, step-by-step guidance, and clear analogies.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Subjects Covered</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                            <Calculator size={14} className="text-blue-500" />
                                            <span className="text-[10px] font-black text-gray-600">Math</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                            <Atom size={14} className="text-purple-500" />
                                            <span className="text-[10px] font-black text-gray-600">Science</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                            <Code2 size={14} className="text-emerald-500" />
                                            <span className="text-[10px] font-black text-gray-600">Coding</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                            <GraduationCap size={14} className="text-amber-500" />
                                            <span className="text-[10px] font-black text-gray-600">Studies</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50 mt-8">
                                <button 
                                    onClick={handleClearChat}
                                    disabled={loading || fetchingHistory}
                                    className="w-full flex items-center justify-center gap-2 py-4 border border-gray-100 hover:border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 hover:bg-red-50/50 transition-all disabled:opacity-50"
                                >
                                    <Trash2 size={14} /> Clear Chat History
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Chat interface */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
                            {/* Chat Header */}
                            <div className="px-8 py-5 border-b border-gray-50 bg-white/80 backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">AI Agent Online</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {user?.username}
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                                {fetchingHistory ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                                        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loading history...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    /* Empty State */
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                                        <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-50 hover:scale-110 transition-transform">
                                            <Sparkles size={36} className="animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">AI Learning Assistant</h3>
                                            <p className="text-sm text-gray-500 font-bold max-w-md leading-relaxed">
                                                Hi! 👋 I'm your AI learning assistant. Ask me anything from your subjects and I'll help you understand.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full pt-4">
                                            <button 
                                                onClick={() => handleQuickQuery("Explain Pythagoras theorem")}
                                                className="p-5 bg-white border border-gray-100 hover:border-blue-200 rounded-[1.5rem] text-left hover:shadow-xl hover:shadow-blue-900/5 transition-all text-xs font-bold text-gray-700 flex items-start gap-3"
                                            >
                                                <Calculator size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <div className="font-black text-gray-900">Explain Pythagoras theorem</div>
                                                    <span className="text-[10px] text-gray-400">School Level Math</span>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => handleQuickQuery("What is photosynthesis?")}
                                                className="p-5 bg-white border border-gray-100 hover:border-blue-200 rounded-[1.5rem] text-left hover:shadow-xl hover:shadow-blue-900/5 transition-all text-xs font-bold text-gray-700 flex items-start gap-3"
                                            >
                                                <Atom size={18} className="text-purple-500 mt-0.5" />
                                                <div>
                                                    <div className="font-black text-gray-900">What is photosynthesis?</div>
                                                    <span className="text-[10px] text-gray-400">School Level Biology</span>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => handleQuickQuery("Explain binary tree")}
                                                className="p-5 bg-white border border-gray-100 hover:border-blue-200 rounded-[1.5rem] text-left hover:shadow-xl hover:shadow-blue-900/5 transition-all text-xs font-bold text-gray-700 flex items-start gap-3"
                                            >
                                                <Code2 size={18} className="text-emerald-500 mt-0.5" />
                                                <div>
                                                    <div className="font-black text-gray-900">Explain binary tree</div>
                                                    <span className="text-[10px] text-gray-400">Computer Science / DSA</span>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => handleQuickQuery("What is Newton's law?")}
                                                className="p-5 bg-white border border-gray-100 hover:border-blue-200 rounded-[1.5rem] text-left hover:shadow-xl hover:shadow-blue-900/5 transition-all text-xs font-bold text-gray-700 flex items-start gap-3"
                                            >
                                                <HelpCircle size={18} className="text-amber-500 mt-0.5" />
                                                <div>
                                                    <div className="font-black text-gray-900">What is Newton's law?</div>
                                                    <span className="text-[10px] text-gray-400">School Level Physics</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Message Log */
                                    <div className="space-y-6">
                                        {messages.map((msg) => (
                                            <div 
                                                key={msg.id} 
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div 
                                                    className={`max-w-[80%] rounded-3xl px-6 py-4 shadow-sm relative group transition-all duration-300 ${
                                                        msg.role === 'user' 
                                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                                            : msg.is_error
                                                            ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-none'
                                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                                    }`}
                                                >
                                                    <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                                                        {renderMessageContent(msg.content)}
                                                    </div>
                                                    <div 
                                                        className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${
                                                            msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {formatMessageTime(msg.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Thinking Indicator */}
                                        {loading && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-3">
                                                    <Loader2 className="animate-spin text-blue-600 h-4 w-4" />
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Message Input Box */}
                            <div className="p-6 border-t border-gray-50 bg-white">
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex gap-4"
                                >
                                    <input 
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        ref={inputRef}
                                        disabled={loading || fetchingHistory}
                                        placeholder="Ask anything from Math, Science, or Programming..."
                                        className="flex-1 rounded-2xl bg-gray-50 border-0 px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-gray-800 transition-all disabled:opacity-50"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!input.trim() || loading || fetchingHistory}
                                        className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-blue-600 shadow-md shadow-blue-100 flex-shrink-0"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Chatbot;
