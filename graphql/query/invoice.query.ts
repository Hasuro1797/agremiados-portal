import { gql } from "@apollo/client";

export const MY_PAYMENTS = gql`
  query MyPayments(
    $page: Int
    $pageSize: Int
    $status: InvoiceStatus
    $itemType: InvoiceItemType
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    myPayments(
      page: $page
      pageSize: $pageSize
      status: $status
      itemType: $itemType
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      data {
        id
        orderNumber
        status
        sunatStatus
        series
        sequential
        total
        currency
        createdAt
        details {
          description
          quantity
          price
          itemType
        }
        billingDocuments {
          type
          url
        }
      }
      meta {
        total
        page
        totalPages
      }
    }
  }
`;
