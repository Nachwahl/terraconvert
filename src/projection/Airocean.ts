import GeographicProjection from "./GeographicProjection";

export class Airocean extends GeographicProjection {
    protected static ARC: number = 2 * Math.asin(Math.sqrt(5 - Math.sqrt(5)) / Math.sqrt(10));

    protected static readonly TO_RADIANS: number = Math.PI / 180;
    protected static readonly ROOT3: number = Math.sqrt(3);

    private readonly newton: number = 5;

    protected static VERT: number[] = [
        10.536199, 64.700000,
        -5.245390, 2.300882,
        58.157706, 10.447378,
        122.300000, 39.100000,
        -143.478490, 50.103201,
        -67.132330, 23.717925,
        36.521510, -50.103200,
        112.867673, -23.717930,
        174.754610, -2.300882,
        -121.842290, -10.447350,
        -57.700000, -39.100000,
        -169.463800, -64.700000,
    ];

    protected static readonly ISO: number[] = [
        2, 1, 6,
        1, 0, 2,
        0, 1, 5,
        1, 5, 10,
        1, 6, 10,
        7, 2, 6,
        2, 3, 7,
        3, 0, 2,
        0, 3, 4,
        4, 0, 5, // 9, qubec
        5, 4, 9,
        9, 5, 10,
        10, 9, 11,
        11, 6, 10,
        6, 7, 11,
        8, 3, 7,
        8, 3, 4,
        8, 4, 9,
        9, 8, 11,
        7, 8, 11,
        11, 6, 7, // child of 14
        3, 7, 8, // child of 15
    ];

    public static CENTER_MAP: number[] = [
        -3, 7,
        -2, 5,
        -1, 7,
        2, 5,
        4, 5,
        -4, 1,
        -3, -1,
        -2, 1,
        -1, -1,
        0, 1,
        1, -1,
        2, 1,
        3, -1,
        4, 1,
        5, -1, // 14, left side, right to be cut
        -3, -5,
        -1, -5,
        1, -5,
        2, -7,
        -4, -7,
        -5, -5, // 20, pseudo triangle, child of 14
        -2, -7, // 21 , pseudo triangle, child of 15
    ];

    public static FLIP_TRIANGLE: number[] = [
        1, 0, 1, 0, 0,
        1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
        1, 1, 1, 0, 0,
        1, 0,
    ];

    protected static readonly CENTROID: number[] = new Array(66);
    protected static readonly ROTATION_MATRIX: number[] = new Array(198);
    protected static readonly INVERSE_ROTATION_MATRIX: number[] = new Array(198);

    static {

        for (let i = 0; i < 22; i++) {
            Airocean.CENTER_MAP[2 * i] *= 0.5 * Airocean.ARC;
            Airocean.CENTER_MAP[2 * i + 1] *= Airocean.ARC * Airocean.ROOT3 / 12;
        }
    }

    static {

        for (let i = 0; i < 12; i++) {
            Airocean.VERT[2 * i + 1] = 90 - Airocean.VERT[2 * i + 1];

            Airocean.VERT[2 * i] *= Airocean.TO_RADIANS;
            Airocean.VERT[2 * i + 1] *= Airocean.TO_RADIANS;
        }

        for (let i = 0; i < 22; i++) {
            const a: number[] = Airocean.cart(Airocean.VERT[2 * Airocean.ISO[i * 3]], Airocean.VERT[2 * Airocean.ISO[i * 3] + 1]);
            const b: number[] = Airocean.cart(Airocean.VERT[2 * Airocean.ISO[i * 3 + 1]], Airocean.VERT[2 * Airocean.ISO[i * 3 + 1] + 1]);
            const c: number[] = Airocean.cart(Airocean.VERT[2 * Airocean.ISO[i * 3 + 2]], Airocean.VERT[2 * Airocean.ISO[i * 3 + 2] + 1]);

            const xsum: number = a[0] + b[0] + c[0];
            const ysum: number = a[1] + b[1] + c[1];
            const zsum: number = a[2] + b[2] + c[2];

            const mag: number = Math.sqrt(xsum * xsum + ysum * ysum + zsum * zsum);

            Airocean.CENTROID[3 * i] = xsum / mag;
            Airocean.CENTROID[3 * i + 1] = ysum / mag;
            Airocean.CENTROID[3 * i + 2] = zsum / mag;

            const clon: number = Math.atan2(ysum, xsum);
            const clat: number = Math.atan2(Math.sqrt(xsum * xsum + ysum * ysum), zsum);

            let v: number[] = [Airocean.VERT[2 * Airocean.ISO[i * 3]], Airocean.VERT[2 * Airocean.ISO[i * 3] + 1]];
            v = Airocean.yRot(v[0] - clon, v[1], -clat);

            Airocean.produceZYZRotationMatrix(Airocean.ROTATION_MATRIX, i * 9, -clon, -clat, (Math.PI / 2) - v[0]);
            Airocean.produceZYZRotationMatrix(Airocean.INVERSE_ROTATION_MATRIX, i * 9, v[0] - (Math.PI / 2), clat, clon);
        }
    }

