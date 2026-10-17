import './AuthForm.css'
import type { FormEventHandler, ReactNode, Ref } from 'react'
export function AuthForm({
  pending,
  disabled,
  onSubmit,
  children,
  formRef,
}: {
  pending: boolean
  disabled: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  formRef?: Ref<HTMLFormElement>
}) {
  return (
    <form
      ref={formRef}
      className="auth-form"
      onSubmit={onSubmit}
      aria-busy={pending}
    >
      <fieldset disabled={disabled || pending}>{children}</fieldset>
    </form>
  )
}
