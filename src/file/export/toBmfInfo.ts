import { Project } from 'src/store'

export default function toInfo(project: Project, fontFamily = '') {
  const { style, layout, globalAdjustMetric, glyphList } = project
  const { opentype, size } = style.font
  let fontScale = 1
  if (opentype) {
    fontScale = (1 / opentype.unitsPerEm) * size
  }

  const chars: Record<string, Record<string, number>> = {}

  const kernings: Record<string, number> = {}

  glyphList.forEach((glyph) => {
    const isUnEmpty = !!(glyph.width && glyph.height)

    chars[glyph.letter.charCodeAt(0)] = {
      x: glyph.x,
      y: glyph.y,
      width: isUnEmpty ? glyph.width + layout.padding * 2 : 0,
      height: isUnEmpty ? glyph.height + layout.padding * 2 : 0,
      xoffset:
        globalAdjustMetric.xOffset +
        glyph.adjustMetric.xOffset -
        (isUnEmpty ? glyph.trimOffsetLeft : 0) -
        (isUnEmpty ? layout.padding : 0),
      yoffset:
        globalAdjustMetric.yOffset +
        glyph.adjustMetric.yOffset -
        (isUnEmpty ? glyph.trimOffsetTop : 0) -
        (isUnEmpty ? layout.padding : 0),
      xadvance:
        Math.ceil(glyph.fontWidth) +
        globalAdjustMetric.xAdvance +
        glyph.adjustMetric.xAdvance,
    }

    if (opentype) {
      glyphList.forEach(({ letter }) => {
        const amount = Math.round(
          opentype.getKerningValue(
            opentype.charToGlyphIndex(glyph.letter),
            opentype.charToGlyphIndex(letter),
          ) *
            fontScale +
            (glyph.kerning.get(letter) || 0),
        )
        if (amount) {
          kernings[`${glyph.letter.charCodeAt(0)},${letter.charCodeAt(0)}`] =
            amount
        }
      })
    } else {
      glyph.kerning.forEach((amount, letter) => {
        if (amount) {
          kernings[`${glyph.letter.charCodeAt(0)},${letter.charCodeAt(0)}`] =
            amount
        }
      })
    }
  })

  return {
    info: {
      fontSize: style.font.size,
      lineHeight: Math.round(style.font.size * style.font.lineHeight),
      baseline: Math.round(style.font.alphabetic - style.font.top),
      decender: Math.abs(style.font.top - style.font.bottom),
    },
    chars,
    kernings,
  }
}
