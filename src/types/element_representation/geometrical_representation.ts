import { Representation } from "@enums/representation";
import { Mesh } from "three";

export type GeometricalRepresentation = {
    geometry: Mesh;
    type: Representation;
    volume: number;
};
