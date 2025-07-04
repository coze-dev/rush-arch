//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

/* eslint-disable */
import {
  MapMode, Facet, Extension,
  RangeValue, RangeSet, RangeCursor
} from "@codemirror/state"
import { EditorView, ViewPlugin, ViewUpdate, BlockType, WidgetType, BlockInfo, Direction } from "@codemirror/view"

/// A gutter marker represents a bit of information attached to a line
/// in a specific gutter. Your own custom markers have to extend this
/// class.
export abstract class GutterMarker extends RangeValue {
  /// @internal
  compare(other: GutterMarker) {
    return this == other || this.constructor == other.constructor && this.eq(other)
  }

  /// Compare this marker to another marker of the same type.
  eq(other: GutterMarker): boolean { return false }

  /// Render the DOM node for this marker, if any.
  toDOM?(view: EditorView): Node

  /// This property can be used to add CSS classes to the gutter
  /// element that contains this marker.
  elementClass!: string

  /// Called if the marker has a `toDOM` method and its representation
  /// was removed from a gutter.
  destroy(dom: Node) { }
}

GutterMarker.prototype.elementClass = ""
GutterMarker.prototype.toDOM = undefined
GutterMarker.prototype.mapMode = MapMode.TrackBefore
GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1
GutterMarker.prototype.point = true

/// Facet used to add a class to all gutter elements for a given line.
/// Markers given to this facet should _only_ define an
/// [`elementclass`](#view.GutterMarker.elementClass), not a
/// [`toDOM`](#view.GutterMarker.toDOM) (or the marker will appear
/// in all gutters for the line).
export const gutterLineClass = Facet.define<RangeSet<GutterMarker>>()

/// Facet used to add a class to all gutter elements next to a widget.
/// Should not provide widgets with a `toDOM` method.
export const gutterWidgetClass =
  Facet.define<(view: EditorView, widget: WidgetType, block: BlockInfo) => GutterMarker | null>()

type Handlers = { [event: string]: (view: EditorView, line: BlockInfo, event: Event) => boolean }

interface GutterConfig {
  /// An extra CSS class to be added to the wrapper (`cm-gutter`)
  /// element.
  class?: string
  /// Controls whether empty gutter elements should be rendered.
  /// Defaults to false.
  renderEmptyElements?: boolean
  /// Retrieve a set of markers to use in this gutter.
  markers?: (view: EditorView) => (RangeSet<GutterMarker> | readonly RangeSet<GutterMarker>[])
  /// Can be used to optionally add a single marker to every line.
  lineMarker?: (view: EditorView, line: BlockInfo, otherMarkers: readonly GutterMarker[]) => GutterMarker | null
  /// Associate markers with block widgets in the document.
  widgetMarker?: (view: EditorView, widget: WidgetType, block: BlockInfo) => GutterMarker | null
  /// If line or widget markers depend on additional state, and should
  /// be updated when that changes, pass a predicate here that checks
  /// whether a given view update might change the line markers.
  lineMarkerChange?: null | ((update: ViewUpdate) => boolean)
  /// Add a hidden spacer element that gives the gutter its base
  /// width.
  initialSpacer?: null | ((view: EditorView) => GutterMarker)
  /// Update the spacer element when the view is updated.
  updateSpacer?: null | ((spacer: GutterMarker, update: ViewUpdate) => GutterMarker)
  /// Supply event handlers for DOM events on this gutter.
  domEventHandlers?: Handlers,
}

const defaults = {
  class: "",
  renderEmptyElements: false,
  elementStyle: "",
  markers: () => RangeSet.empty,
  lineMarker: () => null,
  widgetMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
}

const activeGutters = Facet.define<Required<GutterConfig>>()

/// Define an editor gutter. The order in which the gutters appear is
/// determined by their extension priority.
export function gutter(config: GutterConfig): Extension {
  return [gutters(), activeGutters.of({ ...defaults, ...config })]
}

const unfixGutters = Facet.define<boolean, boolean>({
  combine: values => values.some(x => x)
})

