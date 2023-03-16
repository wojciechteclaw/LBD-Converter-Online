import { Representation } from "@enums/representation";
import { Connector } from "../connectors/connector";

export type ConnectorRepresentation = {
    connector: Connector;
    type: Representation;
};
