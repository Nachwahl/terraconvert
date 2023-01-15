import GeographicProjection from "./GeographicProjection";


export abstract class ProjectionTransform extends GeographicProjection {
    protected input: GeographicProjection;

    protected constructor(input: GeographicProjection)
    {
        super();
        this.input = input;
    }

    public upright(): boolean {
        return this.input.upright();
    }

    public bounds(): number[] {
        return this.input.bounds();
    }

    public metersPerUnit(): number {
        return this.input.metersPerUnit();
    }
}

