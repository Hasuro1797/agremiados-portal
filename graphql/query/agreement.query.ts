import { gql } from "@apollo/client";

export const GET_ALL_AGREEMENTS = gql`
  query GetAgreementsFromWebsite($page: Int, $pageSize: Int) {
    getAgreementsFromWebsite(page: $page, pageSize: $pageSize) {
      agreements {
        id
        title
        slug
        description
        coverImage
        partnerName
        partnerLogo
        partnerWebsite
        benefitSummary
        category
        validFrom
        validUntil
        tags
        publishedAt
      }
      meta {
        page
        total
        totalPages
      }
    }
  }
`;

export const GET_AGREEMENT_BY_ID = gql`
  query FindOneAgreementForWebsite($id: Int!) {
    findOneAgreementForWebsite(id: $id) {
      id
      title
      slug
      description
      content
      contentHtml
      coverImage
      href
      partnerName
      partnerLogo
      partnerWebsite
      contactInfo
      benefitSummary
      category
      validFrom
      validUntil
      tags
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_RESERVATIONS = gql`
  query GetReservationFromWebsite {
    getReservationFromWebsite {
      description
      title
      id
      price
      stock
      media {
        alt
        title
        url
      }
    }
  }
`;

export const GET_RESERVATION_BY_ID = gql`
  query FinOneReservation($reservationId: Int!) {
    finOneReservation(id: $reservationId) {
      createdAt
      description
      id
      price
      stock
      title
      media {
        alt
        title
        url
      }
      dates {
        idProduct
        type
        startTime
        endTime
        startDate
        endDate
        hours
        status
      }
    }
  }
`;
