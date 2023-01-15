
export default abstract class GeographicProjection {
    public static readonly EARTH_CIRCUMFERENCE: number = 40075017;
    public static readonly EARTH_POLAR_CIRCUMFERENCE: number = 40008000;



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



}
