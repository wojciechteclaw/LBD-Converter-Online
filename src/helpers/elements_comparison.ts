import { Connection } from "@enums/connection";
import { ConnectedElements } from "@/types/connected_elements";
import { StringRepresentation } from "@/types/element_representation/string_representation";
import { GeometryOperations } from "@/helpers/geometry_operations";
import { GeometricalRepresentation } from "@/types/element_representation/geometrical_representation";
import { CSG } from "three-csg-ts";
import { Representation } from "@enums/representation";
import { IfcElement } from "@/types/ifc_element";
import { ElementRepresentation } from "@/types/element_representation/element_representation";
import { ConnectorRepresentation } from "@/types/element_representation/connector_representation";
import { ConnectorFlowDirection } from "@/enums/connector_flow_direction";

class ElementsComparison {
    ANGLE_TOLERANCE = 1;
    DISTANCE_TOLERANCE = 0.0025;

    public static async compareElements(
        elements1: IfcElement[],
        elements2: IfcElement[],
        connections: ConnectedElements[],
        filter: Representation,
        compareFunction: (element1: ElementRepresentation, element2: ElementRepresentation) => boolean,
        successRelation: Connection
    ): Promise<void> {
        let model1Elements = elements1.filter((e) => e.representation.type === filter);
        let model2Elements = elements2.filter((e) => e.representation.type === filter);
        for (let element1 of model1Elements) {
            for (let element2 of model2Elements) {
                if (compareFunction(element1.representation, element2.representation)) {
                    connections.push({
                        object: element1,
                        subject: element2,
                        relation: successRelation,
                    });
                }
            }
        }
    }

    public static compareStringRepresentations(
        level1string: StringRepresentation,
        level2string: StringRepresentation
    ): boolean {
        return level1string.contextString === level2string.contextString;
    }

    public static compareGeometryRepresentations(
        element1: GeometricalRepresentation,
        element2: GeometricalRepresentation
    ): boolean {
        let intersectionMesh = CSG.intersect(element1.mesh, element2.mesh);
        let intersectVolume = GeometryOperations.getVolume(intersectionMesh.geometry);
        return (
            intersectVolume > 0.95 * element1.volume &&
            intersectVolume > 0.95 * element2.volume &&
            element1.volume > 0.95 * element2.volume &&
            element1.volume < 1.05 * element2.volume
        );
    }

    public static compareConnectors(element1: ConnectorRepresentation, element2: ConnectorRepresentation): boolean {
        const distance = element1.connector.location.distanceTo(element2.connector.location);
        if (distance > 0.0025 || !GeometryOperations.areVectorsParallel) return false;
        if (element1.connector.flowDirection === ConnectorFlowDirection.Bidirectional) return true;
        return element1.connector.flowDirection !== element2.connector.flowDirection;
    }
}

export { ElementsComparison };
