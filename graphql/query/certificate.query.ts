import { gql } from "@apollo/client";

export const MY_HABILITATION_CERTIFICATE = gql`
  query MyHabilitationCertificate {
    myHabilitationCertificate {
      url
      code
      issuedAt
      validUntil
    }
  }
`;

export const VERIFY_CERTIFICATE = gql`
  query VerifyCertificate($code: String!) {
    verifyCertificate(code: $code) {
      valid
      status
      code
      type
      holderName
      holderMemberCode
      organizationName
      issuedAt
      validUntil
    }
  }
`;