/// The gutter-drawing plugin is automatically enabled when you add a
/// gutter, but you can use this function to explicitly configure it.
///
/// Unless `fixed` is explicitly set to `false`, the gutters are
/// fixed, meaning they don't scroll along with the content
/// horizontally (except on Internet Explorer, which doesn't support
/// CSS [`position:
/// sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)).
export function gutters(config?: { fixed?: boolean }): Extension {
  const result: Extension[] = [
    gutterView,
    // right gutter theme
    EditorView.baseTheme({
      ".cm-right-gutters": {
        flexShrink: 0,
        display: "flex",
        height: "100%",
        boxSizing: "border-box",
        insetInlineStart: 0,
        zIndex: 200
      },

      ".cm-right-gutter": {
        display: "flex !important", // Necessary -- prevents margin collapsing
        flexDirection: "column",
        flexShrink: 0,
        boxSizing: "border-box",
        minHeight: "100%",
        overflow: "hidden"
      },

      ".cm-rightGutterElement": {
        boxSizing: "border-box"
      },
    })
  ]
  if (config && config.fixed === false) result.push(unfixGutters.of(true))
  return result
}

const gutterView = ViewPlugin.fromClass(class {
  gutters: SingleGutterView[]
  dom: HTMLElement
  fixed: boolean
  prevViewport: { from: number, to: number }

  constructor(readonly view: EditorView) {
    this.prevViewport = view.viewport
    this.dom = document.createElement("div")
    this.dom.className = "cm-right-gutters"
    this.dom.setAttribute("aria-hidden", "true")
    this.dom.style.minHeight = (this.view.contentHeight / this.view.scaleY) + "px"
    this.gutters = view.state.facet(activeGutters).map(conf => new SingleGutterView(view, conf))
    for (const gutter of this.gutters) this.dom.appendChild(gutter.dom)
    this.fixed = !view.state.facet(unfixGutters)
    if (this.fixed) {
      // FIXME IE11 fallback, which doesn't support position: sticky,
      // by using position: relative + event handlers that realign the
      // gutter (or just force fixed=false on IE11?)
      this.dom.style.position = "sticky"
    }
    this.syncGutters(false)
    // view.scrollDOM.insertBefore(this.dom, view.contentDOM)
    view.scrollDOM.appendChild(this.dom)
  }

  update(update: ViewUpdate) {
    if (this.updateGutters(update)) {
      // Detach during sync when the viewport changed significantly
      // (such as during scrolling), since for large updates that is
      // faster.
      const vpA = this.prevViewport, vpB = update.view.viewport
      const vpOverlap = Math.min(vpA.to, vpB.to) - Math.max(vpA.from, vpB.from)
      this.syncGutters(vpOverlap < (vpB.to - vpB.from) * 0.8)
    }
    if (update.geometryChanged) {
      this.dom.style.minHeight = (this.view.contentHeight / this.view.scaleY) + "px"
    }
    if (this.view.state.facet(unfixGutters) != !this.fixed) {
      this.fixed = !this.fixed
      this.dom.style.position = this.fixed ? "sticky" : ""
    }
    this.prevViewport = update.view.viewport
  }

  syncGutters(detach: boolean) {
    // let after = this.dom.nextSibling
    const before = this.dom.previousSibling
    if (detach) this.dom.remove()
    const lineClasses = RangeSet.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from)
    let classSet: GutterMarker[] = []
    const contexts = this.gutters.map(gutter => new UpdateContext(gutter, this.view.viewport, -this.view.documentPadding.top))
    for (const line of this.view.viewportLineBlocks) {
      if (classSet.length) classSet = []
      if (Array.isArray(line.type)) {
        let first = true
        for (const b of line.type) {
          if (b.type == BlockType.Text && first) {
            advanceCursor(lineClasses, classSet, b.from)
            for (const cx of contexts) cx.line(this.view, b, classSet)
            first = false
          } else if (b.widget) {
            for (const cx of contexts) cx.widget(this.view, b)
          }
        }
      } else if (line.type == BlockType.Text) {
        advanceCursor(lineClasses, classSet, line.from)
        for (const cx of contexts) cx.line(this.view, line, classSet)
      } else if (line.widget) {
        for (const cx of contexts) cx.widget(this.view, line)
      }
    }
    for (const cx of contexts) cx.finish()
    if (detach) {
      // this.view.scrollDOM.insertBefore(this.dom, after)
      this.view.scrollDOM.insertBefore(this.dom, before?.nextSibling ?? null)
    }
  }

  updateGutters(update: ViewUpdate) {
    const prev = update.startState.facet(activeGutters), cur = update.state.facet(activeGutters)
    let change = update.docChanged || update.heightChanged || update.viewportChanged ||
      !RangeSet.eq(update.startState.facet(gutterLineClass), update.state.facet(gutterLineClass),
        update.view.viewport.from, update.view.viewport.to)
    if (prev == cur) {
      for (const gutter of this.gutters) if (gutter.update(update)) change = true
    } else {
      change = true
      const gutters: SingleGutterView[] = []
      for (const conf of cur) {
        const known = prev.indexOf(conf)
        if (known < 0) {
          gutters.push(new SingleGutterView(this.view, conf))
        } else {
          this.gutters[known].update(update)
          gutters.push(this.gutters[known])
        }
      }
      for (const g of this.gutters) {
        g.dom.remove()
        if (gutters.indexOf(g) < 0) g.destroy()
      }
      for (const g of gutters) this.dom.appendChild(g.dom)
      this.gutters = gutters
    }
    return change
  }

  destroy() {
    for (const view of this.gutters) view.destroy()
    this.dom.remove()
  }
}, {
  provide: plugin => EditorView.scrollMargins.of(view => {
    const value = view.plugin(plugin)
    if (!value || value.gutters.length == 0 || !value.fixed) return null
    return view.textDirection == Direction.LTR
      ? { left: value.dom.offsetWidth * view.scaleX }
      : { right: value.dom.offsetWidth * view.scaleX }
  })
})

