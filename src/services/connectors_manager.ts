import { ConnectorFlowDirection } from "@enums/connector_flow_direction";
import { Connector } from "@/types/connectors/connector";
import { Vector3, Matrix4, Quaternion } from "three";
import { RAD2DEG } from "three/src/math/MathUtils";
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

class ConnectorsManager {
    private connectors: { [modelID: number]: Connector[] } = {};
    private queryCache: { [modelID: number]: { [expressId: number]: Matrix4 } } = {};
    private ifcAPI: IfcAPI;

    constructor(ifcAPI: IfcAPI) {
        this.ifcAPI = ifcAPI;
    }

    public async addUnconnectedConnectors(modelID: number) {
        console.time("connectors");
        const connectedPortIds = await this.getAllConnectedPortIds(modelID);
        const portIdParent = await this.getPortIdParent(modelID);
        const allPorts = await this.ifcAPI.GetLineIDsWithType(modelID, IFCDISTRIBUTIONPORT);
        this.queryCache[modelID] = {};
        const unconnectedConnectors: Connector[] = [];
        for (let i = 0; i < allPorts.size(); i++) {
            const port = allPorts.get(i);
            if (!connectedPortIds.has(port)) {
                let con = await this.getConnector(modelID, port, portIdParent[port]);
                console.log(con);
                unconnectedConnectors.push(con);
            }
        }
        this.connectors[modelID] = unconnectedConnectors;
        console.timeEnd("connectors");
    }

    public getAllConnectors(modelID: number) {
        return this.connectors[modelID];
    }

    private async getConnector(modelID: number, portId: number, parentExpressId: number) {
        const portElement = this.ifcAPI.GetLine(modelID, portId);
        const parent = this.ifcAPI.GetLine(modelID, parentExpressId);
        const { normal, location } = await this.getPlacementCharacteristic(
            modelID,
            portElement,
            parent.constructor.name
        );
        const flowDirection = ConnectorsManager.getFlowType(portElement.FlowDirection.value);
        const connector: Connector = {
            id: portElement.GlobalId.value,
            location: location,
            flowNormal: normal,
            parentId: parent.GlobalId.value,
            flowDirection: flowDirection,
        };
        return connector;
    }

    private getPortLocalPlacementCharacteristics(modelID: number, placement) {
        const localPlacement = this.ifcAPI.GetLine(modelID, placement.RelativePlacement.value);
        const location = this.ifcAPI.GetLine(modelID, localPlacement.Location.value);
        const vectorStartingPoint = new Vector3(
            location.Coordinates[0].value,
            location.Coordinates[1].value,
            location.Coordinates[2].value
        );
        let connectorNormal = new Vector3(0, 0, 1);
        if (localPlacement.Axis) {
            const axis = this.ifcAPI.GetLine(modelID, localPlacement.Axis.value)["DirectionRatios"];
            connectorNormal = new Vector3(axis[0].value, axis[1].value, axis[2].value);
        }
        return { normal: connectorNormal, location: vectorStartingPoint };
    }

    private async placementMatrix(modelID: number, placement: any): Promise<Matrix4> {
        if (placement !== null) {
            if (this.queryCache[modelID][placement.value]) return this.queryCache[modelID][placement.value];
            const localItem = placement.value;
            const result = await this.getTransformationMatrixRecursively(modelID, localItem);
            this.queryCache[modelID][localItem] = result;
            return result;
        }
        return new Matrix4().identity();
    }

    private async getElementGlobalPlacement(modelID: number, placement: any) {
        const global = await this.placementMatrix(modelID, placement.PlacementRelTo);
        const local = await this.placementMatrix(modelID, placement.RelativePlacement);
        const result = local.multiply(global);
        return result;
    }

    private getVector(line: any, modelID: number, parameter: string, property: string, vector: Vector3): Vector3 {
        if (line[`${parameter}`] !== null) {
            const result = this.ifcAPI.GetLine(modelID, line[`${parameter}`].value)[`${property}`];
            vector.set(result[0].value, result[1].value, result[2].value);
        }
        return vector;
    }

