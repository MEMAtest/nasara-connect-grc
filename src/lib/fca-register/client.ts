/**
 * FCA Register API Client
 * Provides methods to interact with the FCA Register API V0.1
 */

import {
  FCAClientConfig,
  FCAApiError,
  FirmResponse,
  PermissionsResponse,
  IndividualsResponse,
  DisciplinaryResponse,
  IndividualResponse,
  ControlFunctionsResponse,
  SearchResponse,
  NormalizedFirm,
  NormalizedPermission,
  NormalizedIndividual,
  NormalizedDisciplinaryAction,
  FCAFirm,
  FirmPermission,
  FirmIndividual,
  DisciplinaryAction,
} from "./types";

const DEFAULT_BASE_URL = "https://register.fca.org.uk/services/V0.1";

export class FCARegisterClient {
  private config: FCAClientConfig;
  private baseUrl: string;

  constructor(config: FCAClientConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  /**
   * Make an authenticated request to the FCA Register API
   * Includes timeout handling and proper error context
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${encodeURI(endpoint)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-AUTH-EMAIL": this.config.email,
          "X-AUTH-KEY": this.config.apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: FCAApiError = {
          status: response.status,
          message: await response.text().catch(() => "Unknown error"),
          endpoint,
        };

        if (response.status === 404) {
          error.message = "Resource not found";
        } else if (response.status === 401) {
          error.message = "Authentication failed - check API credentials";
        } else if (response.status === 429) {
          error.message = "Rate limit exceeded - max 50 requests per 10 seconds";
        }

        throw error;
      }

      return response.json();
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === "AbortError") {
        const error: FCAApiError = {
          status: 408,
          message: "Request timeout - FCA API did not respond in time",
          endpoint,
        };
        throw error;
      }

      throw err;
    }
  }

  // ============================================
  // Firm Endpoints
  // ============================================

  /**
   * Get firm details by FRN
   */
  async getFirm(frn: string): Promise<FirmResponse> {
    return this.request<FirmResponse>(`/Firm/${frn}`);
  }

  /**
   * Get firm permissions by FRN
   */
  async getFirmPermissions(frn: string): Promise<PermissionsResponse> {
    return this.request<PermissionsResponse>(`/Firm/${frn}/Permissions`);
  }

  /**
   * Get individuals at a firm by FRN
   */
  async getFirmIndividuals(frn: string): Promise<IndividualsResponse> {
    return this.request<IndividualsResponse>(`/Firm/${frn}/Individuals`);
  }

  /**
   * Get disciplinary history for a firm by FRN
   */
  async getFirmDisciplinaryHistory(frn: string): Promise<DisciplinaryResponse> {
    return this.request<DisciplinaryResponse>(`/Firm/${frn}/DisciplinaryHistory`);
  }

  // ============================================
  // Individual Endpoints
  // ============================================

  /**
   * Get individual details by IRN
   */
  async getIndividual(irn: string): Promise<IndividualResponse> {
    return this.request<IndividualResponse>(`/Individual/${irn}`);
  }

  /**
   * Get control functions for an individual by IRN
   */
  async getIndividualControlFunctions(irn: string): Promise<ControlFunctionsResponse> {
    return this.request<ControlFunctionsResponse>(`/Individual/${irn}/ControlFunctions`);
  }

  // ============================================
  // Search Endpoint
  // ============================================

  /**
   * Search for firms or individuals
   */
  async search(query: string): Promise<SearchResponse> {
    return this.request<SearchResponse>(`/Search?q=${encodeURIComponent(query)}`);
  }

  // ============================================
  // Normalized Data Methods
  // ============================================

  /**
   * Get normalized firm data
   */
  async getNormalizedFirm(frn: string): Promise<NormalizedFirm | null> {
    const response = await this.getFirm(frn);
    const firm = response.Data?.[0];

    if (!firm) return null;

    return this.normalizeFirm(firm);
  }

  /**
   * Get normalized permissions for a firm
   */
  async getNormalizedPermissions(frn: string): Promise<NormalizedPermission[]> {
    const response = await this.getFirmPermissions(frn);
    return (response.Data || []).map(this.normalizePermission);
  }

  /**
   * Get normalized individuals at a firm
   */
  async getNormalizedIndividuals(frn: string): Promise<NormalizedIndividual[]> {
    const response = await this.getFirmIndividuals(frn);
    return (response.Data || []).map(this.normalizeIndividual);
  }

  /**
   * Get normalized disciplinary actions for a firm
   */
  async getNormalizedDisciplinaryHistory(frn: string): Promise<NormalizedDisciplinaryAction[]> {
    const response = await this.getFirmDisciplinaryHistory(frn);
    return (response.Data || []).map(this.normalizeDisciplinaryAction);
  }

  // ============================================
  // Normalization Helpers
  // ============================================

  private normalizeFirm(firm: FCAFirm): NormalizedFirm {
    return {
      frn: firm["FRN"],
      name: firm["Organisation Name"],
      status: firm["Status"],
      statusEffectiveDate: firm["Status Effective Date"],
      address: {
        line1: firm["Address Line 1"],
        line2: firm["Address Line 2"],
        line3: firm["Address Line 3"],
        line4: firm["Address Line 4"],
        town: firm["Town"],
        county: firm["County"],
        country: firm["Country"],
        postcode: firm["Postcode"],
      },
      phone: firm["Phone Number"],
      website: firm["Website"],
      companiesHouseNumber: firm["Companies House Number"],
      isAppointedRepresentative: firm["Appointed Representative"] || false,
      isPraRegulated: firm["PRA Regulated"] || false,
    };
  }

  private normalizePermission(permission: FirmPermission): NormalizedPermission {
    return {
      permission: permission["Permission"],
      investmentType: permission["Investment Type"],
      customerType: permission["Customer Type"],
      status: permission["Status"],
      effectiveDate: permission["Effective Date"],
    };
  }

  private normalizeIndividual(individual: FirmIndividual): NormalizedIndividual {
    return {
      irn: individual["IRN"],
      name: individual["Name"],
      status: individual["Status"],
      controlFunctions: individual["Control Functions"]?.map((cf) => ({
        function: cf["Function"],
        status: cf["Status"],
        effectiveFrom: cf["Effective From"],
        effectiveTo: cf["Effective To"],
      })),
    };
  }

  private normalizeDisciplinaryAction(action: DisciplinaryAction): NormalizedDisciplinaryAction {
    return {
      actionType: action["Action Type"],
      date: action["Date"],
      summary: action["Summary"],
      reference: action["Reference"],
      penaltyAmount: action["Penalty Amount"],
    };
  }
}

/**
 * Create a configured FCA Register client using environment variables
 * This function should only be called server-side (API routes, server components)
 */
export function createFCAClient(): FCARegisterClient {
  // Guard against client-side usage
  if (typeof window !== "undefined") {
    throw new Error("FCA Register client can only be created server-side");
  }

  const email = process.env.FCA_REGISTER_EMAIL;
  const apiKey = process.env.FCA_REGISTER_API_KEY;

  if (!email || !apiKey) {
    throw new Error("FCA Register API credentials not configured");
  }

  return new FCARegisterClient({ email, apiKey });
}