function asArray<T>(val: T | readonly T[]) { return (Array.isArray(val) ? val : [val]) as readonly T[] }

function advanceCursor(cursor: RangeCursor<GutterMarker>, collect: GutterMarker[], pos: number) {
  while (cursor.value && cursor.from <= pos) {
    if (cursor.from == pos) collect.push(cursor.value)
    cursor.next()
  }
}

class UpdateContext {
  cursor: RangeCursor<GutterMarker>
  i = 0

  constructor(readonly gutter: SingleGutterView, viewport: { from: number, to: number }, public height: number) {
    this.cursor = RangeSet.iter(gutter.markers, viewport.from)
  }

  addElement(view: EditorView, block: BlockInfo, markers: readonly GutterMarker[]) {
    const { gutter } = this, above = (block.top - this.height) / view.scaleY, height = block.height / view.scaleY
    if (this.i == gutter.elements.length) {
      const newElt = new GutterElement(view, height, above, markers)
      gutter.elements.push(newElt)
      gutter.dom.appendChild(newElt.dom)
    } else {
      gutter.elements[this.i].update(view, height, above, markers)
    }
    this.height = block.bottom
    this.i++
  }

  line(view: EditorView, line: BlockInfo, extraMarkers: readonly GutterMarker[]) {
    let localMarkers: GutterMarker[] = []
    advanceCursor(this.cursor, localMarkers, line.from)
    if (extraMarkers.length) localMarkers = localMarkers.concat(extraMarkers)
    const forLine = this.gutter.config.lineMarker(view, line, localMarkers)
    if (forLine) localMarkers.unshift(forLine)

    const gutter = this.gutter
    if (localMarkers.length == 0 && !gutter.config.renderEmptyElements) return
    this.addElement(view, line, localMarkers)
  }

  widget(view: EditorView, block: BlockInfo) {
    const marker = this.gutter.config.widgetMarker(view, block.widget!, block)
    let markers = marker ? [marker] : null
    for (const cls of view.state.facet(gutterWidgetClass)) {
      const marker = cls(view, block.widget!, block)
      if (marker) (markers || (markers = [])).push(marker)
    }
    if (markers) this.addElement(view, block, markers)
  }

  finish() {
    const gutter = this.gutter
    while (gutter.elements.length > this.i) {
      const last = gutter.elements.pop()!
      gutter.dom.removeChild(last.dom)
      last.destroy()
    }
  }
}

class SingleGutterView {
  dom: HTMLElement
  elements: GutterElement[] = []
  markers: readonly RangeSet<GutterMarker>[]
  spacer: GutterElement | null = null

