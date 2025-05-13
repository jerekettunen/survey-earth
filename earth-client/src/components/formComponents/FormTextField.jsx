import { Textarea } from '@/components/ui/textarea'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const FormTextField = ({ form, name, label, placeholder }) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>Optional</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default FormTextField
