import {ProjectionTransform} from "./ProjectionTransform";
import GeographicProjection from "./GeographicProjection";

export class UprightOrientation extends ProjectionTransform {
    constructor(input: GeographicProjection) {
        super(input);
    }

    public toGeo(x: number, y: number): number[] {
        return this.input.toGeo(x, -y);
    }

    public fromGeo(lon: number, lat: number): number[] {
        const p: number[] = this.input.fromGeo(lon, lat);
        p[1] = -p[1];
        return p;
    }

    public upright(): boolean {
        return !this.input.upright();
    }

    public bounds(): number[] {
        const b: number[] = this.input.bounds();
        return [b[0], -b[3], b[2], -b[1]]
    }
}
