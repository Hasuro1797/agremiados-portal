import { gql } from "@apollo/client";

export const SUPPORT_CATEGORIES = gql`
  query SupportCategories {
    supportCategories {
      id
      name
      description
      icon
      defaultPriority
      slaDays
      isActive
    }
  }
`;

export const MY_SUPPORTS = gql`
  query MySupports($status: SupportStatus, $page: Int, $pageSize: Int) {
    mySupports(status: $status, page: $page, pageSize: $pageSize) {
      items {
        id
        topic
        place
        status
        priority
        createdAt
        updatedAt
        respondedAt
        resolvedAt
        satisfactionRating
        category {
          id
          name
        }
      }
      total
      page
      pageSize
    }
  }
`;

export const SUPPORT_BY_ID = gql`
  query Support($id: Int!) {
    support(id: $id) {
      id
      topic
      details
      place
      status
      priority
      createdAt
      assignedName
      resolvedAt
      rejectReason
      reopenReason
      satisfactionRating
      satisfactionComment
      category {
        name
      }
      user {
        name
        paternalSurname
      }
      messages {
        id
        body
        isInternal
        createdAt
        author {
          name
          paternalSurname
          role
        }
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
  }
`;
