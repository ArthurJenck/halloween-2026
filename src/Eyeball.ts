import { createNoise2D } from 'simplex-noise'

type EyeballParams = {
    irisMotionFactor: number
    irisMaxOffset: number
    irisMinSize: number
    irisMaxSize: number
    irisGrowthDistance: number
    middlePartMotionFactor: number
    eyeMinSize: number
    eyeMaxSize: number
    eyeGrowthDistance: number
    trembleIdleAmplitude: number
    trembleNearAmplitude: number
    trembleRadius: number
    trembleMinSpeed: number
    trembleMaxSpeed: number
    idleLookTrembleAmplitude: number
    accentColor: string
}

export default class Eyeball {
    context: CanvasRenderingContext2D | null
    params: EyeballParams
    coords: { x: number; y: number }
    noise2D = createNoise2D()
    noiseTime = 0
    lastDrawTime: number | null = null

    constructor(
        context: CanvasRenderingContext2D | null,
        params: EyeballParams,
        coords: { x: number; y: number }
    ) {
        this.context = context
        this.params = params

        this.coords = coords
    }

    getTrembleCenter(distance: number, time: number, idleBlend: number) {
        const near = Math.max(0, 1 - distance / this.params.trembleRadius)
        const proximity = near * near * (3 - 2 * near)
        const amplitude =
            (this.params.trembleIdleAmplitude +
                this.params.trembleNearAmplitude * proximity) *
                (1 - idleBlend) +
            this.params.idleLookTrembleAmplitude * idleBlend
        const speed =
            this.params.trembleMinSpeed +
            (this.params.trembleMaxSpeed - this.params.trembleMinSpeed) *
                proximity *
                (1 - idleBlend)

        if (this.lastDrawTime !== null) {
            const deltaTime = Math.max(0, Math.min(time - this.lastDrawTime, 0.05))
            this.noiseTime += deltaTime * speed
        }
        this.lastDrawTime = time

        return {
            x: this.coords.x + this.noise2D(this.noiseTime, 0) * amplitude,
            y: this.coords.y + this.noise2D(this.noiseTime, 100) * amplitude,
        }
    }

    getScale(distance: number) {
        const proximity = Math.max(0, 1 - distance / this.params.eyeGrowthDistance)
        return (
            this.params.eyeMinSize +
            (this.params.eyeMaxSize - this.params.eyeMinSize) * proximity
        )
    }

    getIrisOffset(dx: number, dy: number, distance: number) {
        const offset = Math.min(
            distance * this.params.irisMotionFactor,
            this.params.irisMaxOffset
        )
        return {
            x: distance ? (dx / distance) * offset : 0,
            y: distance ? (dy / distance) * offset : 0,
        }
    }

    getIrisSize(distance: number) {
        const proximity = Math.max(
            0,
            1 - distance / this.params.irisGrowthDistance
        )
        return (
            this.params.irisMinSize +
            (this.params.irisMaxSize - this.params.irisMinSize) * proximity
        )
    }

    createGradient(
        context: CanvasRenderingContext2D,
        center: { x: number; y: number },
        irisOffset: { x: number; y: number },
        irisSize: number
    ) {
        const gradient = context.createRadialGradient(
            center.x + irisOffset.x * this.params.middlePartMotionFactor,
            center.y + irisOffset.y * this.params.middlePartMotionFactor,
            irisSize,
            center.x + irisOffset.x,
            center.y + irisOffset.y,
            15
        )
        gradient.addColorStop(0.4, 'white')
        gradient.addColorStop(0.41, this.params.accentColor)
        gradient.addColorStop(0.94, this.params.accentColor)
        gradient.addColorStop(0.95, 'black')

        return gradient
    }

    draw(lookTarget: { x: number; y: number }, time: number, idleBlend: number) {
        const context = this.context
        if (!context) return

        const dx = lookTarget.x - this.coords.x
        const dy = lookTarget.y - this.coords.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const pointerBlend = 1 - idleBlend
        const center = this.getTrembleCenter(distance, time, idleBlend)
        const scale =
            this.getScale(distance) * pointerBlend +
            this.params.eyeMinSize * idleBlend
        const irisOffset = this.getIrisOffset(dx, dy, distance)
        irisOffset.x *= pointerBlend
        irisOffset.y *= pointerBlend
        const irisSize =
            this.getIrisSize(distance) * pointerBlend +
            this.params.irisMinSize * idleBlend

        context.fillStyle = this.createGradient(
            context,
            center,
            irisOffset,
            irisSize
        )
        context.beginPath()
        context.arc(center.x, center.y, scale, 0, 2 * Math.PI)
        context.fill()
    }
}
