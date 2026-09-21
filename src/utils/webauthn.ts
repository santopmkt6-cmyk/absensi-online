// WebAuthn biometric integration helper

export interface BiometricAvailability {
  isSupported: boolean;
  hasPlatformAuthenticator: boolean;
}

export const checkBiometricSupport = async (): Promise<BiometricAvailability> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { isSupported: false, hasPlatformAuthenticator: false };
  }

  try {
    const hasPlatform = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return {
      isSupported: true,
      hasPlatformAuthenticator: hasPlatform,
    };
  } catch {
    return { isSupported: true, hasPlatformAuthenticator: false };
  }
};

/**
 * Register a WebAuthn biometric credential for an employee
 */
export const registerBiometricCredential = async (
  employeeId: string,
  employeeName: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn tidak didukung pada browser ini.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new TextEncoder().encode(employeeId);

    const createOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Sistem Absensi Online Sidik Jari',
      },
      user: {
        id: userId,
        name: employeeName,
        displayName: employeeName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      timeout: 60000,
    };

    const credential = (await navigator.credentials.create({
      publicKey: createOptions,
    })) as PublicKeyCredential | null;

    if (credential) {
      return {
        success: true,
        credentialId: credential.id,
      };
    }
    return { success: false, error: 'Pendaftaran sidik jari dibatalkan.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengakses sensor sidik jari.';
    return { success: false, error: errorMsg };
  }
};

/**
 * Verify biometric credential using WebAuthn
 */
export const verifyBiometricCredential = async (
  credentialId?: string
): Promise<{ success: boolean; error?: string }> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn tidak didukung.' };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const requestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      userVerification: 'preferred',
      timeout: 60000,
    };

    if (credentialId) {
      requestOptions.allowCredentials = [
        {
          id: Uint8Array.from(atob(credentialId.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          type: 'public-key',
        },
      ];
    }

    const assertion = await navigator.credentials.get({
      publicKey: requestOptions,
    });

    if (assertion) {
      return { success: true };
    }
    return { success: false, error: 'Verifikasi sidik jari dibatalkan.' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Verifikasi sidik jari gagal.';
    return { success: false, error: errorMsg };
  }
};
