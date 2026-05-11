import { gql } from "@apollo/client";

export const FIND_POSTS_FOR_WEBSITE = gql`
  query FindPostsForWebsite(
    $page: Int
    $pageSize: Int
    $sort: String
    $search: String
    $type: String
  ) {
    findPostsForWebsite(
      page: $page
      pageSize: $pageSize
      sort: $sort
      search: $search
      type: $type
    ) {
      posts {
        id
        title
        slug
        description
        coverImage
        author
        tags
        type
        isPinned
        publishedAt
      }
      meta {
        total
        page
        totalPages
      }
    }
  }
`;

export const FIND_ONE_POST_FOR_WEBSITE = gql`
  query FindOnePostForWebsite($id: Int!) {
    findOnePostForWebsite(id: $id) {
      id
      title
      slug
      description
      content
      contentHtml
      coverImage
      href
      author
      tags
      type
      isPinned
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_POSTS_BANNER = gql`
  query FindPostsFromBanner($type: String!) {
    findPostsFromBanner(type: $type) {
      id
      title
      slug
      description
      content
      contentHtml
      coverImage
      href
      author
      tags
      type
      isPinned
      publishedAt
      createdAt
      updatedAt
    }
  }
`;
