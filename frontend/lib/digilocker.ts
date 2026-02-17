/**
 * DigiLocker Integration Utilities
 * Handles OAuth flow and document retrieval
 */

export const DIGILOCKER_CONFIG = {
  baseUrl: 'https://www.digilocker.gov.in',
  apiUrl: 'https://api.digilocker.gov.in',
  webHome: 'https://www.digilocker.gov.in/web/home',
  issuedDocumentsEndpoint: '/issued',
  aadhaarType: 'AADHAAR',
}

export interface DigiLockerOAuthConfig {
  clientId: string
  redirectUri: string
  scope: string
  state: string
}

export interface IssuedDocument {
  id: string
  type: string
  issuerName: string
  issuedDate: string
  expiryDate: string
  documentData: Record<string, unknown>
}

/**
 * Generate OAuth URL for DigiLocker
 */
export function generateDigiLockerAuthUrl(config: DigiLockerOAuthConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: config.state,
    response_type: 'code',
  })

  return `${DIGILOCKER_CONFIG.baseUrl}/web/oauth?${params.toString()}`
}

/**
 * Handle OAuth callback and exchange code for token
 */
export async function exchangeAuthCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ accessToken: string; tokenType: string }> {
  const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch issued documents from DigiLocker
 * Requires TLS certificate validation
 */
export async function fetchIssuedDocuments(
  accessToken: string,
  documentType?: string
): Promise<IssuedDocument[]> {
  const endpoint = new URL(`${DIGILOCKER_CONFIG.apiUrl}${DIGILOCKER_CONFIG.issuedDocumentsEndpoint}`)
  
  if (documentType) {
    endpoint.searchParams.append('type', documentType)
  }

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`)
  }

  const data = await response.json()
  return data.documents || []
}

/**
 * Fetch specific document data
 */
export async function fetchDocumentData(
  accessToken: string,
  documentId: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`${DIGILOCKER_CONFIG.apiUrl}/documents/${documentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch document data: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Validate TLS certificate for DigiLocker API
 * In production, this should properly validate against DigiLocker's CA
 */
export function validateTLSCertificate(hostname: string): boolean {
  // TODO: Implement proper TLS certificate validation
  // For now, we'll add this as a security checkpoint
  
  const allowedHosts = [
    'digilocker.gov.in',
    'api.digilocker.gov.in',
    'www.digilocker.gov.in',
  ]

  return allowedHosts.some(host => hostname.includes(host))
}

/**
 * Extract Aadhaar specific document
 */
export async function getAadhaarDocument(
  accessToken: string
): Promise<IssuedDocument | null> {
  const documents = await fetchIssuedDocuments(accessToken, DIGILOCKER_CONFIG.aadhaarType)
  return documents.length > 0 ? documents[0] : null
}
