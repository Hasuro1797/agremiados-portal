import { gql } from "@apollo/client";

export const GET_LOCATION_QUERY = gql`
  query GetLocations {
    getLocations {
      Departamento
      Distrito
      IdDistrito
      Pais
      Provincia  
    }
  }
`;