    protected static cart(lambda: number, phi: number) {
        const sinphi: number = Math.sin(phi);
        return [sinphi * Math.cos(lambda), sinphi * Math.sin(lambda), Math.cos(phi)];
    }

    static yRot(lambda: number, phi: number, rot: number) {
        const c: number[] = this.cart(lambda, phi);

        const x: number = c[0];
        c[0] = c[2] * Math.sin(rot) + x * Math.cos(rot);
        c[2] = c[2] * Math.cos(rot) - x * Math.sin(rot);

        const mag: number = Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]);
        c[0] /= mag;
        c[1] /= mag;
        c[2] /= mag;
        return [
            Math.atan2(c[1], c[0]),
            Math.atan2(Math.sqrt(c[0] * c[0] + c[1] * c[1]), c[2])
        ]
    }

    public static produceZYZRotationMatrix(out: number[], offset: number, a: number, b: number, c: number) {
        const sina: number = Math.sin(a)
        const cosa: number = Math.cos(a)
        const sinb: number = Math.sin(b)
        const cosb: number = Math.cos(b)
        const sinc: number = Math.sin(c)
        const cosc: number = Math.cos(c)

        out[offset] = cosa * cosb * cosc - sinc * sina;
        out[offset + 1] = -sina * cosb * cosc - sinc * cosa;
        out[offset + 2] = cosc * sinb;

        out[offset + 3] = sinc * cosb * cosa + cosc * sina;
        out[offset + 4] = cosc * cosa - sinc * cosb * sina;
        out[offset + 5] = sinc * sinb;

        out[offset + 6] = -sinb * cosa;
        out[offset + 7] = sinb * sina;
        out[offset + 8] = cosb;
    }

    protected static findTriangle(x: number, y: number, z: number): number {
        let min: number = Number.MAX_VALUE;
        let face: number = 0;

        for (let i = 0; i < 20; i++) {
            const xd: number = Airocean.CENTROID[3 * i] - x;
            const yd: number = Airocean.CENTROID[3 * i + 1] - y;
            const zd: number = Airocean.CENTROID[3 * i + 2] - z;

            const dissq: number = xd * xd + yd * yd + zd * zd;
            if (dissq < min) {

                if (dissq < 0.1)
                    return i;

                face = i;
                min = dissq;
            }
        }
        return face;
    }

    protected static findMapTriangle(x: number, y: number): number {
        let min: number = Number.MAX_VALUE;
        let face: number = 0;

        for (let i = 0; i < 20; i++) {
            const xd: number = Airocean.CENTER_MAP[2 * i] - x;
            const yd: number = Airocean.CENTER_MAP[2 * i + 1] - y;

            const dissq: number = xd * xd + yd * yd;
            if (dissq < min) {
                face = i;
                min = dissq;
            }
        }
        return face;
    }

    protected static readonly FACE_ON_GRID: number[] = [
        -1, -1, 0, 1, 2, -1, -1, 3, -1, 4, -1,
        -1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        20, 19, 15, 21, 16, -1, 17, 18, -1, -1, -1,
    ];

    protected static findTriangleGrid(x: number, y: number) {
        const xp = x / Airocean.ARC;
        let yp = y / (Airocean.ARC * Airocean.ROOT3);

        let row;

        if (yp > -0.25) {
            if (yp < 0.25) { // middle
                row = 1;
            } else if (yp <= 0.75) { // top
                row = 0;
                yp = 0.5 - yp; // translate to middle and flip
            } else return -1;
        } else if (yp >= -0.75) { // bottom
            row = 2;
            yp = -yp - 0.5; // translate to middle and flip
        } else return -1;

        yp += 0.25; // change origin to vertex 4, to allow grids to align

        // rotate coords 45 degrees so left and right sides of the triangle become the x/y axies (also side lengths are now 1)
        const xr = xp - yp;
        const yr = xp + yp;

        const gx = Math.trunc(Math.floor(xr));
        const gy = Math.trunc(Math.floor(yr));

        const col = 2 * gx + (gy !== gx ? 1 : 0) + 6;

        if (col < 0 || col >= 11)
            return -1;

        return Airocean.FACE_ON_GRID[row * 11 + col];
    }


    protected static readonly Z: number = Math.sqrt(5 + 2 * Math.sqrt(5)) / Math.sqrt(15);
    protected static readonly EL: number = Math.sqrt(8) / Math.sqrt(5 + Math.sqrt(5));
    protected static readonly EL6: number = Airocean.EL / 6;
    protected static readonly DVE: number = Math.sqrt(3 + Math.sqrt(5)) / Math.sqrt(5 + Math.sqrt(5));
    protected static readonly R: number = -3 * Airocean.EL6 / Airocean.DVE;

    protected triangleTransform(x: number, y: number, z: number): number[] {
        const S: number = Airocean.Z / z;

        const xp: number = S * x;
        const yp: number = S * y;

        const a: number = Math.atan((2 * yp / Airocean.ROOT3 - Airocean.EL6) / Airocean.DVE); // ARC/2 terms cancel
        const b: number = Math.atan((xp - yp / Airocean.ROOT3 - Airocean.EL6) / Airocean.DVE);
        const c: number = Math.atan((-xp - yp / Airocean.ROOT3 - Airocean.EL6) / Airocean.DVE);

        return [0.5 * (b - c), (2 * a - b - c) / (2 * Airocean.ROOT3)]
    }

    protected inverseTriangleTransformNewton(xpp: number, ypp: number): number[] {
        const tanaoff = Math.tan(Airocean.ROOT3 * ypp + xpp);
        const tanboff = Math.tan(2 * xpp);

        const anumer = tanaoff * tanaoff + 1;
        const bnumer = tanboff * tanboff + 1;

        let tana = tanaoff;
        let tanb = tanboff;
        let tanc = 0;

        let adenom = 1;
        let bdenom = 1;

        for (let i = 0; i < this.newton; i++) {
            const f = tana + tanb + tanc - Airocean.R; // R = tana + tanb + tanc
            const fp = anumer * adenom * adenom + bnumer * bdenom * bdenom + 1; // derivative relative to tanc

            tanc -= f / fp;

            adenom = 1 / (1 - tanc * tanaoff);
            bdenom = 1 / (1 - tanc * tanboff);

            tana = (tanc + tanaoff) * adenom;
            tanb = (tanc + tanboff) * bdenom;
        }

        const yp = Airocean.ROOT3 * (Airocean.DVE * tana + Airocean.EL6) / 2;
        const xp = Airocean.DVE * tanb + yp / Airocean.ROOT3 + Airocean.EL6;

        // x = z*xp/Z, y = z*yp/Z, x^2 + y^2 + z^2 = 1
        const xpoZ = xp / Airocean.Z;
        const ypoZ = yp / Airocean.Z;

        const z = 1 / Math.sqrt(1 + xpoZ * xpoZ + ypoZ * ypoZ);

        return [z * xpoZ, z * ypoZ, z];
    }

    protected inverseTriangleTransform(x: number, y: number): number[] {
        return this.inverseTriangleTransformNewton(x, y);
    }

    public fromGeo(lon: number, lat: number): number[] {
        lat = 90 - lat;
        lon *= Airocean.TO_RADIANS;
        lat *= Airocean.TO_RADIANS;

        const sinphi = Math.sin(lat);

        let x = Math.cos(lon) * sinphi;
        const y = Math.sin(lon) * sinphi;
        const z = Math.cos(lat);

        let face = Airocean.findTriangle(x, y, z);

        const off = 9 * face;
        const xp = x * Airocean.ROTATION_MATRIX[off] + y * Airocean.ROTATION_MATRIX[off + 1] + z * Airocean.ROTATION_MATRIX[off + 2];
        const yp = x * Airocean.ROTATION_MATRIX[off + 3] + y * Airocean.ROTATION_MATRIX[off + 4] + z * Airocean.ROTATION_MATRIX[off + 5];
        const zp = x * Airocean.ROTATION_MATRIX[off + 6] + y * Airocean.ROTATION_MATRIX[off + 7] + z * Airocean.ROTATION_MATRIX[off + 8];

        const out = this.triangleTransform(xp, yp, zp);

        if (Airocean.FLIP_TRIANGLE[face] !== 0) {
            out[0] = -out[0];
            out[1] = -out[1];
        }

        x = out[0];

        if (((face === 15 && x > out[1] * Airocean.ROOT3) || face === 14) && x > 0) {
            out[0] = 0.5 * x - 0.5 * Airocean.ROOT3 * out[1];
            out[1] = 0.5 * Airocean.ROOT3 * x + 0.5 * out[1];
            face += 6; // shift 14->20 & 15->21
        }

        out[0] += Airocean.CENTER_MAP[face * 2];
        out[1] += Airocean.CENTER_MAP[face * 2 + 1];

        return out;
    }


    public static OUT_OF_BOUNDS: number[] = [0.0 / 0, 0.0 / 0];

    public toGeo(x: number, y: number): number[] {
        const face = Airocean.findTriangleGrid(x, y);

        if (face === -1)
            return Airocean.OUT_OF_BOUNDS;

        x -= Airocean.CENTER_MAP[face * 2];
        y -= Airocean.CENTER_MAP[face * 2 + 1];

        switch (face) {
            case 14:
                if (x > 0) return Airocean.OUT_OF_BOUNDS;
                break;

            case 20:
                if (-y * Airocean.ROOT3 > x) return Airocean.OUT_OF_BOUNDS;
                break;

            case 15:
                if (x > 0 && x > y * Airocean.ROOT3) return Airocean.OUT_OF_BOUNDS;
                break;

            case 21:
                if (x < 0 || -y * Airocean.ROOT3 > x) return Airocean.OUT_OF_BOUNDS;
                break;
        }

        if (Airocean.FLIP_TRIANGLE[face] !== 0) {
            x = -x;
            y = -y;
        }

        const c = this.inverseTriangleTransform(x, y);
        x = c[0];
        y = c[1];
        const z = c[2];

        const off = 9 * face;
        const xp = x * Airocean.INVERSE_ROTATION_MATRIX[off] + y * Airocean.INVERSE_ROTATION_MATRIX[off + 1] + z * Airocean.INVERSE_ROTATION_MATRIX[off + 2];
        const yp = x * Airocean.INVERSE_ROTATION_MATRIX[off + 3] + y * Airocean.INVERSE_ROTATION_MATRIX[off + 4] + z * Airocean.INVERSE_ROTATION_MATRIX[off + 5];
        const zp = x * Airocean.INVERSE_ROTATION_MATRIX[off + 6] + y * Airocean.INVERSE_ROTATION_MATRIX[off + 7] + z * Airocean.INVERSE_ROTATION_MATRIX[off + 8];

        return [Math.atan2(yp, xp)/Airocean.TO_RADIANS, 90-Math.acos(zp)/Airocean.TO_RADIANS]

    }

}
