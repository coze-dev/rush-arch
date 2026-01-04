/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlockInfo, BlockType, EditorView } from '@codemirror/view'
import { Chunk, DirectMergeConfig, MergeView } from '@codemirror/merge'

const SVG_NS = `http://www.w3.org/2000/svg`

// @ts-expect-error ignore
class CustomMergeView extends MergeView {
  connectorsDOM: HTMLElement | undefined

  constructor(options: DirectMergeConfig) {
    super(options);
  }

  setupRevertControls() {
    if (!this.connectorsDOM) {
      const dom = document.createElement('div')
      // @ts-expect-error ignore
      this.editorDOM.insertBefore(dom, this.editorDOM.lastChild)
      dom.className = 'cm-merge-connectors'
      dom.style.cssText = 'position: relative;'
      this.connectorsDOM = dom
    } else {
      this.connectorsDOM.textContent = ""
    }
  }

  private measure() {
    // @ts-expect-error ignore
    super.measure()
    this.updateConnectors()
  }

  private updateConnectors() {
    if (!this.connectorsDOM) {
      return
    }

    const dom = this.connectorsDOM
    let next = dom.firstChild as (HTMLElement | null)
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      const top = (this.a.lineBlockAt(chunk.fromA).top + this.a.documentPadding.top) + "px"
      while (next && +(next.dataset.chunk!) < i) next = rm(next) as (HTMLElement | null)
      if (next && next.dataset.chunk! == String(i)) {
        if (next.style.top != top) next.style.top = top
        // 更新
        const svg = next.querySelector('svg')
        if (svg) {
          this.updateConnector(svg, top, parseInt(next.dataset.chunk))
        }
        next = next.nextSibling as (HTMLElement | null)
      } else {
        dom.insertBefore(this.renderRevertButton(top, i), next)
      }
    }

    while (next) next = rm(next)
  }

  renderCustomRevert() {
    const div = document.createElement('div')

    const left = div.appendChild(document.createElement('div'))
    const right = div.appendChild(document.createElement('div'))

    div.style.cssText = `position: absolute;width: 100%;display: flex;justify-content: space-between;`;

    left.innerText = '->'
    right.innerText = '<-'

    function revert(
      a: EditorView,
      b: EditorView,
      chunk: Chunk,
      reverse: boolean = false,
    ) {
      const [source, dest, srcFrom, srcTo, destFrom, destTo] = reverse
        ? [b, a, chunk.fromB, chunk.toB, chunk.fromA, chunk.toA]
        : [a, b, chunk.fromA, chunk.toA, chunk.fromB, chunk.toB]
      let insert = source.state.sliceDoc(srcFrom, Math.max(srcFrom, srcTo - 1))
      if (srcFrom != srcTo && destTo <= dest.state.doc.length) insert += source.state.lineBreak
      dest.dispatch({
        changes: {from: destFrom, to: Math.min(dest.state.doc.length, destTo), insert},
        userEvent: 'revert'
      })
    }

    left.addEventListener('mousedown', e => {
      e.stopPropagation()
      e.preventDefault()

      let target = e.target as HTMLElement | null, chunk
      while (target && !target.dataset.chunk) target = target.parentNode as HTMLElement | null

      if (target && (chunk = this.chunks[target.dataset.chunk as any])) {
        revert(
          this.a,
          this.b,
          chunk,
          false,
        )
      }
    }, false)

    right.addEventListener('mousedown', e => {
      e.stopPropagation()
      e.preventDefault()

      let target = e.target as HTMLElement | null, chunk
      while (target && !target.dataset.chunk) target = target.parentNode as HTMLElement | null

      if (target && (chunk = this.chunks[target.dataset.chunk as any])) {
        revert(
          this.a,
          this.b,
          chunk,
          true,
        )
      }
    }, false)

    return div
  }

  renderRevertButton(top: string, chunk: number) {
    const elt = this.renderCustomRevert()
    elt.style.top = top
    elt.style.cursor = 'pointer'
    elt.setAttribute("data-chunk", String(chunk))

    this.renderConnector(elt, top, chunk)

    return elt
  }

  updateConnector(svg: SVGSVGElement, top: string, i: number) {
    const connectorsDOM = this.connectorsDOM
    const pathDOM = svg.querySelector('path')

    if (!connectorsDOM || !pathDOM) {
      return
    }

    const paddingTop = this.a.documentPadding.top
    const chunk = this.chunks[i]

    let [topLeftpx, bottomLeftpx] = getTop(this.a, chunk.fromA, chunk.endA)
    let [topRightpx, bottomRightpx] = getTop(this.b, chunk.fromB, chunk.endB)

    const height = Math.abs(
      Math.max(bottomLeftpx, bottomRightpx, topLeftpx, topRightpx) - Math.min(bottomLeftpx, bottomRightpx, topLeftpx, topRightpx, parseFloat(top) - paddingTop)
    ) + 1

    topLeftpx = topLeftpx - parseFloat(top) + paddingTop
    bottomLeftpx = bottomLeftpx - parseFloat(top) + paddingTop

    topRightpx = topRightpx - parseFloat(top) + paddingTop
    bottomRightpx = bottomRightpx - parseFloat(top) + paddingTop

    const minTop = Math.min(topLeftpx, bottomLeftpx, topRightpx, bottomRightpx)

    let offset = 0
    if (minTop < 0) {
      offset = -minTop

      topLeftpx += offset
      bottomLeftpx += offset
      topRightpx += offset
      bottomRightpx += offset
    }

    const width = connectorsDOM.getBoundingClientRect().width

    svg.style.cssText = `pointer-events: none;position: absolute;top: -${offset}px;left: 0;width: ${width}px;`
    svg.setAttribute('width', width.toFixed(0))
    svg.setAttribute('height', height.toFixed(0))
    svg.setAttribute('viewBox', `0 0 ${width} ${height.toFixed(0)}`)

    pathDOM.setAttribute('d', `M 0 ${topLeftpx} C ${width/2} ${topLeftpx} ${width/2} ${topRightpx} ${width} ${topRightpx} L ${width} ${bottomRightpx} C ${width/2} ${bottomRightpx} ${width/2} ${bottomLeftpx} 0 ${bottomLeftpx} z`)
    pathDOM.classList.add('cm-connector')
  }

  renderConnector(root: HTMLElement, top: string, i: number) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    const dom = document.createElementNS(SVG_NS, 'path');

    svg.appendChild(dom)
    root.appendChild(svg);

    this.updateConnector(svg, top, i)
  }
}

function getTop(view: EditorView, from: number, to: number) {
  const fromLine = view.lineBlockAt(from)
  const toLine = view.lineBlockAt(to)

  if (from === to && from === fromLine.from) {
    const blocks = fromLine.type
    if (Array.isArray(blocks)) {
      const textBlock: BlockInfo | undefined = blocks.find(t => t.type === BlockType.Text)
      if (textBlock) {
        return [
          textBlock?.top,
          textBlock?.top,
        ]
      }
    }
  }

  return [
    fromLine.top,
    toLine.bottom,
  ]
}

function rm(elt: HTMLElement) {
  const next = elt.nextSibling
  elt.remove()
  return next as HTMLElement | null
}

export {
  CustomMergeView,
}
