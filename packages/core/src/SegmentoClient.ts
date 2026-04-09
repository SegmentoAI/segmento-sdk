import { decodeToken } from "./token.js";
import type { TokenPayload } from "./token.js";
import { submitLead } from "./api.js";
import type { ApiOptions, SubmitLeadRequest } from "./types.js";

/**
 * Initialised Segmento client. Obtain an instance via {@link SegmentoClient.init}.
 *
 * @example
 * import { SegmentoClient } from "@segmento/core";
 *
 * const segmento = SegmentoClient.init("your_project_token");
 * console.log(segmento.projectId, segmento.projectName);
 */
export class SegmentoClient {
  /** Decoded project ID from the token */
  readonly projectId: string;
  /** Decoded project name from the token */
  readonly projectName: string;

  private readonly token: string;
  private readonly apiOptions: ApiOptions;
  private readonly decoded: TokenPayload;

  private constructor(token: string, decoded: TokenPayload, apiOptions: ApiOptions) {
    this.token = token;
    this.decoded = decoded;
    this.projectId = decoded.pid;
    this.projectName = decoded.name;
    this.apiOptions = apiOptions;
  }

  /**
   * Initialises the SDK by decoding and validating the project token.
   * Throws if the token is malformed or has an invalid checksum.
   *
   * @param token  Project token generated in the Segmento dashboard
   * @param options  Optional API overrides (base URL, fetch implementation)
   */
  static init(token: string, options: ApiOptions = {}): SegmentoClient {
    const decoded = decodeToken(token);
    return new SegmentoClient(token, decoded, options);
  }

  /**
   * Submits a lead to the Segmento backend. The `project_id` is injected
   * automatically from the decoded token.
   */
  async submitLead(
    request: Omit<SubmitLeadRequest, "project_id">,
  ): Promise<void> {
    return submitLead({ ...request, project_id: this.projectId }, this.apiOptions);
  }
}
