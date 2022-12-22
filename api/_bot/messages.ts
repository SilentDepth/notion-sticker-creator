const BOT = '@NotionStickerBot'
const PATIENCE = '⚠️ 生成贴纸可能需要一点时间。如果超过 10 秒还没有返回生成结果，可尝试在指令结尾敲个空格重新触发请求。'
const HR = '──────────────────'

export const start = () => `

`.trim()

export const help = () => `
/help_phrase 查看文字贴纸的指令帮助
/help_calendar 查看日历贴纸的指令帮助
`.trim()

export const help_phrase = (premium?: boolean) => `
【<b>文字贴纸指令使用说明</b>】

${PATIENCE}

<code>${BOT} 你好世界</code>

■ 设置文字内容

${premium
  ? '你目前可以设置任意长度的文字内容（但注意 Telegram 不支持总计超过 256 个字符的指令）'
  : '文字内容最多 9 个字符（半角数字、字母、符号都视为 1 个字符）'
}，字数决定排版效果。

<code>${BOT} 好</code>
<code>${BOT} 你好</code>
<code>${BOT} 生🐲活🐯</code>
<code>${BOT} 越过长城，走向世界</code>

可以通过插入空格来微调字符的排版位置（注意空格需要使用 <code>\\</code> 标记）：
<code>${BOT} 好\\ 世界</code>

除空格外，还有一些符号也需要标记：
<code>${BOT} \\\\斜杠</code>
<code>${BOT} \\=等号</code>
<code>${BOT} \\$开头的美元符号</code>
<code>${BOT} 不在开头的$无所谓</code>
<code>${BOT} \\#开头的井号</code>
<code>${BOT} 不在开头的#无所谓</code>

当使用一些带有 emoji 版的特殊符号时，操作系统可能会默认提交其 emoji 版，此时可通过将其标记强制使用符号版本：
<code>${BOT} \\🈚️</code>

■ 设置文字颜色

全部设置为蓝色：
<code>${BOT} 你好世界 color=blue</code>

仅第一个字设置为蓝色：
<code>${BOT} 你好世界 color=blue,</code>

仅第二个字设置为蓝色：
<code>${BOT} 你好世界 color=,blue</code>

仅第四个字设置为蓝色：
<code>${BOT} 你好世界 color=,,,blue</code>

第一个字设置为金菊色，第二个字设置为红色，第三个字设置为蓝色：
<code>${BOT} 你好世界 color=#daa520,#f00,blue</code>

除了示例中的 <code>blue</code>，你还可以使用其他任何 HTML Color Name。

${premium ? `
■ 高级排版语法

这是针对长文本、复杂排版设计的指令语法。高级排版语法以 <code>#</code> 开始、<code>$</code> 结束，文字内容书写于起止标记之间。高级排版语法不会根据文字字数决定排版效果，需要用户通过换行或 <code>\\n</code> 手动控制文字分行。空格依然可用于微调字符位置，但不再需要标记。

<code>${BOT} #越过\\n长城\\n  走向\\n  世界$</code>

高级排版语法下，文字内容中任意位置的 <code>#</code> 和 <code>$</code> 都需要标记。

在结束标记后添加 <code>r</code> 使用垂直排版（自右向左、由上到下）：
<code>${BOT} #越过\\n长城\\n  走向\\n  世界$r</code>

高级排版语法不再使用 <code>color</code> 参数设置文字颜色，而改用一系列语法标记。
<code>·</code> <code>#...=</code> 用于设置后续所有文字的颜色
<code>·</code> <code>#...-</code> 用于设置下一个字符的颜色，并在之后恢复之前的文字颜色设定
<code>·</code> <code>#=</code> 用于重置文字颜色设定

以下两条指令的效果相同，都是将「长城」二字设置为红色（注意十六进制颜色代码无需额外前缀 <code>#</code>）：
<code>${BOT} #越过\\n#red=长城#=\\n  走向\\n  世界$</code>
<code>${BOT} #越过\\n#f00-长#f00-城\\n  走向\\n  世界$</code>

<code>#...-</code> 会在下一个字符后恢复之前的文字颜色设定：
<code>${BOT} ##red=越过\\n长城\\n  #blue-走向\\n  世界$</code>
` : ''}
`.trim()

export const help_calendar = () => `
【<b>日历贴纸指令使用说明</b>】

${PATIENCE}

<code>${BOT} $calendar</code>
<code>${BOT} $cal</code>

■ 设置日期

生成显示为 2021 年 1 月 31 日的贴纸：
<code>${BOT} $cal 2021-01-31</code>

须使用 <code>YYYY-MM-DD</code> 格式。默认为指令运行时的当天日期（时区问题见 <code>timezone</code> 参数）。

■ 设置日期颜色

设置为蓝色：
<code>${BOT} $cal color=blue</code>

颜色代码可以使用 <code>#rrggbb</code>、<code>#rgb</code> 和 HTML Color Name 格式。默认为深红色。

使用内置的一周色表（一周七天，一天一种颜色）：
<code>${BOT} $cal color=week</code>

■ 设置语言

使用英文表示「星期」：
<code>${BOT} $cal locale=en</code>

目前只支持 <code>zh</code> 和 <code>en</code>。默认为 <code>zh</code>。

■ 设置时区

使用洛杉矶时间生成当天的日历贴纸：
<code>${BOT} $cal timezone=America/Los_Angeles</code>

须使用 IANA Timezones 格式。默认为 <code>Asia/Shanghai</code>。设置了显示日期时此参数无效。
`.trim()
