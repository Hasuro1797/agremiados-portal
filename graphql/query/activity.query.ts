import { gql } from "@apollo/client";

export const GET_ACTIVITY_BY_ID = gql`
  query GetActivityById($id: Int!) {
    findOneActivity(id: $id) {
      id
      title
      description
      venue
      address
      audience
      type
      date
      href
      finishDate
      hasPrice
      price
      priceInvitee
      concurrence
      days
      finishConcurrence
      status
      images {
        activityId
        mediaId
        order
        media {
          id
          title
          url
          alt
          caption
        }
      }
      discounts {
        id
        percentage
        startDate
        endDate
        type
        status
      }
    }
  }
`;

export const GET_ALL_ACTIVITIES = gql`
  query FindActivities(
    $page: Int!
    $pageSize: Int!
    $orderBy: String
    $search: String
    $filters: FiltersActivityInput
  ) {
    getActivitiesFromWebsite(
      page: $page
      pageSize: $pageSize
      orderBy: $orderBy
      search: $search
      filters: $filters
    ) {
      activities {
        id
        title
        description
        venue
        address
        audience
        type
        date
        href
        finishDate
        stock
        priceInvitee
        priceExternal
        concurrence
        days
        hasPrice
        price
        finishConcurrence
        images {
          activityId
          mediaId
          order
          media {
            alt
            caption
            createdAt
            id
            title
            url
          }
        }
        discounts {
          id
          percentage
          startDate
          endDate
          type
          status
        }
      }
      meta {
        page
        total
        totalPages
      }
    }
  }
`;
