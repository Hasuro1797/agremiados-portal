import { gql } from "@apollo/client";

export const CREATE_RESERVATION_REQUEST = gql`
  mutation CreateReservationRequest($input: CreateReservationRequestInput!) {
    createReservationRequest(createReservationRequestInput: $input) {
      id
      reservationId
      eventName
      purpose
      guestCount
      startDate
      endDate
      status
      estimatedPrice
      createdAt
    }
  }
`;

export const CANCEL_RESERVATION_REQUEST = gql`
  mutation CancelReservationRequest($id: String!) {
    cancelReservationRequest(id: $id) {
      id
      status
      updatedAt
    }
  }
`;
