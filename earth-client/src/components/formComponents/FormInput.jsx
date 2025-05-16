import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const FormInput = ({ form, name, label, placeholder, type }) => {
  return (
    <FormField
      className="p-2"
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="p-2">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type={type}
              {...field}
              className="p-2"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default FormInput
