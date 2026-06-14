import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertOctagon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Exception caught by ErrorBoundary:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-hairline rounded-2xl bg-surface p-6 shadow-lg space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-error/10 border border-brand-error/20 flex items-center justify-center text-brand-error">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-sans font-bold tracking-tight text-ink">
                Application Rendering Failure
              </h1>
              <p className="text-sm font-sans font-normal text-steel leading-relaxed">
                An unexpected crash occurred inside a component render lifecycle branch.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-surface-soft border border-hairline rounded-lg text-left overflow-x-auto text-[11px] font-mono text-charcoal max-h-[150px] leading-relaxed">
                <strong className="text-brand-error">{this.state.error.name}:</strong>{' '}
                {this.state.error.message}
                {this.state.error.stack && (
                  <pre className="mt-2 text-stone/80 text-[10px] select-all whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <Button
              onClick={this.handleReset}
              className="w-full bg-brand-green hover:bg-brand-green-deep text-primary font-medium rounded-full cursor-pointer flex items-center justify-center gap-2 py-2.5"
            >
              <RefreshCw className="w-4 h-4 animate-spin-hover" />
              Reload Application
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
