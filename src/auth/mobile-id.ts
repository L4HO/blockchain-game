import { ethers } from "ethers";

export type MobileIdVerificationRequest = {
  provider: "mock" | "external";
  token: string;
  requiredAge?: number;
};

export type MobileIdVerificationResult = {
  verified: boolean;
  subjectHash: string;
  issuedAt: number;
  reason?: string;
};

export interface MobileIdVerifier {
  verify(request: MobileIdVerificationRequest): Promise<MobileIdVerificationResult>;
}

/// Mock verifier for local testing.
/// Replace this with PASS, DID, or school-issued mobile ID verification APIs.
export class MockMobileIdVerifier implements MobileIdVerifier {
  async verify(request: MobileIdVerificationRequest): Promise<MobileIdVerificationResult> {
    if (!request.token.startsWith("mock:")) {
      return {
        verified: false,
        subjectHash: ethers.ZeroHash,
        issuedAt: Math.floor(Date.now() / 1000),
        reason: "Invalid mock token"
      };
    }

    const [, subject, ageValue = "0"] = request.token.split(":");
    const age = Number(ageValue);
    const requiredAge = request.requiredAge ?? 0;

    if (!subject || age < requiredAge) {
      return {
        verified: false,
        subjectHash: ethers.ZeroHash,
        issuedAt: Math.floor(Date.now() / 1000),
        reason: "Mobile ID requirements not satisfied"
      };
    }

    return {
      verified: true,
      subjectHash: ethers.id(`mobile-id:${subject}`),
      issuedAt: Math.floor(Date.now() / 1000)
    };
  }
}
