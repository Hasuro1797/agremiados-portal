import { gql } from "@apollo/client";

export const PREVIEW_PAYMENT = gql`
  query PreviewPayment($input: PreviewPaymentInput!) {
    previewPayment(input: $input) {
      subtotal
      discount {
        amount
        percentage
        name
      }
      igv {
        amount
        rate
      }
      total
      currency
      lines {
        label
        quantity
        unitAmount
        amount
      }
    }
  }
`;

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
