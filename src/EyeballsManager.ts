import type GUI from 'lil-gui'
import { createNoise2D } from 'simplex-noise'
import Eyeball from './Eyeball'

const params = {
    cellSize: 92,
    gridJitterAmplitude: 50,
    gridNoiseScale: 0.8,
    irisMotionFactor: 0.12,
    irisMaxOffset: 25,
    irisMinSize: 40,
    irisMaxSize: 67,
    irisGrowthDistance: 200,
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
    gridNoise2D = createNoise2D()
    width: number
    height: number

    constructor(
        context: CanvasRenderingContext2D | null,
        gui: GUI | undefined,
        initialTarget: { x: number; y: number }
    ) {
        this.context = context
        this.gui = gui
        this.lookTarget = { ...initialTarget }

        this.eyeballs = []
        this.width = 0
        this.height = 0

        this.createDebugFolder()
    }

    createEyeball(x: number, y: number) {
        const eyeball = new Eyeball(this.context, params, {
            x,
            y,
        })
        this.eyeballs.push(eyeball)

        return eyeball
    }

    resize(width: number, height: number) {
        this.width = width
        this.height = height
        this.eyeballs = []

        const columns = Math.ceil(width / params.cellSize)
        const rows = Math.ceil(height / params.cellSize)
        const offsetX = (width - columns * params.cellSize) / 2
        const offsetY = (height - rows * params.cellSize) / 2

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const noiseX = column * params.gridNoiseScale
                const noiseY = row * params.gridNoiseScale
                this.createEyeball(
                    offsetX +
                        (column + 0.5) * params.cellSize +
                        this.gridNoise2D(noiseX, noiseY) *
                            params.gridJitterAmplitude,
                    offsetY +
                        (row + 0.5) * params.cellSize +
                        this.gridNoise2D(noiseX + 100, noiseY + 100) *
                            params.gridJitterAmplitude
                )
            }
        }
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
        const gridFolder = this.gui.addFolder('Grid')
        gridFolder
            .add(params, 'cellSize', 50, 300, 1)
            .onChange(() => this.resize(this.width, this.height))
        gridFolder
            .add(params, 'gridJitterAmplitude', 0, 250, 1)
            .onChange(() => this.resize(this.width, this.height))
        gridFolder
            .add(params, 'gridNoiseScale', 0.05, 2, 0.01)
            .onChange(() => this.resize(this.width, this.height))

        const eyeballsFolder = this.gui.addFolder('Eyeballs')
        eyeballsFolder.add(params, 'irisMotionFactor', 0, 0.5, 0.01)
        eyeballsFolder.add(params, 'irisMaxOffset', 0, 50, 1)
        eyeballsFolder.add(params, 'irisMinSize', 20, 100, 1)
        eyeballsFolder.add(params, 'irisMaxSize', 20, 150, 1)
        eyeballsFolder.add(params, 'irisGrowthDistance', 100, 800, 1)
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
    }
}
