import { Matrix4, Vector3, Quaternion } from "three";
import {
    IfcAPI,
    IFCDISTRIBUTIONPORT,
    IFCFLOWSEGMENT,
    IFCFLOWFITTING,
    IFCFLOWTERMINAL,
    IFCLOCALPLACEMENT,
    IFCAXIS2PLACEMENT3D,
    IFCRELCONNECTSPORTTOELEMENT,
} from "web-ifc";

type ElementLocation = {
    guid: number;
    location: Vector3;
};

type IfcElementToPort = {
    elementID: string;
    portID: string;
};

export class ElementPlacementService {
    private queryCache: { [modelID: number]: { [expressId: number]: Matrix4 } } = { 0: {} };
    private ifcAPI: IfcAPI;

    constructor(ifcAPI: IfcAPI) {
        this.ifcAPI = ifcAPI;
    }

    public async getElementsCoordinates(modelID: number) {
        this.queryCache[modelID] = {};
        const elementClasses = [IFCDISTRIBUTIONPORT, IFCFLOWFITTING, IFCFLOWTERMINAL];
        const promisesOfElements: Promise<ElementLocation>[] = [];
        const promisesOfRelations: Promise<IfcElementToPort>[] = [];
        const elements = {};
        for (const ifcClass of elementClasses) {
            const elements = this.ifcAPI.GetLineIDsWithType(modelID, ifcClass);
            const elementsNumber = elements.size();
            for (let i = 0; i < elementsNumber; i++) {
                const expressID = elements.get(i);
                promisesOfElements.push(this.getElementLocation(modelID, expressID));
            }
        }
        const portToElementRelations = this.ifcAPI.GetLineIDsWithType(modelID, IFCRELCONNECTSPORTTOELEMENT);
        const numberOfRelations = portToElementRelations.size();
        for (let i = 0; i < numberOfRelations; i++) {
            const expressID = portToElementRelations.get(i);
            promisesOfRelations.push(this.getIfcElementToPortRelation(modelID, expressID));
        }
        await Promise.all(promisesOfElements).then((elementsLocation) => {
            for (const element of elementsLocation) {
                elements[element.guid] = element.location;
            }
        });
        const ifcElementPortRelations = {};
        await Promise.all(promisesOfRelations).then((r) => {
            for (const relation of r) {
                if (!ifcElementPortRelations[relation.elementID]) {
                    ifcElementPortRelations[relation.elementID] = [relation.portID];
                } else {
                    ifcElementPortRelations[relation.elementID].push(relation.portID);
                }
            }
        });
        this.getSegmentsCoordinates(modelID, elements, ifcElementPortRelations);
        console.log(elements);
    }

    private getSegmentsCoordinates(modelID: number, elements, ifcElementPortRelations) {
        const segments = this.ifcAPI.GetLineIDsWithType(modelID, IFCFLOWSEGMENT);
        for (let i = 0; i < segments.size(); i++) {
            const segmentExpressID = segments.get(i);
            const segmentElement = this.ifcAPI.GetLine(modelID, segmentExpressID);
            const relatedPorts = ifcElementPortRelations[segmentElement.GlobalId.value];
            const x = (elements[relatedPorts[0]].x + elements[relatedPorts[1]].x) / 2;
            const y = (elements[relatedPorts[0]].y + elements[relatedPorts[1]].y) / 2;
            const z = (elements[relatedPorts[0]].z + elements[relatedPorts[1]].z) / 2;
            elements[segmentElement.GlobalId.value] = new Vector3(x, y, z);
        }
    }

    private async getIfcElementToPortRelation(modelID: number, expressID: number): Promise<IfcElementToPort> {
        const element = this.ifcAPI.GetLine(modelID, expressID);
        const portElement = this.ifcAPI.GetLine(modelID, element.RelatingPort.value);
        const ifcElement = this.ifcAPI.GetLine(modelID, element.RelatedElement.value);
        return {
            elementID: ifcElement.GlobalId.value,
            portID: portElement.GlobalId.value,
        };
    }

    private async getElementLocation(modelID: number, expressID: number): Promise<ElementLocation> {
        const element = this.ifcAPI.GetLine(modelID, expressID);
        const location = await this.getPlacementCharacteristic(modelID, element);
        return {
            guid: element.GlobalId.value,
            location: location,
        };
    }

    private async getPlacementCharacteristic(modelID, port: any): Promise<Vector3> {
        const portPlacement = this.ifcAPI.GetLine(modelID, port.ObjectPlacement.value);
        const globalTransformation = this.getTransformationMatrix(modelID, portPlacement.PlacementRelTo.value);
        const translation = new Matrix4().copyPosition(globalTransformation);
        globalTransformation.setPosition(new Vector3(0, 0, 0));
        const location = this.getPortNormalAndLocation(modelID, portPlacement);
        location.applyMatrix4(globalTransformation).applyMatrix4(translation);
        return location;
    }

    private getPortNormalAndLocation(modelID: number, placement): Vector3 {
        const localPlacement = this.ifcAPI.GetLine(modelID, placement.RelativePlacement.value);
        const location = this.ifcAPI.GetLine(modelID, localPlacement.Location.value)["Coordinates"];
        return new Vector3(location[0].value, location[1].value, location[2].value);
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
                return ElementPlacementService.buildTransformationMatrix(point, xAxis, zAxis);
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
}