  constructor(public view: EditorView, public config: Required<GutterConfig>) {
    this.dom = document.createElement("div")
    this.dom.className = "cm-right-gutter" + (this.config.class ? " " + this.config.class : "")
    for (const prop in config.domEventHandlers) {
      this.dom.addEventListener(prop, (event: Event) => {
        let target = event.target as HTMLElement, y
        if (target != this.dom && this.dom.contains(target)) {
          while (target.parentNode != this.dom) target = target.parentNode as HTMLElement
          const rect = target.getBoundingClientRect()
          y = (rect.top + rect.bottom) / 2
        } else {
          y = (event as MouseEvent).clientY
        }
        const line = view.lineBlockAtHeight(y - view.documentTop)
        if (config.domEventHandlers[prop](view, line, event)) event.preventDefault()
      })
    }
    this.markers = asArray(config.markers(view))
    if (config.initialSpacer) {
      this.spacer = new GutterElement(view, 0, 0, [config.initialSpacer(view)])
      this.dom.appendChild(this.spacer.dom)
      this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none"
    }
  }

  update(update: ViewUpdate) {
    const prevMarkers = this.markers
    this.markers = asArray(this.config.markers(update.view))
    if (this.spacer && this.config.updateSpacer) {
      const updated = this.config.updateSpacer(this.spacer.markers[0], update)
      if (updated != this.spacer.markers[0]) this.spacer.update(update.view, 0, 0, [updated])
    }
    const vp = update.view.viewport
    return !RangeSet.eq(this.markers, prevMarkers, vp.from, vp.to) ||
      (this.config.lineMarkerChange ? this.config.lineMarkerChange(update) : false)
  }

  destroy() {
    for (const elt of this.elements) elt.destroy()
  }
}

class GutterElement {
  dom: HTMLElement
  height: number = -1
  above: number = 0
  markers: readonly GutterMarker[] = []

  constructor(view: EditorView, height: number, above: number, markers: readonly GutterMarker[]) {
    this.dom = document.createElement("div")
    this.dom.className = "cm-rightGutterElement"
    this.update(view, height, above, markers)
  }

  update(view: EditorView, height: number, above: number, markers: readonly GutterMarker[]) {
    if (this.height != height) {
      this.height = height
      this.dom.style.height = height + "px"
    }
    if (this.above != above)
      this.dom.style.marginTop = (this.above = above) ? above + "px" : ""
    if (!sameMarkers(this.markers, markers)) this.setMarkers(view, markers)
  }

  setMarkers(view: EditorView, markers: readonly GutterMarker[]) {
    let cls = "cm-rightGutterElement", domPos = this.dom.firstChild
    for (let iNew = 0, iOld = 0; ;) {
      let skipTo = iOld, marker = iNew < markers.length ? markers[iNew++] : null, matched = false
      if (marker) {
        const c = marker.elementClass
        if (c) cls += " " + c
        for (let i = iOld; i < this.markers.length; i++)
          if (this.markers[i].compare(marker)) { skipTo = i; matched = true; break }
      } else {
        skipTo = this.markers.length
      }
      while (iOld < skipTo) {
        const next = this.markers[iOld++]
        if (next.toDOM) {
          next.destroy(domPos!)
          const after = domPos!.nextSibling
          domPos!.remove()
          domPos = after
        }
      }
      if (!marker) break
      if (marker.toDOM) {
        if (matched) domPos = domPos!.nextSibling
        else this.dom.insertBefore(marker.toDOM(view), domPos)
      }
      if (matched) iOld++
    }
    this.dom.className = cls
    this.markers = markers
  }

  destroy() {
    this.setMarkers(null as any, []) // First argument not used unless creating markers
  }
}

function sameMarkers(a: readonly GutterMarker[], b: readonly GutterMarker[]): boolean {
  if (a.length != b.length) return false
  for (let i = 0; i < a.length; i++) if (!a[i].compare(b[i])) return false
  return true
}

const activeLineGutterMarker = new class extends GutterMarker {
  elementClass = "cm-activeLineRightGutter"
}

const activeLineGutterHighlighter = gutterLineClass.compute(["selection"], state => {
  const marks: any[] = []
  let last = -1
  for (const range of state.selection.ranges) {
    const linePos = state.doc.lineAt(range.head).from
    if (linePos > last) {
      last = linePos
      marks.push(activeLineGutterMarker.range(linePos))
    }
  }
  return RangeSet.of(marks)
})

/// Returns an extension that adds a `cm-activeLineRightGutter` class to
/// all gutter elements on the [active
/// line](#view.highlightActiveLine).
export function highlightActiveLineGutter() {
  return activeLineGutterHighlighter
}