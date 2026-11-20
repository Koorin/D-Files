# D-File

---

[Live demo here](https://koorin.github.io/D-Files/)

### 功能
- 🎭 文件伪装：将多个文件打包伪装为一个文件
- 🖼️ 文件还原：支持预览与下载原始文件
- 🔒 始终加密：AES-256-GCM，密钥由 PBKDF2-SHA256（60 万次）从口令派生
- 🔑 默认密钥：未设置口令时自动使用内置默认密钥，避免文件被其它工具直接读取
- 🎨 自定义外观：提供黑夜/正常模式与背景自定义  
- 💻 本地运行：无需服务器，全程在浏览器中完成

### 注意事项
- 未设置口令时使用**内置默认密钥**。该密钥公开在源码中，**只用于阻止常规工具直接读取文件，不提供保密性**；需要保密请自行设置口令。
- 对于设置了口令的文件，错误的密钥将导致无法正确还原（提示失败，不会输出乱码文件）。
- 旧版本生成的、未设置密钥的文件仍可正常还原。
- 密钥默认只记忆在本次会话；勾选“在此设备记住”后，本地保存的是该文件的派生密钥，而非口令本身。
- 浏览器需支持 **Web Crypto API** 与 **Streams API**（现代浏览器均已支持）；大文件流式写盘需要 File System Access API（Chromium 系浏览器）。
- 本工具不会上传任何文件，所有操作均在本地完成。  

### 📜 免责声明
1. 本工具仅供学习、研究和个人数据保护使用。  
2. 作者不对因使用本工具而导致的任何数据丢失、文件损坏或法律责任承担责任。  
3. 用户应遵守所在国家/地区的法律法规，禁止将本工具用于非法用途。  
4. 使用本工具即表示您已同意本免责声明。  

### 📄 开源协议
本项目基于 **Apache License 2.0** 开源协议发布，详情见 [LICENSE](LICENSE) 文件。  

---

### Features
- 🎭 File disguise: Pack multiple files into one disguised file  
- 🖼️ File restore: Preview and download extracted files
- 🔒 Always encrypted: AES-256-GCM with PBKDF2-SHA256 (600k) key derivation
- 🔑 Built-in default key: used when no password is set, so files cannot be opened directly by other tools
- 🎨 Custom UI: Dark/Light mode and background customization  
- 💻 Local execution: Works entirely offline in your browser

### Notes
- Without a password the **built-in default key** is used. It is public in the source code and is meant to **keep casual tools out, not to provide confidentiality**; set your own password if you need secrecy.
- A wrong password now fails with a clear message instead of producing a broken file.
- Old files created by previous versions, including those with no key at all, still restore correctly.
- Keys are remembered for the current session only; ticking "remember on this device" stores that file's derived key locally, never your password.
- Requires **Web Crypto API** and **Streams API**; large-file streaming needs the File System Access API (Chromium-based browsers).

### Notes
- Wrong keys in encryption mode will result in failed restoration.  
- Browser must support **Web Crypto API** and **Streams API** (supported in modern browsers).  
- No data is uploaded; everything runs locally.  

### 📜 Disclaimer
1. This tool is intended for **educational, research, and personal data protection** purposes only.  
2. The author is **not responsible** for any data loss, file corruption, or legal issues caused by the use of this tool.  
3. Users must comply with the laws and regulations of their country/region. **Illegal usage is strictly prohibited.**  
4. By using this tool, you agree to this disclaimer.  

### 📄 License
This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.  
