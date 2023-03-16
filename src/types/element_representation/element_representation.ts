import { ConnectorRepresentation } from "./connector_representation";
import { GeometricalRepresentation } from "./geometrical_representation";
import { StringRepresentation } from "./string_representation";

export type ElementRepresentation = ConnectorRepresentation | GeometricalRepresentation | StringRepresentation;
