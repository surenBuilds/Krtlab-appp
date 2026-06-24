import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  increment,
  limit
} from 'firebase/firestore';
import { CommunityMessage, UserProfile } from '../types';
import { MessageSquare, ThumbsUp, Trash2, Send, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface CommunitySectionProps {
  lessonId: string;
  profile: UserProfile;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ lessonId, profile }) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'discussions'),
      where('lessonId', '==', lessonId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityMessage[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Discussion load error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lessonId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      await addDoc(collection(db, 'discussions'), {
        userId: profile.uid || 'anonymous',
        userName: profile.name || 'Անանուն',
        text: newMsg.trim(),
        createdAt: new Date().toISOString(),
        lessonId,
        likes: 0
      });
      setNewMsg('');
      toast.success("Հաղորդագրությունն ուղարկված է:");
    } catch (e) {
      toast.error("Ուղարկելու սխալ:");
    }
  };

  const handleLike = async (msgId: string) => {
    try {
      const msgRef = doc(db, 'discussions', msgId);
      await updateDoc(msgRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!window.confirm("Ցանկանու՞մ եք ջնջել այս հաղորդագրությունը:")) return;
    try {
      await deleteDoc(doc(db, 'discussions', msgId));
      toast.success("Ջնջված է:");
    } catch (e) {
      toast.error("Ջնջելու սխալ:");
    }
  };

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <MessageSquare className="text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Քննարկում</h3>
            <p className="text-sm text-slate-500 font-medium">Կիսվիր քո մտքերով կամ հարցրու մյուսներին</p>
          </div>
        </div>
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
          {messages.length} հաղորդագրություն
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="relative group">
        <input 
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Գրեք ձեր հարցը կամ մեկնաբանությունը..."
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-5 pr-20 font-bold focus:outline-none focus:border-primary/30 transition-all shadow-sm focus:shadow-xl focus:shadow-primary/5"
        />
        <button 
          type="submit"
          disabled={!newMsg.trim()}
          className="absolute right-3 top-3 bottom-3 aspect-square bg-gradient-brand text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-30 disabled:shadow-none transition-all outline-none"
        >
          <Send size={20} />
        </button>
      </form>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5"
            >
              <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 shadow-inner">
                {msg.userId === profile.uid ? (
                  <div className="w-full h-full bg-gradient-brand rounded-[1.1rem] flex items-center justify-center text-white font-bold text-lg">
                    {msg.userName[0].toUpperCase()}
                  </div>
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "font-black text-sm",
                      msg.userId === profile.uid ? "text-primary" : "text-slate-900"
                    )}>
                      {msg.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(msg.createdAt).toLocaleTimeString('hy-AM', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.userId === profile.uid && (
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">{msg.text}</p>
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    onClick={() => handleLike(msg.id)}
                    className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary transition-colors group/like"
                  >
                    <div className="p-2 rounded-lg bg-slate-50 group-hover/like:bg-primary/5 transition-colors">
                      <ThumbsUp size={14} />
                    </div>
                    <span>{msg.likes || 0} լայք</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 0 && !loading && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <MessageSquare size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold italic">Դեռևս չկան մեկնաբանություններ:<br />Եղեք առաջինը:</p>
          </div>
        )}
      </div>
    </div>
  );
};
