import { gql } from "@apollo/client";

export const UPDATE_LAWYER_MUTATION = gql`
mutation UpdateLayer($updateLayerInput: UpdateLayerInput!) {
  updateLayer(updateLayerInput: $updateLayerInput) {
    address
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
}`;

export const DOWNLOAD_CERTIFICATE_MUTATION = gql`
  query Query {
    generatedAvailabilityCertificate
  }
`;