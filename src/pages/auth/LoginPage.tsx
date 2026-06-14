import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginUser, clearError } from '../../store/slices/authSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

type LoginFormInputs = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const resultAction = await dispatch(loginUser({ email: data.email, password: data.password }))
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Sign in successful', {
          description: `Welcome back, ${resultAction.payload.user.name}!`,
        })
        navigate('/dashboard')
      } else {
        toast.error('Sign in failed', {
          description: (resultAction.payload as string) || 'Invalid credentials',
        })
      }
    } catch (err) {
      toast.error('An error occurred', {
        description: 'Failed to communicate with authentication server.',
      })
    }
  }

  return (
    <Card className="shadow-lg border-hairline max-w-[400px] mx-auto w-full">
      <CardHeader className="text-center mb-2 space-y-1">
        <CardTitle className="text-2xl font-sans font-bold tracking-tight text-ink">
          Welcome back
        </CardTitle>
        <p className="text-sm font-sans font-normal text-steel">
          Enter credentials to access the dashboard
        </p>
      </CardHeader>

      <CardContent>
        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-brand-error/10 border-brand-error/25 text-brand-error p-3 rounded-md"
            >
              <AlertDescription className="text-xs font-sans font-normal flex flex-col items-center justify-between">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => dispatch(clearError())}
                  className="underline mt-1.5 text-steel font-medium hover:text-ink cursor-pointer"
                >
                  Clear error
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <Label
              className="text-xs font-sans font-semibold text-charcoal flex items-center justify-between"
              htmlFor="email"
            >
              Email Address
              <span className="badge-required scale-90 select-none">Required</span>
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="candidate@example.com"
              {...register('email')}
              className={errors.email ? 'border-brand-error focus-visible:ring-brand-error' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-brand-error font-sans font-normal">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <Label
              className="text-xs font-sans font-semibold text-charcoal flex items-center justify-between"
              htmlFor="password"
            >
              Password
              <span className="badge-required scale-90 select-none">Required</span>
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-brand-error focus-visible:ring-brand-error' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-brand-error font-sans font-normal">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Actions Button */}
          <Button
            type="submit"
            className="w-full mt-6 justify-center btn-primary cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
export default LoginPage
