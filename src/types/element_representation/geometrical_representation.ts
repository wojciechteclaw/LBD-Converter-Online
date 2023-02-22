import { Mesh } from "three";
import { Representation } from "@enums/representation";

export type GeometricalRepresentation = {
    mesh: Mesh;
    type: Representation;
    volume: number;
};
