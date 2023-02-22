import { Representation } from "@/enums/representation";
import { GeometricalRepresentation } from "./geometrical_representation";
import { StringRepresentation } from "./string_representation";

export type ElementRepresentation = GeometricalRepresentation | StringRepresentation;
