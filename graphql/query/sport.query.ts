import { gql } from "@apollo/client";

export const GET_ALL_TOURNAMENTS = gql`
  query FindAllTournaments($sportActivityId: Int!) {
    findAllTournaments(sportActivityId: $sportActivityId) {
      disciplineId
      id
      media {
        alt
        bytes
        caption
        createdAt
        format
        height
        id
        public_id
        resource_type
        title
        url
        width
      }
      discipline {
        name
        id
        mainImage {
          url
          id
          title
        }
      }
    }
  }
`;

export const GET_ALL_SPORTS = gql`
  query FindAllSportActivities($page: Int!, $pageSize: Int!, $orderBy: String, $search: String) {
    findAllSportActivities(page: $page, pageSize: $pageSize,orderBy: $orderBy,search: $search) {
      activities {
        date
        href
        id
        title
        media {
          alt
          bytes
          caption
          createdAt
          title
          url
        }
      } 
      meta {
        page
        total
        totalPages
      } 
    }
  }
`;

export const GET_TOURNAMENT_BY_ID = gql`
  query FindOneTournament($findOneTournamentId: Int!) {
    findOneTournament(id: $findOneTournamentId) {
      id
      media {
        url
        id
        alt
        bytes
        caption
      }  
    }
  }
`;