import type { Layer } from 'konva/lib/Layer'
import type { Stage } from 'konva/lib/Stage'
import type { STATE } from 'src/state/state'
import { resolve, isAbsolute } from 'pathe'

export type Konva = typeof import('konva').default
export class ImageSDK {
    static init = async (st: STATE) => {
        const t = await import('konva')
        return new ImageSDK(st, t.default)
    }

    Stage: Konva['Stage']
    Layer: Konva['Layer']
    Image: Konva['Image']
    Text: Konva['Text']
    Rect: Konva['Rect']

    private constructor(
        //
        public st: STATE,
        public Konva: Konva,
    ) {
        this.Stage = Konva.Stage
        this.Layer = Konva.Layer
        this.Image = Konva.Image
        this.Text = Konva.Text
        this.Rect = Konva.Rect
    }

    fillFullLayerWithGradient = (
        //
        stage: Stage,
        layer: Layer,
        color: Array<number | string>,
    ) => {
        layer.add(
            new this.Rect({
                x: 0,
                y: 0,
                width: stage.width(),
                height: stage.height(),
                fillLinearGradientStartPoint: { x: 0, y: 0 },
                fillLinearGradientEndPoint: { x: stage.width(), y: stage.height() },
                fillLinearGradientColorStops: color,
                listening: false,
            }),
        )
    }

    getHTMLImage_fromPath(
        /** the same `src` value you would use in an <img /> html node */
        path: string,
    ): Promise<HTMLImageElement> {
        return new Promise((yes, no) => {
            const abspath = isAbsolute(path) //
                ? path
                : resolve(this.st.rootPath, path)
            const img = new Image()
            img.onload = () => yes(img)
            img.onerror = no
            img.src = 'file://' + abspath
        })
    }

    getHTMLImage_fromURL(
        /** the same `src` value you would use in an <img /> html node */
        src: string,
    ): Promise<HTMLImageElement> {
        return new Promise((yes, no) => {
            const img = new Image()
            img.onload = () => yes(img)
            img.onerror = no
            img.src = src
        })
    }

    /**
     * @deprecated
     * use `getHTMLImage_fromURL` instead
     * */
    loadImage = this.getHTMLImage_fromURL

    createContainer = (): HTMLDivElement => {
        const container: HTMLDivElement =
            (document.getElementById('konvaPreview') as Maybe<HTMLDivElement>) ?? //
            document.createElement('div')
        return container
    }

    createContainerDebug = (): HTMLDivElement => {
        const container = this.createContainer()
        container.style.width = '300px'
        container.id = 'konvaPreview'
        container.style.height = '450px'
        // container.style.backgroundColor = 'red'
        container.style.zIndex = '99999999'
        container.style.border = '1px solid red'

        // make absolute
        container.style.position = 'absolute'
        container.style.top = '10px'
        container.style.left = '10px'
        // mount to body
        document.body.appendChild(container)
        return container
    }
}
