import {Airocean} from "./Airocean";
import {InvertableVectorField} from "./InvertableVectorField";
import * as fs from "fs";
import * as path from "path";

export class ConformalEstimate extends Airocean {
    inverse: InvertableVectorField;

    VECTOR_SCALE_FACTOR: number = 1 / 1.1473979730192934;

    constructor() {
        super();
        const sideLength: number = 256;

        const xs = new Array(sideLength + 1);
        const ys = new Array(xs.length);

        const conformalRaw = fs.readFileSync(path.resolve(__dirname, 'resources/conformal.txt'))
        const conformal = JSON.parse(conformalRaw.toString());

        let counter = -1;

        for (let u = 0; u < xs.length; u++) {
            const px: number[] = new Array(xs.length - u);
            const py: number[] = new Array(xs.length - u);
            xs[u] = px;
            ys[u] = py;
        }

        for (let v = 0; v < xs.length; v++) {
            for (let u = 0; u < xs.length - v; u++) {
                counter++;
                const entry: number[] = conformal[counter];

                xs[u][v] = entry[0] * this.VECTOR_SCALE_FACTOR;
                ys[u][v] = entry[1] * this.VECTOR_SCALE_FACTOR;

            }
        }

        this.inverse = new InvertableVectorField(xs, ys);
    }

    protected triangleTransform(x: number, y: number, z: number): number[] {
        let c = super.triangleTransform(x, y, z);

        x = c[0];
        y = c[1];

        c[0] /= ConformalEstimate.ARC;
        c[1] /= ConformalEstimate.ARC;

        c[0] += 0.5;
        c[1] += ConformalEstimate.ROOT3 / 6;

        c = this.inverse.applyNewtonsMethod(x, y, c[0], c[1], 5);

        c[0] -= 0.5;
        c[1] -= ConformalEstimate.ROOT3 / 6;

        c[0] *= ConformalEstimate.ARC;
        c[1] *= ConformalEstimate.ARC;

        return c;
    }

    protected inverseTriangleTransform(x: number, y: number) {
        x /= ConformalEstimate.ARC;
        y /= ConformalEstimate.ARC;

        x += 0.5;
        y += ConformalEstimate.ROOT3 / 6;

        const c = this.inverse.getInterpolatedVector(x, y);

        return super.inverseTriangleTransform(c[0], c[1]);
    }

    public metersPerUnit(): number {
        return (40075017 / (2 * Math.PI)) / this.VECTOR_SCALE_FACTOR;
    }
}
