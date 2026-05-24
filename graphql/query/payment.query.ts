import { gql } from "@apollo/client";

export const MY_QUOTA_PAYMENTS = gql`
  query MyQuotaPayments($status: PaymentStatus) {
    myQuotaPayments(status: $status) {
      id
      status
      paidAt
      invoiceId
      isOverdue
      period {
        id
        year
        month
        amount
        dueDate
      }
    }
  }
`;
