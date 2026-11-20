# 第三方依赖（本地托管）

本目录的文件直接随站点发布，页面不再从任何 CDN 加载代码。

| 依赖 | 版本 | 许可证 | 文件 |
|---|---|---|---|
| `@zip.js/zip.js` | 2.25.0 | BSD-3-Clause | `dist/zip.min.js` |
| `@simonwep/pickr` | 1.10.3 | MIT | `dist/pickr.min.js` |
| `@simonwep/pickr` | 1.10.3 | MIT | `dist/themes/monolith.min.css` |

## 为什么放在仓库里

出现过的风险：地址不带版本号（永远解析到 latest）、无 `integrity` 校验、下载后写入 localStorage 并反复执行。
任一环节被投毒，脚本就会拿到用户正在处理的所有文件与 `key_mapping` 里的明文密钥。
现在改为同源静态文件，随代码一起评审、一起发布。

## 如何升级

```bash
curl -fsSL -o zip.min.js      https://cdn.jsdelivr.net/npm/@zip.js/zip.js@<版本>/dist/zip.min.js
curl -fsSL -o pickr.min.js    https://cdn.jsdelivr.net/npm/@simonwep/pickr@<版本>/dist/pickr.min.js
curl -fsSL -o monolith.min.css https://cdn.jsdelivr.net/npm/@simonwep/pickr@<版本>/dist/themes/monolith.min.css
```

升级后必须：
1. 重新生成 `CHECKSUMS.txt`（sha384，见下方命令）；
2. 在浏览器里跑一遍单文件伪装/还原、多文件合集、XOR/AES，确认 API 未变；
3. 同步更新本文件的版本表。

```powershell
# 生成 SRI 形式的校验和
$h = [Convert]::ToBase64String([System.Security.Cryptography.SHA384]::Create().
      ComputeHash([IO.File]::ReadAllBytes("zip.min.js")))
"sha384-$h"
```

## 许可证

- `zip/LICENSE.txt` —— @zip.js/zip.js，BSD-3-Clause
- `pickr/LICENSE.txt` —— @simonwep/pickr，MIT
