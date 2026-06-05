import { gql } from "@apollo/client";

export const MY_NOTIFICATIONS = gql`
  query MyNotifications($page: Int, $pageSize: Int, $unreadOnly: Boolean) {
    myNotifications(page: $page, pageSize: $pageSize, unreadOnly: $unreadOnly) {
      notifications {
        id
        userId
        triggerKey
        subject
        body
        link
        channel
        status
        readAt
        createdAt
      }
      total
      unreadCount
    }
  }
`;

export const MY_NOTIFICATION_PREFERENCES = gql`
  query MyNotificationPreferences {
    myNotificationPreferences {
      id
      triggerKey
      channel
      enabled
    }
  }
`;
