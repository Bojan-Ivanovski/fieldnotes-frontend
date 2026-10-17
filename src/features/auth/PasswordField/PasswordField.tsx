import './PasswordField.css'
import { useState } from 'react'
import { Button, Field, Input } from 'fieldnotes-ui'
export function PasswordField({ label = 'Password', name = 'password', autoComplete = 'current-password', newPassword = false }: { label?: string; name?: string; autoComplete?: string; newPassword?: boolean }) {
  const [visible, setVisible] = useState(false)
  return <Field label={label} controlId={name} description={newPassword ? 'Use 15–128 characters. Spaces and pasted passwords are welcome.' : undefined}>{props => <div className="auth-password"><Input {...props} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} minLength={newPassword ? 15 : undefined} maxLength={128} required /><Button type="button" variant="ghost" size="sm" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</Button></div>}</Field>
}
