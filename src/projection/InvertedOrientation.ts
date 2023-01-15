import {ProjectionTransform} from "./ProjectionTransform";
import GeographicProjection from "./GeographicProjection";

export class InvertedOrientation extends ProjectionTransform {
    constructor(input: GeographicProjection) {
        super(input);
    }

    public toGeo(x: number, y: number): number[] {
        return this.input.toGeo(x, y);
    }

    public fromGeo(lon: number, lat: number): number[] {
        const p: number[] = this.input.fromGeo(lon, lat);
        const t: number = p[0];
        p[0] = p[1];
        p[1] = t;
        return p;
    }

    public bounds(): number[] {
        const b: number[] = this.input.bounds();
        return [b[1], b[0], b[3], b[2]]
    }
}
