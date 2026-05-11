import { gql } from "@apollo/client";

export const GET_LAWYER_BY_ID = gql`
  query FindLayer {
    findLayer {
      address
      country
      department
      district
      email
      hasRegistered
      id
      dni
      id_address
      id_person
      id_district
      maternal_surname
      paternal_surname
      name
      phone
      province
    }
  }
`;

export const GET_AVAILABLE_LAWYER_BY_CIP = gql`
  query AvailableLawyerRequest($cip: String!) {
    availableLawyerRequest(cip: $cip) {
      active
      alive
      cip
      collegiate_status
      condition_message
      name
      incorporation_date
    }
  }
`;

export const GET_PROFILE_MEMBER = gql`
  query GetProfile {
    me {
      email
      name
      maternalSurname
      paternalSurname
      dni
      memberCode
      phone
      role
      status
      memberCategory
      birthdate
      address
      district
      province
      department
      country
    }
  }
`;

export const GET_STATUS_MEMBER = gql`
  query GetStatusMember {
    getStatusMember {
      status
      hasPaymentPerDay
      hasRegistered
    }
  }
`;

export const GET_WAS_REGISTERED_MEMBER = gql`
  query IsMemberRegistered {
    isMemberRegistered
  }
`;
