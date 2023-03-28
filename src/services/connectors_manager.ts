import { ConnectorFlowDirection } from "@enums/connector_flow_direction";
import { Vector3, Matrix4, Quaternion } from "three";
import {
    IfcAPI,
    IFCDISTRIBUTIONPORT,
    IFCRELCONNECTSPORTS,
    IFCRELCONNECTSPORTTOELEMENT,
    IFCRELNESTS,
    IFCLOCALPLACEMENT,
    IFCAXIS2PLACEMENT3D,
} from "web-ifc";
import { ConnectorGeometry } from "@/types/connectors/connector_geometry";
import { IfcElement } from "@/types/ifc_element";
import { Representation } from "@enums/representation";

class ConnectorsManager {
    private connectors: IfcElement[] = [];
    private queryCache: { [modelID: number]: { [expressId: number]: Matrix4 } } = {};
    private ifcAPI: IfcAPI;

    constructor(ifcAPI: IfcAPI) {
        this.ifcAPI = ifcAPI;
    }

    public async addUnconnectedConnectors(modelID: number) {
        const allConnectedPorts = await this.getAllConnectedportIDs(modelID);
        const allPortsParent = await this.getPortIDParent(modelID);
        const allPorts = await this.ifcAPI.GetLineIDsWithType(modelID, IFCDISTRIBUTIONPORT);
        const promises = Array<Promise<IfcElement>>();
        this.queryCache[modelID] = {};
        for (let i = 0; i < allPorts.size(); i++) {
            const port = allPorts.get(i);
            if (!allConnectedPorts.has(port)) {
                promises.push(this.getConnector(modelID, port, allPortsParent[port]));
            }
        }
        await Promise.all(promises).then((elements) => {
            this.connectors.push(...elements);
        });
    }

    public getAllUnconnectedElements(): IfcElement[] {
        return this.connectors;
    }

    private async getConnector(modelID: number, portID: number, parentExpressId: number) {
        const portElement = this.ifcAPI.GetLine(modelID, portID);
        const parent = this.ifcAPI.GetLine(modelID, parentExpressId);
        const { normal, location, flowDirection } = await this.getPlacementCharacteristic(modelID, portElement);
        const connector = {
            location: location,
            flowNormal: normal,
            parentId: parent.GlobalId.value,
            flowDirection: flowDirection,
        };
        const element: IfcElement = {
            id: portID,
            guid: portElement.GlobalId.value,
            modelID: modelID,
            representation: {
                connector: connector,
                type: Representation.CONNECTOR,
            },
        };
        return element;
    }

    private correctFlowDirection(connector: ConnectorGeometry): ConnectorGeometry {
        // After export from Revit unconnected and directed connectors direction is opposite than expected
        if (connector.flowDirection === ConnectorFlowDirection.BIDIRECTIONAL) return connector;
        else if (connector.flowDirection === ConnectorFlowDirection.SINK) {
            connector.flowDirection = ConnectorFlowDirection.SOURCE;
        } else {
            connector.flowDirection = ConnectorFlowDirection.SINK;
        }
        connector.normal.negate();
        return connector;
    }

    private getPortNormalAndLocation(modelID: number, placement) {
        const localPlacement = this.ifcAPI.GetLine(modelID, placement.RelativePlacement.value);
        const location = this.ifcAPI.GetLine(modelID, localPlacement.Location.value)["Coordinates"];
        const vectorStartingPoint = new Vector3(location[0].value, location[1].value, location[2].value);
        let connectorNormal = new Vector3(0, 0, 1);
        if (localPlacement.Axis) {
            const axis = this.ifcAPI.GetLine(modelID, localPlacement.Axis.value)["DirectionRatios"];
            connectorNormal = new Vector3(axis[0].value, axis[1].value, axis[2].value);
        }
        return { normal: connectorNormal, location: vectorStartingPoint };
    }

    private placementMatrix(modelID: number, placement: any): Matrix4 {
        if (placement !== null) {
            if (this.queryCache[modelID][placement.value]) {
                return new Matrix4().copy(this.queryCache[modelID][placement.value]);
            }
            const localItem = placement.value;
            const result = this.getTransformationMatrix(modelID, localItem);
            this.queryCache[modelID][localItem] = new Matrix4().copy(result);
            return result;
        }
        return new Matrix4().identity();
    }

    private getVector(
        line: any,
        modelID: number,
        lineParameter: string,
        lineProperty: string,
        defaultVector: Vector3
    ): Vector3 {
        if (line[`${lineParameter}`] !== null) {
            const result = this.ifcAPI.GetLine(modelID, line[`${lineParameter}`].value)[`${lineProperty}`];
            defaultVector.set(result[0].value, result[1].value, result[2].value);
        }
        return defaultVector;
    }

