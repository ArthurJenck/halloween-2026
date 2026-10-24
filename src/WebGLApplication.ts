import GUI from 'lil-gui'
import EyeballsManager from './EyeballsManager'

const params = {
    backgroundColor: '#570000',
}

export default class WebGLApplication {
    renderWidth: number
    renderHeight: number
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D | null
    debugger: GUI | undefined
    eyeballsManager: EyeballsManager
    pointerPosition: { x: number; y: number }

    constructor() {
        this.renderWidth = window.innerWidth
        this.renderHeight = window.innerHeight
        this.pointerPosition = {
            x: this.renderWidth / 2,
            y: this.renderHeight / 2,
        }

        this.canvas = this.getCanvas()
        this.context = this.createContext()
        this.debugger = this.createDebugger()
        this.eyeballsManager = this.createEyeballsManager()

        this.resize()
        this.setupEventListeners()

        this.tick()
    }

    getCanvas() {
        const canvas = document.querySelector(
            'canvas#canvas'
        ) as HTMLCanvasElement
        return canvas
    }

    createContext() {
        const context = this.canvas.getContext('2d')

        return context
    }

    resize() {
        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2,
            Math.sqrt(4_000_000 / (this.renderWidth * this.renderHeight))
        )

        this.canvas.style.width = `${this.renderWidth}px`
        this.canvas.style.height = `${this.renderHeight}px`
        this.canvas.width = Math.max(
            1,
            Math.round(this.renderWidth * pixelRatio)
        )
        this.canvas.height = Math.max(
            1,
            Math.round(this.renderHeight * pixelRatio)
        )
        this.context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        this.eyeballsManager.resize(this.renderWidth, this.renderHeight)
    }

    createEyeballsManager() {
        const eyeballsManager = new EyeballsManager(
            this.context,
            this.debugger,
            {
                x: this.renderWidth / 2,
                y: this.renderHeight / 2,
            }
        )
        return eyeballsManager
    }

    render() {
        if (!this.context) return

        this.context.clearRect(0, 0, this.renderWidth, this.renderHeight)
        this.context.fillStyle = params.backgroundColor
        this.context.fillRect(0, 0, this.renderWidth, this.renderHeight)
        this.eyeballsManager.tick(performance.now() / 1000)
    }

    /**
     * Events
     */
    setupEventListeners() {
        window.addEventListener('resize', this.resizeHandler.bind(this))
        window.addEventListener(
            'pointerdown',
            this.pointerMoveHandler.bind(this)
        )
        window.addEventListener(
            'pointermove',
            this.pointerMoveHandler.bind(this)
        )
    }

    resizeHandler() {
        this.renderWidth = window.innerWidth
        this.renderHeight = window.innerHeight

        this.resize()
    }

    pointerMoveHandler(e: PointerEvent) {
        this.pointerPosition.x = e.clientX
        this.pointerPosition.y = e.clientY

        this.eyeballsManager.setLookTarget({ x: e.clientX, y: e.clientY })
    }

    tick() {
        requestAnimationFrame(this.tick.bind(this))
        this.render()
    }

    /**
     * Debug
     */
    createDebugger() {
        const gui = new GUI().close()
        gui.addColor(params, 'backgroundColor').name('backgroundColor')

        return gui
    }
}
