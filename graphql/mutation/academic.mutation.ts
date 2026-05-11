import { gql } from "@apollo/client";

export const GENERATE_ACADEMIC_ACTIVITY = gql`
mutation GenerateAcademicAttendace($academicId: Int!) {
  generateAcademicAttendace(academicId: $academicId) {
    message  
  }
}
`;