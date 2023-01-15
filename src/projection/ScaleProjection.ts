import {ProjectionTransform} from "./ProjectionTransform";
import GeographicProjection from "./GeographicProjection";

export class ScaleProjection extends ProjectionTransform {

    scaleX: number;
    scaleY: number;

    constructor(input: GeographicProjection, scaleX: number, scaleY: number) {
        super(input);
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }

    public toGeo(x: number, y: number): number[] {
        return this.input.toGeo(x/this.scaleX, y/this.scaleY);
    }

    public fromGeo(lon: number, lat: number): number[] {
        const p = this.input.fromGeo(lon, lat);
        p[0] *= this.scaleX;
        p[1] *= this.scaleY;
        return p;
    }

    public upright(): boolean {
        return (this.scaleY<0) ? !this.input.upright() : this.input.upright()
    }

    public bounds(): number[] {
        const b = this.input.bounds();
        b[0] *= this.scaleX;
        b[1] *= this.scaleY;
        b[2] *= this.scaleX;
        b[3] *= this.scaleY;
        return b;
    }

    public metersPerUnit(): number {
        return this.input.metersPerUnit()/Math.sqrt((this.scaleX*this.scaleX + this.scaleY*this.scaleY)/2);
    }
}
