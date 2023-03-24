import { ElementRepresentation } from "./element_representation/element_representation";

type IfcElement = {
    id: number;
    guid: string;
    modelID: number;
    representation: ElementRepresentation;
};

export { IfcElement };
