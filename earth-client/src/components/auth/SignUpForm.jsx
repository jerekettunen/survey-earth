import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/Providers/ToastProvider'
import { useMutation } from '@apollo/client'
import { CREATE_USER } from '@/queries'
import { registerSchema } from '@/utils/schemas'
import { useNavigate } from 'react-router-dom'
import FormInput from '../formComponents/FormInput'

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

const SignUpForm = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  })
  const [createUser, result] = useMutation(CREATE_USER, {
    onError: (error) => {
      form.setError('username', {
        type: 'manual',
        message: 'Username already exists',
      })
      showError('Username already exists', {
        description: 'Please choose a different username.',
        duration: 5000,
      })
    },
    onCompleted: (data) => {
      showSuccess('User created successfully', {
        description: 'You can now log in with your new account.',
        duration: 5000,
      })
      navigate('/login')
    },
  })

  const onSubmit = async (data) => {
    createUser({
      variables: {
        username: data.username,
        password: data.password,
      },
    })
  }
  return (
    <div className="signup-form flex justify-center w-3/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create an account to start using Earth.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CardContent>
              <FormInput
                form={form}
                name="username"
                label="Username"
                placeholder="Enter your username"
              />
              <FormInput
                form={form}
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
              <FormInput
                form={form}
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
              />
            </CardContent>
            <CardFooter className="flex-col items-center gap-2">
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
              <p>Already have an account?</p>
              <Button
                variant="link"
                onClick={() => {
                  navigate('/login')
                }}
              >
                <strong>Login Here</strong>
              </Button>
            </CardFooter>
            <div className="text-sm text-muted-foreground mt-2 px-6">
              <p className="mb-1 font-medium">Password requirements:</p>
              <p>
                At least 8 characters with one uppercase letter, one number, and
                one special character.
              </p>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  )
}
export default SignUpForm
