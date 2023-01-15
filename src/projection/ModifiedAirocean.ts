import {ConformalEstimate} from "./ConformalEstimate";
import {Airocean} from "./Airocean";

export class ModifiedAirocean extends ConformalEstimate {
    protected static THETA = -150 * ModifiedAirocean.TO_RADIANS;
    protected static SIN_THETA = Math.sin(ModifiedAirocean.THETA);
    protected static COS_THETA = Math.cos(ModifiedAirocean.THETA);

    public fromGeo(lon: number, lat: number): number[] {
        const c: number[] = super.fromGeo(lon, lat);
        let x: number = c[0];
        let y: number = c[1];

        const easia = this.isEurasianPart(x, y);

        y -= 0.75 * ModifiedAirocean.ARC * ModifiedAirocean.ROOT3;

        if (easia) {
            x += ModifiedAirocean.ARC;

            const t = x;
            x = ModifiedAirocean.COS_THETA * x - ModifiedAirocean.SIN_THETA * y;
            y = ModifiedAirocean.SIN_THETA * t + ModifiedAirocean.COS_THETA * y;

        } else {
            x -= ModifiedAirocean.ARC;
        }

        c[0] = y;
        c[1] = -x;
        return c;
    }

    public toGeo(x: number, y: number): number[] {
        let easia: boolean;
        if (y < 0) easia = x > 0;
        else if (y > ModifiedAirocean.ARC / 2) easia = x > -ModifiedAirocean.ROOT3 * ModifiedAirocean.ARC / 2;
        else easia = y * -ModifiedAirocean.ROOT3 < x;

        let t = x;
        x = -y;
        y = t;

        if (easia) {
            t = x;
            x = ModifiedAirocean.COS_THETA * x + ModifiedAirocean.SIN_THETA * y;
            y = ModifiedAirocean.COS_THETA * y - ModifiedAirocean.SIN_THETA * t;
            x -= ModifiedAirocean.ARC;

        } else {
            x += ModifiedAirocean.ARC;
        }

        y += 0.75 * ModifiedAirocean.ARC * ModifiedAirocean.ROOT3;

        // check to make sure still in right part
        if (easia !== this.isEurasianPart(x, y))
            return Airocean.OUT_OF_BOUNDS;

        return super.toGeo(x, y);

    }

    protected static BERING_X = -0.3420420960118339;// -0.3282152608138795;
    protected static BERING_Y = -0.322211064085279;// -0.3281491467713469;
    protected static ARCTIC_Y = -0.2;// -0.3281491467713469;

    protected static ARCTIC_M = (ModifiedAirocean.ARCTIC_Y - ModifiedAirocean.ROOT3 * ModifiedAirocean.ARC / 4) / (ModifiedAirocean.BERING_X - -0.5 * ModifiedAirocean.ARC);
    protected static ARCTIC_B = ModifiedAirocean.ARCTIC_Y - ModifiedAirocean.ARCTIC_M * ModifiedAirocean.BERING_X;

    protected static ALEUTIAN_Y = -0.5000446805492526;// -0.5127463765943157;
    protected static ALEUTIAN_XL = -0.5149231279757507;// -0.4957832938238718;
    protected static ALEUTIAN_XR = -0.45;

    protected static ALEUTIAN_M = (ModifiedAirocean.BERING_Y - ModifiedAirocean.ALEUTIAN_Y) / (ModifiedAirocean.BERING_X - ModifiedAirocean.ALEUTIAN_XR);
    protected static ALEUTIAN_B = ModifiedAirocean.BERING_Y - ModifiedAirocean.ALEUTIAN_M * ModifiedAirocean.BERING_X;

    protected isEurasianPart(x: number, y: number): boolean {
        if (x > 0) return false;
        if (x < -0.5 * ModifiedAirocean.ARC) return true;

        if (y > ModifiedAirocean.ROOT3 * ModifiedAirocean.ARC / 4) // above arctic ocean
            return x < 0;

        if (y < ModifiedAirocean.ALEUTIAN_Y) // below bering sea
            return y < (ModifiedAirocean.ALEUTIAN_Y + ModifiedAirocean.ALEUTIAN_XL) - x;

        if (y > ModifiedAirocean.BERING_Y) { // boundary across arctic ocean

            if (y < ModifiedAirocean.ARCTIC_Y) return x < ModifiedAirocean.BERING_X; // in strait

            return y < ModifiedAirocean.ARCTIC_M * x + ModifiedAirocean.ARCTIC_B; // above strait
        }

        return y > ModifiedAirocean.ALEUTIAN_M * x + ModifiedAirocean.ALEUTIAN_B;
    }

    public bounds(): number[] {
        return [-1.5 * ModifiedAirocean.ARC * ModifiedAirocean.ROOT3, -1.5 * ModifiedAirocean.ARC, 3 * ModifiedAirocean.ARC, ModifiedAirocean.ROOT3 * ModifiedAirocean.ARC];
    }
}