    private getTransformationMatrix(modelID: number, expressID: number): Matrix4 {
        const line = this.ifcAPI.GetLine(modelID, expressID);
        switch (line.type) {
            case IFCLOCALPLACEMENT:
                const global = this.placementMatrix(modelID, line.PlacementRelTo);
                const local = this.placementMatrix(modelID, line.RelativePlacement);
                const result = local.multiply(global);
                return result;
            case IFCAXIS2PLACEMENT3D:
                const xAxis = this.getVector(line, modelID, "RefDirection", "DirectionRatios", new Vector3(1, 0, 0));
                const zAxis = this.getVector(line, modelID, "Axis", "DirectionRatios", new Vector3(0, 0, 1));
                const point = this.getVector(line, modelID, "Location", "Coordinates", new Vector3(0, 0, 0));
                return ConnectorsManager.buildTransformationMatrix(point, xAxis, zAxis);
            default:
                return new Matrix4().identity();
        }
    }

    private static buildTransformationMatrix(
        point: Vector3 = new Vector3(0, 0, 0),
        xAxis: Vector3 = new Vector3(1, 0, 0),
        zAxis: Vector3 = new Vector3(0, 0, 1)
    ) {
        const rotation = new Matrix4();
        const yAxis = new Vector3().crossVectors(zAxis, xAxis).normalize();
        rotation.makeBasis(xAxis.normalize(), yAxis, zAxis.normalize());
        const transformation = new Matrix4();
        transformation.compose(point, new Quaternion().setFromRotationMatrix(rotation), new Vector3(1, 1, 1));
        return transformation;
    }

    private async getPlacementCharacteristic(modelID, port: any): Promise<ConnectorGeometry> {
        const portPlacement = this.ifcAPI.GetLine(modelID, port.ObjectPlacement.value);
        const globalTransformation = await this.getTransformationMatrix(modelID, portPlacement.PlacementRelTo.value);
        const translation = new Matrix4().copyPosition(globalTransformation);
        globalTransformation.setPosition(new Vector3(0, 0, 0));
        const { normal, location } = this.getPortNormalAndLocation(modelID, portPlacement);
        normal.applyMatrix4(globalTransformation);
        location.applyMatrix4(globalTransformation).applyMatrix4(translation);
        const connector = { normal, location, flowDirection: ConnectorsManager.getFlowType(port.FlowDirection.value) };
        this.correctFlowDirection(connector);
        return connector;
    }

    private static getFlowType(flowDirection: string): ConnectorFlowDirection {
        switch (flowDirection) {
            case "SOURCE":
                return ConnectorFlowDirection.SOURCE;
            case "SINK":
                return ConnectorFlowDirection.SINK;
            case "SOURCEANDSINK":
                return ConnectorFlowDirection.BIDIRECTIONAL;
            default:
                return ConnectorFlowDirection.BIDIRECTIONAL;
        }
    }

    private async getAllConnectedportIDs(modelID: number): Promise<Set<number>> {
        const connectedportIDs = new Set<number>();
        let allRelations = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELCONNECTSPORTS);
        for (let i = 0; i < allRelations.size(); i++) {
            const connectorsRelationId = allRelations.get(i);
            const relation = this.ifcAPI.GetLine(modelID, connectorsRelationId);
            connectedportIDs.add(relation.RelatedPort.value);
            connectedportIDs.add(relation.RelatingPort.value);
        }
        return connectedportIDs;
    }

    private async getPortIDParent(modelID: number): Promise<{ [key: number]: number }> {
        const connectedportIDs: { [key: number]: number } = {};
        let allRelationsIFC4 = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELNESTS);
        for (let i = 0; i < allRelationsIFC4.size(); i++) {
            const relation = this.ifcAPI.GetLine(modelID, allRelationsIFC4.get(i));
            for (let item of relation.RelatedObjects) {
                connectedportIDs[item.value] = relation.RelatingObject.value;
            }
        }
        let allRelationsIFC2 = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELCONNECTSPORTTOELEMENT);
        for (let i = 0; i < allRelationsIFC2.size(); i++) {
            const relation = this.ifcAPI.GetLine(modelID, allRelationsIFC2.get(i));
            connectedportIDs[relation.RelatingPort.value] = relation.RelatedElement.value;
        }
        return connectedportIDs;
    }
}

export { ConnectorsManager }
