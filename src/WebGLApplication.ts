import GUI from 'lil-gui'
import EyeballsManager from './EyeballsManager'

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
        this.canvas.width = this.renderWidth
        this.canvas.height = this.renderHeight
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
        this.context.fillStyle = '#141414'
        this.context.fillRect(0, 0, this.renderWidth, this.renderHeight)
        this.eyeballsManager.tick(performance.now() / 1000)
    }

    /**
     * Events
     */
    setupEventListeners() {
        window.addEventListener('resize', this.resizeHandler.bind(this))
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

    pointerMoveHandler(e: MouseEvent) {
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
        if (import.meta.env.PROD) return
        const gui = new GUI()

        return gui
    }
}
