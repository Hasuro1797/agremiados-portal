import { gql } from "@apollo/client";

export const GET_PUBLIC_ORGANIZATION = gql`
  query GetPublicOrganization {
    getPublicOrganization {
      name
      logo
      description
      primaryColor
      primaryLight
      accentColor
      accentHover
      address
      phone
      moduleEvents
      moduleReservations
      moduleSurveys
      moduleSupport
      moduleAgreements
      moduleQuotes
      modulePosts
      moraAutoBlock
      favicon
      bannerUrl
      socialMedia
      footerText
      footerLinks
      email
      website
    }
  }
`;
