import { gql } from "@apollo/client";

export const GET_RESERVATIONS_FROM_WEBSITE = gql`
  query GetReservationsFromWebsite {
    getReservationsFromWebsite {
      id
      title
      description
      location
      address
      spaceType
      pricePerHour
      price
      amenities
      rules
      capacity
      status
      images {
        order
        media {
          id
          url
          title
        }
      }
    }
  }
`;

export const FIND_ONE_RESERVATION_SPACE = gql`
  query FindOneReservation($id: Int!) {
    findOneReservation(id: $id) {
      id
      title
      description
      location
      address
      spaceType
      pricePerHour
      price
      amenities
      rules
      capacity
      status
      images {
        order
        media {
          id
          url
          title
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const FIND_MY_RESERVATION_REQUESTS = gql`
  query FindMyReservationRequests($page: Int, $pageSize: Int) {
    findMyReservationRequests(page: $page, pageSize: $pageSize) {
      requests {
        id
        reservationId
        eventName
        purpose
        guestCount
        startDate
        endDate
        status
        adminComment
        estimatedPrice
        reviewedAt
        reservation {
          id
          title
          spaceType
          images {
            order
            media {
              id
              url
            }
          }
        }
        createdAt
        updatedAt
      }
      meta {
        total
        page
        totalPages
      }
    }
  }
`;
