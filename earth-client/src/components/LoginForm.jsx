import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { LOGIN } from '@/queries'
import { loginSchema } from '@/utils/schemas'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormInput from './formComponents/FormInput'

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

const LoginForm = ({ setToken }) => {
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      form.setError('username', {
        type: 'manual',
        message: 'Invalid username or password',
      })
    },
    onCompleted: (data) => {
      console.log('Login successful:', data)
      navigate('/projects')
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      localStorage.setItem('user-token', token)
      setToken(token)
    }
  }, [result.data])

  const onSubmit = async (data) => {
    login({
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
              <Button type="submit" className="w-full">
                Login
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
