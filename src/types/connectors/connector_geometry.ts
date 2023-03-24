import { ConnectorFlowDirection } from "@enums/connector_flow_direction";
import { Vector3 } from "three";

type ConnectorGeometry = {
    normal: Vector3;
    location: Vector3;
    flowDirection: ConnectorFlowDirection;
};

export { ConnectorGeometry };
