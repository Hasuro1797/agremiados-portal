import { gql } from "@apollo/client";

export const GET_ACTIVE_SURVEYS = gql`
  query GetActiveSurveys {
    getActiveSurveys {
      id
      title
      description
      status
      isAnonymous
      startDate
      endDate
      allowMultiple
      _count
      createdAt
    }
  }
`;

export const FIND_ONE_PUBLIC_SURVEY = gql`
  query FindOnePublicSurvey($id: Int!) {
    findOnePublicSurvey(id: $id) {
      id
      title
      description
      status
      isAnonymous
      startDate
      endDate
      allowMultiple
      questions {
        id
        text
        type
        isRequired
        order
        scaleMin
        scaleMax
        scaleMinLabel
        scaleMaxLabel
        options {
          id
          text
          order
        }
      }
    }
  }
`;
