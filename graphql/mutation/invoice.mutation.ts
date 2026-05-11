import { gql } from "@apollo/client";

export const CREATE_INVOICE = gql`
  mutation CreateInvoice(
    $createInvoiceInput: CreateInvoiceInput!
    $mode: String!
  ) {
    createInvoice(createInvoiceInput: $createInvoiceInput, mode: $mode) {
      amount
      merchantCode
      orderNumber
      token
      transactionId
      mode
    }
  }
`;

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoiceTransaction(
    $updateInvoiceInput: UpdateInvoiceInput!
    $paramId: String!
    $activityId: Int
  ) {
    updateInvoiceTransaction(
      updateInvoiceInput: $updateInvoiceInput
      paramId: $paramId
      activityId: $activityId
    ) {
      message
    }
  }
`;
