import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-surface to-hairline-soft flex items-center justify-center p-6 text-center">
      <Card className="border-hairline shadow-lg max-w-md w-full">
        <CardContent className="p-8 flex flex-col items-center space-y-6">
          {/* Decorative Graphic */}
          <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green">
            <FileQuestion className="w-8 h-8" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h1 className="text-3xl font-sans font-bold tracking-tight text-ink">404</h1>
            <h2 className="text-lg font-sans font-semibold text-charcoal">Page not found</h2>
            <p className="text-sm font-sans text-steel max-w-sm mx-auto">
              The page you are looking for does not exist or has been moved. Use the link below to
              return to the application dashboard.
            </p>
          </div>

          {/* Action button */}
          <Button
            asChild
            className="btn-primary flex items-center gap-2 px-6 justify-center cursor-pointer"
          >
            <Link to="/dashboard">
              <Home className="w-4 h-4 text-brand-green" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
