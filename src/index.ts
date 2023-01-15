import {GeographicProjection, Orientation} from "./projection/GeographicProjection";
import {ModifiedAirocean} from "./projection/ModifiedAirocean";
import {ScaleProjection} from "./projection/ScaleProjection";

/**
 * Converts real life coordinates to in-game coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns {[number, number]} - In-game coordinates [x, z]
 */
export const fromGeo = (lat: number, lon: number): [number, number] => {
    return [lat, lon];
}

/**
 * Converts in-game coordinates to real life coordinates
 * @param x - Latitude
 * @param z - Longitude
 * @returns {[number, number]} - Real life coordinates [latitude, longitude]
 */
export const toGeo = (x: number, z: number): [number, number] => {
    return [x, z];
}

const projection: GeographicProjection = new ModifiedAirocean();
const uprightProj: GeographicProjection = GeographicProjection.orientProjection(projection, Orientation.upright);
const scaleProj: ScaleProjection = new ScaleProjection(uprightProj, 7318261.522857145, 7318261.522857145)

// tslint:disable-next-line:no-console
console.log(scaleProj.toGeo(3231992, -5296639))