    private async getTransformationMatrixRecursively(modelID: number, expressID: number): Promise<Matrix4> {
        const line = this.ifcAPI.GetLine(modelID, expressID);
        switch (line.type) {
            case IFCLOCALPLACEMENT:
                return await this.getElementGlobalPlacement(modelID, line);
            case IFCAXIS2PLACEMENT3D:
                const xAxis = this.getVector(line, modelID, "RefDirection", "DirectionRatios", new Vector3(0, 0, 1));
                const zAxis = this.getVector(line, modelID, "Axis", "DirectionRatios", new Vector3(1, 0, 0));
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
        const R = new Matrix4();
        const yAxis = new Vector3().crossVectors(zAxis, xAxis).normalize();
        R.makeBasis(xAxis.normalize(), yAxis, zAxis.normalize());
        const transform = new Matrix4();
        transform.compose(point, new Quaternion().setFromRotationMatrix(R), new Vector3(1, 1, 1));
        return transform;
    }

    private async getPlacementCharacteristic(modelID, port: any, elementClass: string): Promise<ConnectorGeometry> {
        const portPlacement = this.ifcAPI.GetLine(modelID, port.ObjectPlacement.value);
        let transformationMatrix = new Matrix4().identity();
        if (elementClass.toLowerCase().includes("fitting")) {
            transformationMatrix = await this.getElementGlobalPlacement(
                modelID,
                this.ifcAPI.GetLine(modelID, portPlacement.PlacementRelTo.value)
            );
        }
        const translation = new Matrix4().copyPosition(transformationMatrix);
        transformationMatrix.setPosition(new Vector3(0, 0, 0));
        const { normal, location } = this.getPortLocalPlacementCharacteristics(modelID, portPlacement);
        normal.applyMatrix4(transformationMatrix);
        return { normal: normal, location: location.applyMatrix4(transformationMatrix).applyMatrix4(translation) };
    }

    private static getFlowType(flowDirection: string): ConnectorFlowDirection {
        switch (flowDirection) {
            case "SOURCE":
                return ConnectorFlowDirection.Source;
            case "SINK":
                return ConnectorFlowDirection.Sink;
            case "SOURCEANDSINK":
                return ConnectorFlowDirection.Bidirectional;
            default:
                return ConnectorFlowDirection.Bidirectional;
        }
    }

    private async getAllConnectedPortIds(modelID: number): Promise<Set<number>> {
        const connectedPortIds = new Set<number>();
        let allRelations = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELCONNECTSPORTS);
        for (let i = 0; i < allRelations.size(); i++) {
            const connectorsRelationId = allRelations.get(i);
            const relation = this.ifcAPI.GetLine(modelID, connectorsRelationId);
            connectedPortIds.add(relation.RelatedPort.value);
            connectedPortIds.add(relation.RelatingPort.value);
        }
        return connectedPortIds;
    }

    private async getPortIdParent(modelID: number): Promise<{ [key: number]: number }> {
        const connectedPortIds: { [key: number]: number } = {};
        let allRelationsIFC4 = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELNESTS);
        for (let i = 0; i < allRelationsIFC4.size(); i++) {
            const relation = this.ifcAPI.GetLine(modelID, allRelationsIFC4.get(i));
            for (let item of relation.RelatedObjects) {
                connectedPortIds[item.value] = relation.RelatingObject.value;
            }
        }
        let allRelationsIFC2 = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELCONNECTSPORTTOELEMENT);
        for (let i = 0; i < allRelationsIFC2.size(); i++) {
            const relation = this.ifcAPI.GetLine(modelID, allRelationsIFC2.get(i));
            connectedPortIds[relation.RelatingPort.value] = relation.RelatedElement.value;
        }
        return connectedPortIds;
    }

    public static async areConnectorsConnected(connector1: Connector, connector2: Connector): Promise<boolean> {
        const connector1Location = connector1.location;
        const connector2Location = connector2.location;
        const distance = connector1Location.distanceTo(connector2Location);
        return distance < 0.025 && this.areVectorsParallel(connector1.flowNormal, connector2.flowNormal);
    }

    private static areVectorsParallel(vector1: Vector3, vector2: Vector3, angel_tolerance: number = 1): boolean {
        const angle = vector1.angleTo(vector2) * RAD2DEG;
        return angle < angel_tolerance || angle > 180 - angel_tolerance;
    }
}

export { ConnectorsManager };
