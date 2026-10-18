import { Field, Input } from 'fieldnotes-ui'
import { PasswordField } from '../../../auth/components/PasswordField/PasswordField.tsx'
export function AccountCredentials({
  id,
  passwordLabel = 'Account password',
}: {
  id: string
  passwordLabel?: string
}) {
  return (
    <>
      <PasswordField
        name="password"
        label={passwordLabel}
        controlId={`${id}-password`}
      />
      <Field
        label="Authenticator or recovery code (if enabled)"
        controlId={`${id}-code`}
      >
        {(props) => (
          <Input
            {...props}
            name="code"
            autoComplete="one-time-code"
            maxLength={128}
          />
        )}
      </Field>
    </>
  )
}
