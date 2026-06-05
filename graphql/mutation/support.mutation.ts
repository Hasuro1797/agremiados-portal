import { gql } from "@apollo/client";

export const CREATE_SUPPORT = gql`
  mutation CreateSupport($input: CreateSupportInput!, $files: [Upload!]) {
    createSupport(input: $input, files: $files) {
      id
    }
  }
`;

export const ADD_SUPPORT_MESSAGE = gql`
  mutation AddSupportMessage(
    $input: CreateSupportMessageInput!
    $files: [Upload!]
  ) {
    addSupportMessage(input: $input, files: $files) {
      id
      body
      createdAt
      attachments {
        mediaId
        order
        media {
          id
          url
          title
          format
          width
          height
        }
      }
    }
  }
`;

export const REOPEN_SUPPORT = gql`
  mutation ReopenSupport($input: ReopenSupportInput!) {
    reopenSupport(input: $input) {
      id
      status
    }
  }
`;

export const RATE_SUPPORT_RESOLUTION = gql`
  mutation RateSupportResolution($input: RateSupportInput!) {
    rateSupportResolution(input: $input) {
      id
      satisfactionRating
    }
  }
`;
