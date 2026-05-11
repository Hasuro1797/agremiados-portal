import { gql } from "@apollo/client";

export const SUBMIT_SURVEY_RESPONSE = gql`
  mutation SubmitSurveyResponse($input: SubmitSurveyResponseInput!) {
    submitSurveyResponse(submitSurveyResponseInput: $input) {
      id
      surveyId
      userId
      isPartial
      completedAt
      answers {
        id
        questionId
        optionId
        textValue
        scaleValue
      }
    }
  }
`;
