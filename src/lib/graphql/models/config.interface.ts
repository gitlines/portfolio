/**
 * Configuration for GraphQl module
 */
export interface GraphQlConfig {
   /**
    * The origin for the http request. For subscription it will use websockets, and will use the same origin
    * but using ws instead of http, or wss instead of https.
    * If not provided in browser the service will use the same origin as the current window.
    */
   origin?: string;

   /**
    * Relative URI for the GraphQl endpoint.
    */
   uri: string;
}
