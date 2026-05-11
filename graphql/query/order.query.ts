import { gql } from "@apollo/client";

export const GETAMOUNTFORQUOTE = gql`
  query GetAmountForQuotes($amountForQuotesDto: AmountForQuotesDTO!) {
    getAmountForQuotes(amountForQuotesDTO: $amountForQuotesDto) {
      socialAmount {
        total
        percentageDiscount
        totalWithDiscount
      }
      mutualAmount {
        total
        percentageDiscount
        totalWithDiscount
      }
    }
  }
`;

export const GETLAWYERLASTQUOTE = gql`
  query GetLawyerLastQuote {
    getLawyerLastQuote {
      periodFrom
      totalQuotes
      discounts {
        available
        data {
          id
          name
          percentage
          quotesNumber
        }
      }
    }
  }
`;
