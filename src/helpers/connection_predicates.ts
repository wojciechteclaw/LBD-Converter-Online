import { Connection } from "../enums/connection";

export function getConnectionPredicate(connection: Connection) {
    switch (connection) {
        case Connection.SAME_AS:
            return "http://www.w3.org/2002/07/owl#sameAs";
        default:
            return "";
    }
}
