import React from 'react'
import { PageContainer } from '../../components/layout/PageContainer'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateUser } from '../../store/slices/userSlice'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

type ProfileFormInputs = z.infer<typeof profileSchema>

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { currentUser } = useAppSelector((state) => state.auth)

  const defaultUser = currentUser || {
    id: '',
    name: 'Interview Candidate',
    email: 'candidate@example.com',
    role: 'ADMIN',
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultUser.name,
      email: defaultUser.email,
    },
  })

  const onSubmit = async (data: ProfileFormInputs) => {
    if (!defaultUser.id) {
      toast.error('Cannot update guest profile')
      return
    }
    try {
      const resultAction = await dispatch(updateUser({ id: defaultUser.id, input: data }))
      if (updateUser.fulfilled.match(resultAction)) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(`Failed to update profile: ${resultAction.payload || 'Unknown error'}`)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <PageContainer
      title="User Profile Settings"
      subtitle="Manage your platform settings, notification preferences, and password details."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <Card className="border-hairline shadow-xs flex flex-col items-center text-center p-6 space-y-4">
          <Avatar className="w-20 h-20 border border-hairline">
            <AvatarFallback className="bg-surface text-steel text-xl font-bold">
              {defaultUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-sans font-bold text-ink">{defaultUser.name}</h3>
            <p className="text-sm font-sans font-normal text-steel">{defaultUser.email}</p>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1 rounded bg-brand-green/15 text-brand-green-deep border-brand-green/30 text-xs font-semibold"
          >
            <Shield className="w-3.5 h-3.5" />
            {defaultUser.role} Account
          </Badge>
        </Card>

        {/* Edit details form */}
        <Card className="border-hairline shadow-xs lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-sans font-bold text-ink border-b border-hairline pb-3">
              Account Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Name */}
                <div className="space-y-1.5">
                  <Label
                    className="text-xs font-sans font-semibold text-charcoal"
                    htmlFor="profile-name"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="profile-name"
                    type="text"
                    {...register('name')}
                    className={
                      errors.name ? 'border-brand-error focus-visible:ring-brand-error' : ''
                    }
                  />
                  {errors.name && (
                    <p className="text-xs text-brand-error font-sans">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <Label
                    className="text-xs font-sans font-semibold text-charcoal"
                    htmlFor="profile-email"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    {...register('email')}
                    className={
                      errors.email ? 'border-brand-error focus-visible:ring-brand-error' : ''
                    }
                  />
                  {errors.email && (
                    <p className="text-xs text-brand-error font-sans">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="btn-primary mt-2 cursor-pointer">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
