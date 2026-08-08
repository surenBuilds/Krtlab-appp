import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { cn } from "../lib/utils";

interface EBProps { children: React.ReactNode; section?: string; fallback?: React.ReactNode; onError?: (error: Error, errorInfo: React.ErrorInfo) => void; }
interface EBState { hasError: boolean; error: Error | null; retryCount: number; }

const ReactComponent = (React as any).Component as new <P, S>(props: P) => { props: P; state: S; setState(state: Partial<S> | ((prev: S) => Partial<S>)): void; render(): React.ReactNode; };

export class ErrorBoundary extends ReactComponent<EBProps, EBState> {
  state: EBState = { hasError: false, error: null, retryCount: 0 };
  static getDerivedStateFromError(error: Error): Partial<EBState> { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("[ErrorBoundary]", this.props.section, error, errorInfo); this.props.onError?.(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (<div className="flex items-center justify-center min-h-[400px] p-8"><div className="text-center max-w-md"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center"><AlertTriangle className="text-amber-600" size={32}/></div><h3 className="text-xl font-black text-slate-900 mb-2">Ինչ-որ բան սխալ գնաց</h3><p className="text-slate-500 font-medium mb-1">{this.props.section ? `"${this.props.section}"` : "Էջի"}</p><button onClick={()=>this.setState({hasError:false,error:null,retryCount:this.state.retryCount+1})} className={cn("inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20")}><RefreshCcw size={18}/>Կրկին փորձել</button></div></div>);
    }
    return this.props.children;
  }
}

export function WidgetErrorFallback({ title="Widget Error", onRetry }:{title?:string;onRetry?:()=>void}) {
  return (<div className="bg-white rounded-2xl border border-slate-100 p-6 text-center"><AlertTriangle className="text-amber-400 mx-auto mb-2" size={24}/><p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>{onRetry&&<button onClick={onRetry} className="text-xs font-bold text-primary hover:underline">Վերաբեռնել</button>}</div>);
}
