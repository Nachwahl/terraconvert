import {UprightOrientation} from "./UprightOrientation";
import {InvertedOrientation} from "./InvertedOrientation";
import {Airocean} from "./Airocean";
import {ConformalEstimate} from "./ConformalEstimate";
import {ModifiedAirocean} from "./ModifiedAirocean";

export enum Orientation {
    none, upright, swapped
}

export class GeographicProjection {
    public static readonly EARTH_CIRCUMFERENCE: number = 40075017;
    public static readonly EARTH_POLAR_CIRCUMFERENCE: number = 40008000;

    public static readonly projections = new Map<string, GeographicProjection>()

    static {
        this.projections.set("equirectangular", new GeographicProjection());
        this.projections.set("airocean", new Airocean());
        this.projections.set("conformal", new ConformalEstimate());
        this.projections.set("bteairocean", new ModifiedAirocean());
    }


    public static orientProjection(base: GeographicProjection, o: Orientation): GeographicProjection {
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

    public toGeo(x: number, y: number): number[] {
        return [x, y];
    }

    public fromGeo(lon: number, lat: number): number[] {
        return [lon, lat];
    }

    public metersPerUnit(): number {
        return 100000;
    }

    public bounds(): number[] {

        // get max in by using extreme coordinates
        const b: number[] = new Array<number>(
            this.fromGeo(-180, 0)[0],
            this.fromGeo(0, -90)[1],
            this.fromGeo(180, 0)[0],
            this.fromGeo(0, 90)[1]
        );

        if (b[0] > b[2]) {
            const t: number = b[0];
            b[0] = b[2];
            b[2] = t;
        }

        if (b[1] > b[3]) {
            const t: number = b[1];
            b[1] = b[3];
            b[3] = t;
        }

        return b;
    }

    public upright() {
        return this.fromGeo(0, 90)[1] <= this.fromGeo(0, -90)[1];
    }

    public vector(x: number, y: number, north: number, east: number): number[] {
        const geo: number[] = this.toGeo(x, y);

        const off: number[] = this.fromGeo(
            geo[0] + east * 360 / (Math.cos(geo[1] * Math.PI / 180) * GeographicProjection.EARTH_CIRCUMFERENCE),
            geo[1] + north * 360.0 / GeographicProjection.EARTH_POLAR_CIRCUMFERENCE)

        return [off[0] - x, off[1] - y]
    }

    public tissot(lon: number, lat: number, d: number) {
        const R = GeographicProjection.EARTH_CIRCUMFERENCE / (2 * Math.PI);

        const ddeg: number = d * 180 / Math.PI;

        const base: number[] = this.fromGeo(lon, lat);
        const lonoff: number[] = this.fromGeo(lon + ddeg, lat);
        const latoff: number[] = this.fromGeo(lon, lat + ddeg);

        const dxdl: number = (lonoff[0] - base[0]) / d;
        const dxdp: number = (latoff[0] - base[0]) / d;
        const dydl: number = (lonoff[1] - base[1]) / d;
        const dydp: number = (latoff[1] - base[1]) / d;

        const cosp: number = Math.cos(lat * Math.PI / 180);

        const h: number = Math.sqrt(dxdp * dxdp + dydp * dydp) / R;
        const k: number = Math.sqrt(dxdl * dxdl + dydl * dydl) / (cosp * R);

        const sint: number = Math.abs(dydp * dxdl - dxdp * dydl) / (R * R * cosp * h * k);
        const ap: number = Math.sqrt(h * h + k * k + 2 * h * k * sint);
        const bp: number = Math.sqrt(h * h + k * k - 2 * h * k * sint);

        const a: number = (ap + bp) / 2;
        const b: number = (ap - bp) / 2;

        return [h * k * sint, 2 * Math.asin(bp / ap), a, b];


    }


}
