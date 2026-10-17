import { Field, Input } from 'fieldnotes-ui'
export function EmailField({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <Field label="Email" controlId="email">
      {(props) => (
        <Input
          {...props}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={defaultValue}
          required
        />
      )}
    </Field>
  )
}
