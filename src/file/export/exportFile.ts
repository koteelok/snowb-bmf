import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { Project } from 'src/store'
import drawPackCanvas from 'src/utils/drawPackCanvas'

import toInfo from './toBmfInfo'

export default function exportFile(
  project: Project,
  fontName: string,
  fileName: string,
): void {
  const zip = new JSZip()
  const { packCanvas, glyphList, name, layout, ui } = project
  const bmfont = toInfo(project, fontName)
  const saveFileName = fileName || name

  zip.file(`${saveFileName}.json`, JSON.stringify(bmfont))

  const canvas = document.createElement('canvas')
  canvas.width = ui.width
  canvas.height = ui.height
  drawPackCanvas(canvas, packCanvas, glyphList, layout.padding)

  canvas.toBlob((blob) => {
    if (blob) zip.file(`${saveFileName}.png`, blob)
    zip
      .generateAsync({ type: 'blob' })
      .then((content) => saveAs(content, `${saveFileName}.zip`))
  })
}
