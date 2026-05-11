import { gql } from "@apollo/client";

export const GENERATE_ATTENDACE_MUTATION = gql`
  mutation GenerateAttendace($activityId: Int!) {
    generateAttendace(activityId: $activityId) {
      message 
    }
  }
`;