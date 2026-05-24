import { gql } from "@apollo/client";

export const GENERATE_PAYMENT_TOKEN = gql`
  mutation GeneratePaymentToken($input: GeneratePaymentTokenInput!) {
    generatePaymentToken(input: $input) {
      token
      transactionId
      orderNumber
      invoiceId
      amount
      amountCents
      expiresAt
      reused
      raw
    }
  }
`;

export const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($input: ConfirmPaymentInput!) {
    confirmPayment(input: $input) {
      status
      orderNumber
      approved
      message
    }
  }
`;

export const ENROLL_FREE_ACTIVITY = gql`
  mutation EnrollFreeActivity($activityId: Int!) {
    enrollFreeActivity(activityId: $activityId) {
      attendeeId
      activityId
      status
      message
    }
  }
`;
