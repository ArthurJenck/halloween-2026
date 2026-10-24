import type GUI from 'lil-gui'
import Eyeball from './Eyeball'

const params = {
    irisMotionFactor: 0.12,
    irisMaxOffset: 25,
    middlePartMotionFactor: 0.2,
    eyeMinSize: 50,
    eyeMaxSize: 75,
    eyeGrowthDistance: 200,
    trembleIdleAmplitude: 2,
    trembleNearAmplitude: 9,
    trembleRadius: 250,
    trembleMinSpeed: 6,
    trembleMaxSpeed: 12,
    accentColor: '#ff0000',
}

export default class EyeballsManager {
    context: CanvasRenderingContext2D | null
    gui: GUI | undefined
    eyeballs: Eyeball[]
    lookTarget: { x: number; y: number }
    debugFolder: GUI | undefined

    constructor(
        context: CanvasRenderingContext2D | null,
        gui: GUI | undefined,
        initialTarget: { x: number; y: number }
    ) {
        this.context = context
        this.gui = gui
        this.lookTarget = { ...initialTarget }

        this.eyeballs = []

        this.debugFolder = this.createDebugFolder()

        this.createEyeball()
    }

    createEyeball() {
        const eyeball = new Eyeball(this.context, params, {
            x: 100,
            y: 100,
        })
        this.eyeballs.push(eyeball)

        return eyeball
    }

    setLookTarget(target: { x: number; y: number }) {
        this.lookTarget.x = target.x
        this.lookTarget.y = target.y
    }

    tick(time: number) {
        this.eyeballs.forEach((eyeball) => eyeball.draw(this.lookTarget, time))
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.gui) return
        const eyeballsFolder = this.gui.addFolder('Eyeballs')
        eyeballsFolder.add(params, 'irisMotionFactor', 0, 0.5, 0.01)
        eyeballsFolder.add(params, 'irisMaxOffset', 0, 50, 1)
        eyeballsFolder.add(params, 'middlePartMotionFactor', 0, 1, 0.01)
        eyeballsFolder.add(params, 'eyeMinSize', 10, 100, 1)
        eyeballsFolder.add(params, 'eyeMaxSize', 20, 400, 1)
        eyeballsFolder.add(params, 'eyeGrowthDistance', 100, 800, 1)
        eyeballsFolder.add(params, 'trembleIdleAmplitude', 0, 10, 0.1)
        eyeballsFolder.add(params, 'trembleNearAmplitude', 0, 30, 0.1)
        eyeballsFolder.add(params, 'trembleRadius', 1, 800, 1)
        eyeballsFolder.add(params, 'trembleMinSpeed', 0, 20, 0.1)
        eyeballsFolder.add(params, 'trembleMaxSpeed', 0, 20, 0.1)
        eyeballsFolder.addColor(params, 'accentColor')

        return eyeballsFolder
    }
}
