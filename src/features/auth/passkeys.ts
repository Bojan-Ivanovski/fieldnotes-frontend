import { AuthError } from './client.ts'
export function passkeysSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof PublicKeyCredential !== 'undefined'
  )
}
function decode(value: string): ArrayBuffer {
  const bytes = Uint8Array.from(
    atob(value.replace(/-/g, '+').replace(/_/g, '/')),
    (char) => char.charCodeAt(0),
  )
  return bytes.buffer
}
function encode(value: ArrayBuffer | null): string | null {
  return value
    ? btoa(String.fromCharCode(...new Uint8Array(value)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    : null
}
type CredentialDescriptorJSON = Omit<PublicKeyCredentialDescriptor, 'id'> & {
  id: string
}
interface CreationJSON extends Omit<
  PublicKeyCredentialCreationOptions,
  'challenge' | 'user' | 'excludeCredentials'
> {
  challenge: string
  user: Omit<PublicKeyCredentialUserEntity, 'id'> & { id: string }
  excludeCredentials?: CredentialDescriptorJSON[]
}
interface RequestJSON extends Omit<
  PublicKeyCredentialRequestOptions,
  'challenge' | 'allowCredentials'
> {
  challenge: string
  allowCredentials?: CredentialDescriptorJSON[]
}
export async function createPasskey(
  data: { publicKey?: CreationJSON } & Partial<CreationJSON>,
) {
  const options = (data.publicKey ?? data) as CreationJSON
  const credential = (await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: decode(options.challenge),
      user: { ...options.user, id: decode(options.user.id) },
      excludeCredentials: options.excludeCredentials?.map((item) => ({
        ...item,
        id: decode(item.id),
      })),
    },
  })) as PublicKeyCredential | null
  if (!credential)
    throw new AuthError('No passkey was created.', 'cancelled', 400)
  const response = credential.response as AuthenticatorAttestationResponse
  return {
    id: credential.id,
    rawId: encode(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      attestationObject: encode(response.attestationObject),
      clientDataJSON: encode(response.clientDataJSON),
      transports: response.getTransports?.() ?? [],
    },
  }
}
export async function authenticatePasskey(
  data: { publicKey?: RequestJSON } & Partial<RequestJSON>,
) {
  const options = (data.publicKey ?? data) as RequestJSON
  const credential = (await navigator.credentials.get({
    publicKey: {
      ...options,
      challenge: decode(options.challenge),
      allowCredentials: options.allowCredentials?.map((item) => ({
        ...item,
        id: decode(item.id),
      })),
    },
  })) as PublicKeyCredential | null
  if (!credential)
    throw new AuthError('No passkey was selected.', 'cancelled', 400)
  const response = credential.response as AuthenticatorAssertionResponse
  return {
    id: credential.id,
    rawId: encode(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      authenticatorData: encode(response.authenticatorData),
      clientDataJSON: encode(response.clientDataJSON),
      signature: encode(response.signature),
      userHandle: encode(response.userHandle),
    },
  }
}
