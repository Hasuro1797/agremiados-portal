import { gql } from "@apollo/client";

/**
 * Backend resolver: getCalendarActivities(startDate: String!, endDate: String!): [IActivity!]!
 *
 * Filters:
 *   - startDate: "yyyy-MM-dd"  — primer día del rango visible del calendario (inicio de semana del mes)
 *   - endDate:   "yyyy-MM-dd"  — último día del rango visible del calendario (fin de semana del mes)
 *
 * Devuelve TODOS los eventos (académicos + sociales) cuya fecha caiga dentro del rango.
 * Sin paginación — el volumen mensual de un colegio profesional es manejable (<100).
 * El backend puede ordenar por `date` ASC.
 */
export const GET_CALENDAR_ACTIVITIES = gql`
  query GetCalendarActivities($startDate: String!, $endDate: String!) {
    getCalendarActivities(startDate: $startDate, endDate: $endDate) {
      id
      title
      type
      date
      finishDate
      hasPrice
      price
      venue
      address
      href
      discounts {
        id
        percentage
        startDate
        endDate
        type
        status
      }
      images {
        order
        media {
          url
          alt
        }
      }
    }
  }
`;
