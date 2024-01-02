import GeographicProjection from "./projection/GeographicProjection";
import {ModifiedAirocean} from "./projection/ModifiedAirocean";
import {ScaleProjection} from "./projection/ScaleProjection";
import {Orientation} from "./projection/Oriantation";
import {UprightOrientation} from "./projection/UprightOrientation";
import {InvertedOrientation} from "./projection/InvertedOrientation";

const orientProjection = (base: GeographicProjection, o: Orientation): GeographicProjection => {
    if (base.upright()) {
        if (o === Orientation.upright)
            return base;
        base = new UprightOrientation(base);
    }

    if (o === Orientation.swapped) {
        return new InvertedOrientation(base);
    } else if (o === Orientation.upright) {
        base = new UprightOrientation(base);
    }

    return base;
}

const projection: GeographicProjection = new ModifiedAirocean();
const uprightProj: GeographicProjection = orientProjection(projection, Orientation.upright);
const scaleProj: ScaleProjection = new ScaleProjection(uprightProj, 7318261.522857145, 7318261.522857145)



/**
 * Converts real life coordinates to in-game coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns {[number, number]} - In-game coordinates [x, z]
 */
export const fromGeo = (lat: number, lon: number): [number, number] => {
    const [x, z] = scaleProj.fromGeo(lon, lat);
    return [x, z];
}

/**
 * Converts real life coordinates to in-game coordinates, returns an object
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns {x: number, z: number} - In-game coordinates
 */
export const fromGeoObject = (lat: number, lon: number): {x: number, z: number} => {
    const [x, z] = scaleProj.fromGeo(lon, lat);
    return {x, z};
}

/**
 * Converts in-game coordinates to real life coordinates
 * @param x - Latitude
 * @param z - Longitude
 * @returns {[number, number]} - Real life coordinates [latitude, longitude]
 */
export const toGeo = (x: number, z: number): [number, number] => {
    const [lon, lat] = scaleProj.toGeo(x, z);
    return [lat, lon];
}

/**
 * Converts in-game coordinates to real life coordinates, returns an object
 * @param x - Latitude
 * @param z - Longitude
 * @returns {lat: number, lon: number} - Real life coordinates [latitude, longitude]
 */
export const toGeoObject = (x: number, z: number): {lat: number, lon: number} => {
    const [lon, lat] = scaleProj.toGeo(x, z);
    return {lat, lon};
}






