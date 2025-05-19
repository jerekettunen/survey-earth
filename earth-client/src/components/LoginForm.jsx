import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { LOGIN } from '@/queries'
import { loginSchema } from '@/utils/schemas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormInput from './formComponents/FormInput'
import { useAuth } from '@/components/Providers/AuthProvider'
import { useToast } from '@/components/Providers/ToastProvider'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const LoginForm = () => {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const { showError, showSuccess } = useToast()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })
  const [loginMutation] = useMutation(LOGIN, {
    onError: (error) => {
      form.setError('username', {
        type: 'manual',
        message: 'Invalid username or password',
      })
      setLoading(false)
      showError('Invalid username or password', {
        description: 'Please check your credentials and try again.',
        duration: 5000,
      })
    },
    onCompleted: (data) => {
      const token = data.login.value
      authLogin(token) // Use context method
      navigate('/projects')
      showSuccess('Login successful', {
        description: 'Welcome back! You are now logged in.',
        duration: 5000,
      })
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    loginMutation({
      variables: {
        username: data.username,
        password: data.password,
      },
    })
  }

  return (
    <div className="login-form flex justify-center w-3/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Please enter your username and password to log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                form={form}
                name="username"
                label="Username"
                placeholder="Enter your email address"
                type="email"
              />
              <FormInput
                form={form}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col items-center gap-2">
          <p>Don't have an account?</p>
          <Button
            variant="link"
            onClick={() => {
              navigate('/register')
            }}
          >
            <strong>Register Here</strong>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
export default LoginForm
