import { ConnectorFlowDirection } from "@enums/connector_flow_direction";
import { Vector3 } from "three";

export type Connector = {
    location: Vector3;
    flowNormal: Vector3;
    parentId: string;
    flowDirection: ConnectorFlowDirection;
};
