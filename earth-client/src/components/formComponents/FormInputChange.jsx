import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const FormInputChange = ({
  form,
  name,
  label,
  placeholder,
  number,
  setter,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type="number"
              {...field}
              value={number}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value)) {
                  setter(value)
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default FormInputChange
