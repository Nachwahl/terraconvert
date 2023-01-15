export class InvertableVectorField {
    protected VECTOR_X: number[][];
    protected VECTOR_Y: number[][];

    protected static ROOT3: number = Math.sqrt(3);

    public sideLength: number;

    constructor(vx: number[][], vy: number[][]) {
        this.sideLength = vx.length - 1;
        this.VECTOR_X = vx;
        this.VECTOR_Y = vy;
    }

    public getInterpolatedVector(x: number, y: number): number[] {
        // scale up triangle to be triangleSize across
        x *= this.sideLength;
        y *= this.sideLength;

        // convert to triangle units
        const v: number = 2 * y / InvertableVectorField.ROOT3;
        const u: number = x - v * 0.5;

        let u1: number = Math.trunc(u);
        let v1: number = Math.trunc(v);

        if (u1 < 0) u1 = 0;
        else if (u1 >= this.sideLength) u1 = this.sideLength - 1;

        if (v1 < 0) v1 = 0;
        else if (v1 >= this.sideLength - u1) v1 = this.sideLength - u1 - 1;

        let valx1: number;
        let valy1: number;
        let valx2: number;
        let valy2: number;
        let valx3: number;
        let valy3: number;

        let y3: number;
        let x3: number;

        let flip: number = 1;

        if (y < -InvertableVectorField.ROOT3 * (x - u1 - v1 - 1) || v1 === this.sideLength - u1 - 1) {
            valx1 = (this.VECTOR_X)[u1][v1];
            valy1 = (this.VECTOR_Y)[u1][v1];
            valx2 = (this.VECTOR_X)[u1][v1 + 1];
            valy2 = (this.VECTOR_Y)[u1][v1 + 1];
            valx3 = (this.VECTOR_X)[u1 + 1][v1];
            valy3 = (this.VECTOR_Y)[u1 + 1][v1];

            y3 = 0.5 * InvertableVectorField.ROOT3 * v1;
            x3 = (u1 + 1) + 0.5 * v1;
        } else {
            valx1 = this.VECTOR_X[u1][v1 + 1];
            valy1 = this.VECTOR_Y[u1][v1 + 1];
            valx2 = this.VECTOR_X[u1 + 1][v1];
            valy2 = this.VECTOR_Y[u1 + 1][v1];
            valx3 = this.VECTOR_X[u1 + 1][v1 + 1];
            valy3 = this.VECTOR_Y[u1 + 1][v1 + 1];

            flip = -1;
            y = -y;

            y3 = -(0.5 * InvertableVectorField.ROOT3 * (v1 + 1));
            x3 = (u1 + 1) + 0.5 * (v1 + 1);
        }
        const w1: number = -(y - y3) / InvertableVectorField.ROOT3 - (x - x3);
        const w2: number = 2 * (y - y3) / InvertableVectorField.ROOT3;
        const w3: number = 1 - w1 - w2;

        return [
            valx1 * w1 + valx2 * w2 + valx3 * w3, valy1 * w1 + valy2 * w2 + valy3 * w3,
            (valx3 - valx1) * this.sideLength, this.sideLength * flip * (2 * valx2 - valx1 - valx3) / InvertableVectorField.ROOT3,
            (valy3 - valy1) * this.sideLength, this.sideLength * flip * (2 * valy2 - valy1 - valy3) / InvertableVectorField.ROOT3
        ]
    }

    public applyNewtonsMethod(expectedf: number, expectedg: number, xest: number, yest: number, iter: number): number[] {
        for(let i=0; i<iter; i++) {
            const c: number[] = this.getInterpolatedVector(xest, yest);

            const f: number = c[0] - expectedf;
            const g: number = c[1] - expectedg;
            const dfdx: number = c[2];
            const dfdy: number = c[3];
            const dgdx: number = c[4];
            const dgdy: number = c[5];

            const determinant: number = 1/(dfdx*dgdy - dfdy*dgdx);

            xest -= determinant*(dgdy*f - dfdy*g);
            yest -= determinant*(-dgdx*f + dfdx*g);
        }

        return [xest, yest]
    }

}
