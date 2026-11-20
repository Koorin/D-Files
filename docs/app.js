
    
      // 依赖由 index.html 以同源脚本引入（vendor/zip、vendor/pickr），不再运行时下载与缓存执行。
      // 这里只做能力检查与配置：缺失时给出可见提示，而不是静默失败。
      function missingDependencies() {
        const missing = [];
        if (typeof zip === "undefined") missing.push("zip.js");
        if (typeof Pickr === "undefined") missing.push("pickr");
        return missing;
      }

      function missingCapabilities() {
        const missing = [];
        if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) {
          missing.push("Web Crypto");
        } else if (typeof globalThis.crypto.getRandomValues !== "function") {
          missing.push("安全随机数");
        }
        return missing;
      }

      function showBanner(text) {
        console.error("[D-Files] " + text);
        const el = document.getElementById("depWarning");
        if (!el) return;
        el.textContent = text;
        el.classList.remove("hidden");
      }

      function configureZip() {
        if (typeof zip === "undefined" || typeof zip.configure !== "function") return;
        try {
          // 本工具只用 STORE 模式打包，关掉 worker 可以少一条 CSP / 兼容性依赖
          zip.configure({ useWebWorkers: false });
        } catch (e) {
          console.warn("[D-Files] zip.configure 失败，继续使用默认配置", e);
        }
      }
    
      function getRandomStatus(type) {
        const random = Math.random();
      
        if (type === "disguise-processing") {
          if (random < 0.3) {
            const phrases = [
              "少女祈祷中...",
              "No time to waste😡",
              "少女折寿中Σ(っ °Д °;)っ" ,
              "Now you see me, soon you won't",
              "A really big fxxking hole coming right up!",
              "oiiaioooooiai"
            ];
            return phrases[Math.floor(Math.random() * phrases.length)];
          }
          return "处理中...";
        }

        if (type === "disguise-done") {
          if (random < 0.3) {
            const phrases = [
              "正在偷吃电弧星！",
              "S属性大爆发！Share!",
              "豆浆~",
              "El Psy Kongroo"
            ];
            return phrases[Math.floor(Math.random() * phrases.length)];
          }
          return "处理完成！";
        }
      
        if (type === "reveal-processing") {
          if (random < 0.3) { 
            const phrases = [
               "🤠👐面纱后面藏着什么呢？",
               "🎵正在治疗自己🎶",
               "If you want it,then you have to take it",
               "oiiaioooooiai",
               "Open Sesame!"
            ];
            return phrases[Math.floor(Math.random() * phrases.length)];
          }
          return "处理中...";
        }
      
        if (type === "reveal-done") {
          if (random < 0.3) {
            const phrases = [
              "🤠👐伟大的揭幕表演！", 
              "是我喜欢的内容，直接拿来。",
              "El Psy Kongroo"
            ];
            return phrases[Math.floor(Math.random() * phrases.length)];
          }
          return "处理完成";
        }

        return "处理中...";
      }    

      function bindSliderWithNumber(sliderId, numberId, onChange) {
        const slider = document.getElementById(sliderId);
        const number = document.getElementById(numberId);
        slider.addEventListener("input", () => {
          number.value = slider.value;
          if (onChange) onChange(slider.value);
        });
        number.addEventListener("input", () => {
          slider.value = number.value;
          if (onChange) onChange(slider.value);
        });
      }
    
      const STATUS_STATE_CLASSES = ["success", "error", "warning"];

      function updateStatus(element, text, ok = null, options = {}) {
        if (!element) return;

        const cfg = {
          autoHide: options.autoHide === undefined ? true : Boolean(options.autoHide),
          delay: typeof options.delay === 'number' ? options.delay : 2000
        };

        if (element._statusTimeout) {
          clearTimeout(element._statusTimeout);
          element._statusTimeout = null;
        }

        element.classList.remove(...STATUS_STATE_CLASSES);

        if (!text) {
          element.textContent = "";
          element.classList.remove("active");
          return;
        }

        element.textContent = text;
        element.classList.add("active");

        if (ok === true) {
          element.classList.add("success");
        } else if (ok === false) {
          element.classList.add("error");
        } else if (ok === "warning" || ok === "warn") {
          element.classList.add("warning");
        }

        if (cfg.autoHide) {
          element._statusTimeout = setTimeout(() => {
            element.classList.remove("active");
            element._statusTimeout = null;
          }, cfg.delay);
        }
      }
    
      function clearKeyMapping() {
        try { localStorage.removeItem(KEY_DEVICE_STORE); } catch (e) {}
        try { sessionStorage.removeItem(KEY_SESSION_STORE); } catch (e) {}
        try { localStorage.removeItem(KEY_LEGACY_STORE); } catch (e) {}
        updateStatus(document.getElementById("clearKeyStatus"), "密钥记忆已清除", true);
      }
    
      function toggleKey(triggerBtn = null) {
        const clearBtn = document.getElementById("clearKeyBtn");
        const keyPanel = document.getElementById("keyPanel");
        const toggleBtn = triggerBtn || document.getElementById("keycfg");
        clearBtn.classList.toggle("hidden");
        keyPanel.classList.toggle("hidden");
        const isNowVisible = !clearBtn.classList.contains("hidden");
        toggleBtn.textContent = isNowVisible ? "隐藏加密配置" : "加密处理配置";
        localStorage.setItem("keyPanelOpen", isNowVisible ? "true" : "false");
      }

      function renderPreview(container, mime, url) {
        container.innerHTML = "";
        if (!mime || !url) return;
      
        if (mime.startsWith("image/")) {
          const el = document.createElement("img");
          el.src = url; el.className = "preview";
          container.appendChild(el);
          return;
        }
        if (mime.startsWith("audio/")) {
          const el = document.createElement("audio");
          el.controls = true; el.src = url; container.appendChild(el); return;
        }
        if (mime.startsWith("video/")) {
          const el = document.createElement("video");
          el.controls = true; el.src = url; el.className = "preview"; container.appendChild(el); return;
        }
        if (mime === "application/pdf") {
          const el = document.createElement("iframe");
          el.src = url; el.className = "preview"; container.appendChild(el); return;
        }
        if (mime.startsWith("text/") || mime === "application/json" || mime === "application/javascript" || mime === "text/csv") {
          fetch(url).then(res => res.text()).then(text => {
            const pre = document.createElement("pre");
            pre.textContent = text;
            container.appendChild(pre);
          }).catch(()=> {
            const note = document.createElement("div");
            note.textContent = "文本读取失败。";
            container.appendChild(note);
          });
          return;
        }
      
        const note = document.createElement("div");
        note.textContent = "该文件类型暂不支持在线预览。";
        container.appendChild(note);
      }
    
      function createXORTransformStream(key) {
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(key);
        return new TransformStream({
          transform(chunk, controller) {
            const output = new Uint8Array(chunk.length);
            for (let i = 0; i < chunk.length; i++) {
              output[i] = chunk[i] ^ keyBytes[i % keyBytes.length];
            }
            controller.enqueue(output);
          }
        });
      }
    
    function createAesCtrTransformStream(password, nonce, isEncrypt) {
      const BLOCK_SIZE = 24 * 1024;
      const keyPromise = (async () => {
        const pwBytes = new TextEncoder().encode(password);
        const hash = await crypto.subtle.digest('SHA-256', pwBytes);
        return crypto.subtle.importKey("raw", hash, { name: "AES-CTR" }, false, ["encrypt", "decrypt"]);
      })();

      let globalBlockCounter = 0;

      function makeCounterForBlock(blockCounter) {
        const counter = new Uint8Array(16);
        counter.set(nonce, 0);
        const view = new DataView(counter.buffer);
        view.setUint32(12, blockCounter, false);
        return counter;
      }

      return new TransformStream({
        async transform(chunk, controller) {
          const key = await keyPromise;
          const uint8Chunk = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);

          let offset = 0;
          while (offset < uint8Chunk.length) {
            const slice = uint8Chunk.subarray(offset, offset + BLOCK_SIZE);

            const startBlockIndex = globalBlockCounter;
            const counter = makeCounterForBlock(startBlockIndex);
            const algo = { name: "AES-CTR", counter: counter, length: 128 };
            const processedBuffer = await crypto.subtle[isEncrypt ? "encrypt" : "decrypt"](algo, key, slice);
            const processed = new Uint8Array(processedBuffer);
            controller.enqueue(processed);
            const blocksProcessed = Math.ceil(slice.length / 16);
            globalBlockCounter += blocksProcessed;
            offset += slice.length;
          }
        }
      });
    }
    
      // ===== 容器格式 v2：PBKDF2-HMAC-SHA256 + AES-256-GCM =====
      // 旧格式（flag 1 = XOR、flag 2 = AES-CTR）只保留解密路径，用于兼容历史文件。
      //
      // v2 头部布局（n = 文件名字节数）：
      //   0   magic(8) | 8 flag(1)=3 | 9 kdfId(1) | 10 iters(4) | 14 salt(16)
      //   30  ivBase(8) | 38 chunkSize(4) | 42 payloadLen(8) | 50 nameLen(1)
      //   51  name(n) | 51+n keyId(8) | 59+n 记录 0..k
      //   AAD = [8,50) 共 42 字节，只覆盖加密参数；文件名与 keyId 不在其中，
      //   因此改名不会影响解密。记录 = [len u32][密文 len][tag 16]。
      const FLAG_V2_GCM = 3;
      const KDF_PBKDF2_SHA256 = 1;
      const KDF_ITERATIONS = 600000;
      const GCM_CHUNK_SIZE = 1024 * 1024;
      const GCM_TAG_LEN = 16;
      const RECORD_OVERHEAD = 4 + GCM_TAG_LEN;
      const V2_FIXED_PREFIX = 51;
      const V2_AAD_START = 8;
      const V2_AAD_END = 50;
      const KEY_ID_LEN = 8;
      const MIN_KDF_ITERATIONS = 100000;
      const MAX_KDF_ITERATIONS = 2000000;
      const MIN_GCM_CHUNK = 4096;
      const MAX_GCM_CHUNK = 8 * 1024 * 1024;
      const MAX_RECORD_COUNT = 1 << 20;
      // 超过这个体积就优先流式写盘（不保留在线预览），移动端也能处理大文件
      const STREAM_THRESHOLD = 32 * 1024 * 1024;
      // 不支持写盘 API 时的内存告警阈值
      const IN_MEMORY_WARN_BYTES = 256 * 1024 * 1024;

      // 未设置口令时使用的内置默认密钥。
      // 它写在源码里、人人可读，只用于阻止常规工具直接读取文件，不提供保密性。
      // 一旦发布就不要再改（旧文件依赖它）；如需更换只能在数组末尾追加。
      const DEFAULT_KEYS = [
        "08SaSGNtKi4m0BNhyR-GH751NUQH1s2v",
      ];

      function recordCount(payloadLen, chunkSize) {
        return Math.max(1, Math.ceil(payloadLen / chunkSize));
      }

      async function deriveRawKey(password, salt, iterations) {
        // 口令先做 NFC 归一化：不同输入法/系统可能产生不同的码位
        const raw = new TextEncoder().encode(password.normalize("NFC"));
        const base = await crypto.subtle.importKey("raw", raw, "PBKDF2", false, ["deriveBits"]);
        const bits = await crypto.subtle.deriveBits(
          { name: "PBKDF2", salt, iterations, hash: "SHA-256" }, base, 256);
        return new Uint8Array(bits);
      }

      async function importAesKey(rawBytes) {
        return crypto.subtle.importKey("raw", rawBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
      }

      async function deriveAesKey(password, salt, iterations) {
        return importAesKey(await deriveRawKey(password, salt, iterations));
      }

      function chunkIv(ivBase, index) {
        const iv = new Uint8Array(12);
        iv.set(ivBase, 0);
        new DataView(iv.buffer).setUint32(8, index, false);
        return iv;
      }

      function bytesToHex(bytes) {
        let out = "";
        for (const b of bytes) out += b.toString(16).padStart(2, "0");
        return out;
      }

      function buildV2Header({ nameBytes, salt, ivBase, payloadLen, iterations, chunkSize, keyId }) {
        const header = new Uint8Array(V2_FIXED_PREFIX + nameBytes.length + KEY_ID_LEN);
        const view = new DataView(header.buffer);
        header.set(MARKER_BYTES, 0);
        header[8] = FLAG_V2_GCM;
        header[9] = KDF_PBKDF2_SHA256;
        view.setUint32(10, iterations, false);
        header.set(salt, 14);
        header.set(ivBase, 30);
        view.setUint32(38, chunkSize, false);
        view.setBigUint64(42, BigInt(payloadLen), false);
        header[50] = nameBytes.length;
        header.set(nameBytes, V2_FIXED_PREFIX);
        header.set(keyId, V2_FIXED_PREFIX + nameBytes.length);
        return header;
      }

      // 逐块加密：流式读取并攒够 chunkSize 再加密。
      // 早期实现用 blob.slice(i*chunk, ...) 逐块读，1.56 GB 实测读文件要 2.8 s，
      // 而 file.stream() 只要 1.2 s —— 所以这里改回流式。
      async function* encryptedRecords(blob, key, ivBase, aad, chunkSize) {
        const reader = blob.stream().getReader();
        const buf = new Uint8Array(chunkSize);
        let filled = 0;
        let index = 0;
        const makeRecord = async (plainLen) => {
          const plain = buf.subarray(0, plainLen);
          const cipher = new Uint8Array(await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: chunkIv(ivBase, index), additionalData: aad, tagLength: 128 }, key, plain));
          const record = new Uint8Array(4 + cipher.length);
          new DataView(record.buffer).setUint32(0, plainLen, false);
          record.set(cipher, 4);
          index++;
          return record;
        };
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (value && value.length) {
              let offset = 0;
              while (offset < value.length) {
                const take = Math.min(chunkSize - filled, value.length - offset);
                buf.set(value.subarray(offset, offset + take), filled);
                filled += take;
                offset += take;
                if (filled === chunkSize) {
                  yield await makeRecord(filled);
                  filled = 0;
                }
              }
            }
            if (done) break;
          }
          // 空文件也要写一条记录，让头部得到认证
          if (filled > 0 || index === 0) yield await makeRecord(filled);
        } finally {
          try { reader.releaseLock(); } catch (e) {}
        }
      }

      // 逐块解密：同样走流式读取，按"4 字节长度 + 密文 + 16 字节 tag"切分。
      async function* decryptedRecords(file, v2, key, firstPlain = null) {
        const count = recordCount(v2.payloadLen, v2.chunkSize);
        let index = 0;
        let total = 0;
        if (firstPlain) {
          total += firstPlain.length;
          index = 1;
          yield firstPlain;
        }
        if (index < count) {
          // 试密钥时已经解出第 0 块，流式读取要从它之后开始
          const skipBytes = firstPlain ? 4 + firstPlain.length + GCM_TAG_LEN : 0;
          const reader = file.slice(v2.contentStart + skipBytes).stream().getReader();
          let carry = new Uint8Array(0);
          const take = async (n) => {
            while (carry.length < n) {
              const { done, value } = await reader.read();
              if (done) break;
              const merged = new Uint8Array(carry.length + value.length);
              merged.set(carry);
              merged.set(value, carry.length);
              carry = merged;
            }
            if (carry.length < n) throw new Error("文件不完整，可能被截断");
            const out = carry.subarray(0, n);
            carry = carry.subarray(n);
            return out;
          };
          try {
            for (; index < count; index++) {
              const plainLen = index === count - 1 ? v2.payloadLen - index * v2.chunkSize : v2.chunkSize;
              const head = await take(4);
              if (new DataView(head.buffer, head.byteOffset, 4).getUint32(0, false) !== plainLen) {
                throw new Error("文件已损坏");
              }
              const body = await take(plainLen + GCM_TAG_LEN);
              let plain;
              try {
                plain = new Uint8Array(await crypto.subtle.decrypt(
                  { name: "AES-GCM", iv: chunkIv(v2.ivBase, index), additionalData: v2.aad, tagLength: 128 },
                  key, body));
              } catch (e) {
                throw new Error("密钥不正确，或文件已被篡改");
              }
              total += plain.length;
              yield plain;
            }
          } finally {
            try { reader.releaseLock(); } catch (e) {}
          }
        }
        if (total !== v2.payloadLen) throw new Error("文件已损坏");
      }

      // 用试出的密钥解密第一条记录；密钥不对时返回 null（不抛错），便于依次尝试候选密钥
      async function probeFirstRecord(file, v2, key) {
        const count = recordCount(v2.payloadLen, v2.chunkSize);
        const plainLen = count > 1 ? v2.chunkSize : v2.payloadLen;
        const recordLen = 4 + plainLen + GCM_TAG_LEN;
        if (v2.contentStart + recordLen > file.size) return null;
        const record = new Uint8Array(await file.slice(v2.contentStart, v2.contentStart + recordLen).arrayBuffer());
        if (record.length !== recordLen) return null;
        if (new DataView(record.buffer, 0, 4).getUint32(0, false) !== plainLen) return null;
        try {
          return new Uint8Array(await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: chunkIv(v2.ivBase, 0), additionalData: v2.aad, tagLength: 128 },
            key, record.subarray(4)));
        } catch (e) {
          return null;
        }
      }

      function fileSystemSinkAvailable() {
        return typeof window !== "undefined" && typeof window.showSaveFilePicker === "function";
      }

      // “大文件直接写盘”默认关闭：保持项目原有的“生成后给下载链接”行为。
      // 只有用户显式勾选时，超过阈值的文件才会弹保存框并流式写入。
      const DIRECT_SAVE_PREF = "df.directSave";

      function directSaveEnabled() {
        try { return localStorage.getItem(DIRECT_SAVE_PREF) === "true"; } catch (e) { return false; }
      }

      function setDirectSave(on) {
        try { localStorage.setItem(DIRECT_SAVE_PREF, on ? "true" : "false"); } catch (e) {}
      }

      function wantDirectSave(bytes) {
        return directSaveEnabled() && fileSystemSinkAvailable() && bytes > STREAM_THRESHOLD;
      }

      async function openFileSink(suggestedName) {
        const handle = await window.showSaveFilePicker({ suggestedName });
        return handle.createWritable();
      }

      function inMemoryTooLarge(bytes) {
        return !directSaveEnabled() && bytes > IN_MEMORY_WARN_BYTES;
      }

      function memoryHint(bytes) {
        const gb = (bytes / 1024 ** 3).toFixed(2);
        if (fileSystemSinkAvailable()) {
          return `提示：文件较大（${gb} GiB），会在内存中组装约 2 倍体积的数据。可勾选「大文件直接写盘」边生成边写入磁盘。`;
        }
        return `提示：文件较大（${gb} GiB），当前浏览器不支持直接写盘，可能因内存不足而失败。`;
      }

      async function createZipBlob(files) {
            const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
            for (const file of files) {
              await writer.add(file.name, new zip.BlobReader(file));
            }
            return await writer.close();
      }
      
      function getExtensionMime(ext) {
        const mimes = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          apng: "image/apng",
          gif: "image/gif",
          webp: "image/webp",
          bmp: "image/bmp",
          ico: "image/x-icon",
          mp3: "audio/mpeg",
          aac: "audio/aac",
          wav: "audio/wav",
          flac: "audio/flac",
          ogg: "audio/ogg",
          mp4: "video/mp4",
          webm: "video/webm",
          pdf: "application/pdf",
          txt: "text/plain",
          json: "application/json",
          js: "application/javascript",
          csv: "text/csv",
          html: "text/html"
        };
        return mimes[ext.toLowerCase()] || "application/octet-stream";
      }
    
      // ===== 密钥记忆 =====
      // 默认只记在 sessionStorage（关闭标签页即消失），且只用于本次会话。
      // 勾选“在此设备记住”时，localStorage 里存的是该文件的派生密钥（32 B），不是口令本身，
      // 因此拿到本机存储也无法得到用户口令（P0-4）。
      const KEY_SESSION_STORE = "df.keys.session";
      const KEY_DEVICE_STORE = "df.keys.device";
      const KEY_LEGACY_STORE = "key_mapping";
      const REMEMBER_PREF = "df.keys.remember";

      function bytesToBase64(bytes) {
        let s = "";
        for (const b of bytes) s += String.fromCharCode(b);
        return btoa(s);
      }

      function base64ToBytes(b64) {
        try {
          const s = atob(b64);
          const out = new Uint8Array(s.length);
          for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
          return out;
        } catch (e) {
          return null;
        }
      }

      function readStore(area, name) {
        try {
          const raw = area.getItem(name);
          if (!raw) return {};
          const parsed = JSON.parse(raw);
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch (e) {
          return {};
        }
      }

      function writeStore(area, name, map) {
        try {
          area.setItem(name, JSON.stringify(map));
          return true;
        } catch (e) {
          console.warn("[D-Files] 密钥记忆写入失败（可能是存储已满）", e);
          return false;
        }
      }

      // 旧版本把口令明文存在 localStorage，启动时一次性搬到本次会话并删除旧记录
      function migrateLegacyKeyStore() {
        let legacy = null;
        try { legacy = localStorage.getItem(KEY_LEGACY_STORE); } catch (e) { return; }
        if (!legacy) return;
        try { localStorage.removeItem(KEY_LEGACY_STORE); } catch (e) {}
        let parsed = null;
        try { parsed = JSON.parse(legacy); } catch (e) { parsed = null; }
        if (!parsed || typeof parsed !== "object") return;
        const session = readStore(sessionStorage, KEY_SESSION_STORE);
        for (const keyId of Object.keys(parsed)) {
          const value = parsed[keyId];
          if (typeof value === "string" && value && !(keyId in session)) session[keyId] = value;
        }
        writeStore(sessionStorage, KEY_SESSION_STORE, session);
        console.info("[D-Files] 旧的明文密钥记录已迁移到本次会话，并从 localStorage 删除");
      }

      function rememberPreferred() {
        try { return localStorage.getItem(REMEMBER_PREF) === "true"; } catch (e) { return false; }
      }

      function setRememberPreferred(on) {
        try { localStorage.setItem(REMEMBER_PREF, on ? "true" : "false"); } catch (e) {}
      }

      function saveKeyEntry(fileKeyId, password, rawKeyBytes) {
        if (!fileKeyId) return;
        if (password) {
          const session = readStore(sessionStorage, KEY_SESSION_STORE);
          session[fileKeyId] = password;
          writeStore(sessionStorage, KEY_SESSION_STORE, session);
        }
        if (rawKeyBytes && rememberPreferred()) {
          const device = readStore(localStorage, KEY_DEVICE_STORE);
          device[fileKeyId] = { v: 2, key: bytesToBase64(rawKeyBytes) };
          writeStore(localStorage, KEY_DEVICE_STORE, device);
        }
      }

      // 返回 { rawKey } 或 { password }；rawKey 命中时还能省掉一次 PBKDF2
      function lookupKeyEntry(fileKeyId, fileName) {
        if (fileKeyId) {
          const device = readStore(localStorage, KEY_DEVICE_STORE);
          const entry = device[fileKeyId];
          if (entry && entry.v === 2 && typeof entry.key === "string") {
            const raw = base64ToBytes(entry.key);
            if (raw && raw.length === 32) return { rawKey: raw };
          }
        }
        const session = readStore(sessionStorage, KEY_SESSION_STORE);
        if (fileKeyId && typeof session[fileKeyId] === "string") return { password: session[fileKeyId] };
        if (fileName && typeof session[fileName] === "string") return { password: session[fileName] };
        return null;
      }

      migrateLegacyKeyStore();

      async function forEachStreamChunk(stream, fn) {
        const reader = stream.getReader();
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) return;
            await fn(value);
          }
        } finally {
          try { reader.releaseLock(); } catch (e) {}
        }
      }
    
      function openIDB() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open("bgStore", 1);
          request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore("images");
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    
      async function saveBgToIDB(dataURL) {
        const db = await openIDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("images", "readwrite");
          const store = tx.objectStore("images");
          const request = store.put(dataURL, "bgImage");
        
          request.onsuccess = () => {
            tx.oncomplete = () => {
              resolve();
            };
          };
          request.onerror = () => {
            reject(request.error);
          };
        });
      }
    
      async function loadBgFromIDB() {
        const db = await openIDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction("images", "readonly");
          const store = tx.objectStore("images");
          const request = store.get("bgImage");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      
      // 容器格式：封面 + "FAKETAIL" + 加密标志 + 名称长度 + 名称 + [密钥哈希] + [AES nonce] + 正文
      const MARKER_BYTES = new TextEncoder().encode("FAKETAIL");
      const MARKER_LEN = MARKER_BYTES.length;

      let disguiseObjectURL = null;
      let restoreObjectURL = null;

      function markerAt(buffer, index) {
        for (let j = 0; j < MARKER_LEN; j++) {
          if (buffer[index + j] !== MARKER_BYTES[j]) return false;
        }
        return true;
      }

      function decodeHiddenName(bytes) {
        try {
          return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        } catch (e) {
          return null;
        }
      }

      // 命中标记后还要确认后面的元数据自洽，不合法就返回 null，让扫描继续（跳过封面里的误命中）
      async function readDisguiseHeader(file, markerIndex) {
        const flagOffset = markerIndex + MARKER_LEN;
        if (file.size < flagOffset + 1) return null;

        const flag = new Uint8Array(await file.slice(flagOffset, flagOffset + 1).arrayBuffer());
        if (flag.length !== 1) return null;
        const isEncrypted = flag[0];

        if (isEncrypted === FLAG_V2_GCM) return readV2Header(file, markerIndex);
        if (isEncrypted !== 0 && isEncrypted !== 1 && isEncrypted !== 2) return null;

        // 旧布局：flag(1) + nameLen(1) + name + [密钥哈希 16] + [nonce 12]
        if (file.size < flagOffset + 2) return null;
        const nameLenBytes = new Uint8Array(await file.slice(flagOffset + 1, flagOffset + 2).arrayBuffer());
        const nameLen = nameLenBytes[0];
        if (nameLen < 1) return null;

        const nameStart = flagOffset + 2;
        const nameEnd = nameStart + nameLen;
        if (nameEnd > file.size) return null;

        const originalName = decodeHiddenName(new Uint8Array(await file.slice(nameStart, nameEnd).arrayBuffer()));
        if (!originalName) return null;

        const extra = isEncrypted ? 16 + (isEncrypted === 2 ? 12 : 0) : 0;
        const contentStart = nameEnd + extra;
        if (contentStart > file.size) return null;

        return { markerIndex, isEncrypted, nameLen, originalName, hashStart: nameEnd, contentStart };
      }

      // v2 头部解析：所有字段都做范围校验，避免恶意文件拖死标签页
      async function readV2Header(file, markerIndex) {
        const fixedEnd = markerIndex + V2_FIXED_PREFIX;
        if (file.size < fixedEnd) return null;

        const fixed = new Uint8Array(await file.slice(markerIndex, fixedEnd).arrayBuffer());
        if (fixed.length !== V2_FIXED_PREFIX) return null;
        const view = new DataView(fixed.buffer);

        const nameLen = fixed[50];
        const kdfId = fixed[9];
        const iterations = view.getUint32(10, false);
        const chunkSize = view.getUint32(38, false);
        const payloadLen = Number(view.getBigUint64(42, false));

        if (nameLen < 1) return null;
        if (kdfId !== KDF_PBKDF2_SHA256) return null;
        if (iterations < MIN_KDF_ITERATIONS || iterations > MAX_KDF_ITERATIONS) return null;
        if (chunkSize < MIN_GCM_CHUNK || chunkSize > MAX_GCM_CHUNK) return null;
        if (!Number.isSafeInteger(payloadLen) || payloadLen < 0) return null;
        if (recordCount(payloadLen, chunkSize) > MAX_RECORD_COUNT) return null;

        const nameStart = fixedEnd;
        const nameEnd = nameStart + nameLen;
        const keyIdStart = nameEnd;
        const contentStart = keyIdStart + KEY_ID_LEN;
        if (contentStart > file.size) return null;
        // 明文长度 + 每条记录的 [长度前缀 + tag] 必须装得下，避免谎报长度
        const expectedSize = contentStart + payloadLen + recordCount(payloadLen, chunkSize) * RECORD_OVERHEAD;
        if (expectedSize > file.size) return null;

        const nameBytes = new Uint8Array(await file.slice(nameStart, nameEnd).arrayBuffer());
        const originalName = decodeHiddenName(nameBytes);
        if (!originalName) return null;

        const keyIdBytes = new Uint8Array(await file.slice(keyIdStart, contentStart).arrayBuffer());
        if (keyIdBytes.length !== KEY_ID_LEN) return null;

        return {
          markerIndex,
          isEncrypted: FLAG_V2_GCM,
          nameLen,
          originalName,
          hashStart: 0,
          contentStart,
          v2: {
            kdfId,
            iterations,
            salt: fixed.slice(14, 30),
            ivBase: fixed.slice(30, 38),
            chunkSize,
            payloadLen,
            contentStart,
            aad: fixed.subarray(V2_AAD_START, V2_AAD_END),
            keyId: bytesToHex(keyIdBytes),
          },
        };
      }

      async function disguiseFile() {
        const disguiseStatus = document.getElementById("disguiseStatus");
        const btn = document.getElementById("disguiseBtn");
        let writable = null;
        try {
          updateStatus(disguiseStatus, getRandomStatus("disguise-processing"), true, { autoHide: false });
          const cover = document.getElementById("fakeCover").files[0];
          const hiddenFiles = Array.from(document.getElementById("fakeInput").files);
          const result = document.getElementById("disguiseResult");
          // 未设置口令时使用内置默认密钥：文件始终是加密的，避免被其它工具直接读取
          const userKey = document.getElementById("keyInput").value || null;
          const key = userKey || DEFAULT_KEYS[0];
          const preview = document.getElementById("disguisePreview");
          result.innerHTML = "";
          preview.innerHTML = "";

          if (!cover) {
            updateStatus(disguiseStatus, "请选择表面文件", false);
            return;
          }

          if (hiddenFiles.length === 0) {
            updateStatus(disguiseStatus, "请选择至少一个隐藏文件", false);
            return;
          }

          const hiddenName = hiddenFiles.length === 1 ? hiddenFiles[0].name : "合集.zip";
          const hiddenNameBytes = new TextEncoder().encode(hiddenName);
          if (hiddenNameBytes.length > 255) {
            throw new Error("隐藏文件名超过 255 字节，请缩短文件名");
          }

          const originalName = cover.name;
          const ext = originalName.split(".").pop();
          const mime = getExtensionMime(ext);
          const disguisedFileName = hiddenName.split(".").slice(0, -1).join(".") + "." + cover.name.split(".").pop();

          // 体积较大时优先流式写盘：必须在用户手势有效期内先要句柄
          const estimatedPayload = hiddenFiles.reduce((n, f) => n + f.size, 0) + hiddenFiles.length * 1024;
          const estimatedTotal = cover.size + estimatedPayload;
          if (wantDirectSave(estimatedTotal)) {
            try {
              writable = await openFileSink(disguisedFileName);
            } catch (e) {
              if (e && e.name === "AbortError") {
                updateStatus(disguiseStatus, "已取消保存", false);
                return;
              }
              writable = null;
            }
          }
          if (!writable && inMemoryTooLarge(estimatedTotal)) {
            const warn = document.createElement("div");
            warn.textContent = memoryHint(estimatedTotal);
            warn.style.color = "#f59e0b";
            warn.style.fontSize = "0.95rem";
            result.appendChild(warn);
          }
          if (hiddenFiles.length > 1 && estimatedPayload > IN_MEMORY_WARN_BYTES) {
            const warn = document.createElement("div");
            warn.textContent = "提示：多文件会先在内存中打包成 zip，当前总量较大，建议分批处理。";
            warn.style.color = "#f59e0b";
            warn.style.fontSize = "0.95rem";
            result.appendChild(warn);
          }

          const hiddenBlob = hiddenFiles.length === 1 ? hiddenFiles[0] : await createZipBlob(hiddenFiles);
          const payloadLen = hiddenBlob.size;

          // 无论用户是否输入口令，都产出 v2 容器（flag 3）
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const ivBase = crypto.getRandomValues(new Uint8Array(8));
          const keyIdBytes = crypto.getRandomValues(new Uint8Array(KEY_ID_LEN));
          const fileKeyId = bytesToHex(keyIdBytes);
          const header = buildV2Header({
            nameBytes: hiddenNameBytes,
            salt,
            ivBase,
            payloadLen,
            iterations: KDF_ITERATIONS,
            chunkSize: GCM_CHUNK_SIZE,
            keyId: keyIdBytes,
          });
          const aad = header.subarray(V2_AAD_START, V2_AAD_END);
          updateStatus(disguiseStatus, "正在派生密钥…", true, { autoHide: false });
          const rawKey = await deriveRawKey(key, salt, KDF_ITERATIONS);
          const gcmKey = await importAesKey(rawKey);

          const overhead = recordCount(payloadLen, GCM_CHUNK_SIZE) * RECORD_OVERHEAD;
          const totalBytes = cover.size + header.length + payloadLen + overhead;

          if (btn) setButtonProgress(btn, 0);
          const parts = [];
          let written = 0;
          const emit = async (chunk) => {
            const n = chunk.byteLength !== undefined ? chunk.byteLength : chunk.length;
            if (writable) await writable.write(chunk);
            else parts.push(chunk);
            written += n;
            if (btn && totalBytes > 0) setButtonProgress(btn, Math.min(1, written / totalBytes));
          };

          await forEachStreamChunk(cover.stream(), emit);
          await emit(header);

          for await (const record of encryptedRecords(hiddenBlob, gcmKey, ivBase, aad, GCM_CHUNK_SIZE)) {
            await emit(record);
          }

          // 只记忆用户自己设置的口令；默认密钥无需记忆
          if (userKey) saveKeyEntry(fileKeyId, userKey, rememberPreferred() ? rawKey : null);

          if (writable) {
            await writable.close();
            writable = null;
            const done = document.createElement("div");
            done.className = "download-link";
            done.textContent = "已保存伪装文件: " + disguisedFileName;
            result.appendChild(done);
            updateStatus(disguiseStatus, getRandomStatus("disguise-done"), true);
            if (btn) clearButtonProgress(btn);
            return;
          }

          const outputBlob = new Blob(parts, { type: mime });
          if (disguiseObjectURL) URL.revokeObjectURL(disguiseObjectURL);
          const url = URL.createObjectURL(outputBlob);
          disguiseObjectURL = url;
          const a = document.createElement("a");
          a.href = url;
          a.download = disguisedFileName;
          a.textContent = "下载伪装文件: " + a.download;
          a.className = "download-link";
          result.appendChild(a);
          updateStatus(disguiseStatus, getRandomStatus("disguise-done"), true);
          renderPreview(preview, mime, url);

          if (btn) clearButtonProgress(btn);

        } catch (error) {
          if (writable) {
            try { await writable.abort(); } catch (e) {}
          }
          updateStatus(disguiseStatus, "处理出错: " + (error && error.message ? error.message : String(error)), false);
          const btnErr = document.getElementById("disguiseBtn");
          if (btnErr) clearButtonProgress(btnErr);
        }
      }
    
      async function restoreFile() {
        const restoreStatus = document.getElementById("restoreStatus");
        const file = document.getElementById("restoreInput").files[0];
        const keyInput = document.getElementById("keyInput")?.value || "";
        const btn = document.getElementById("restoreBtn");
        let writable = null;

        if (!file) {
          updateStatus(restoreStatus, "请选择伪装文件", false);
          return;
        }

        updateStatus(restoreStatus, getRandomStatus("reveal-processing"), true, { autoHide: false });

        const preview = document.getElementById("restorePreview");
        preview.innerHTML = "";

        try {
          const CHUNK_SIZE = 1024 * 1024;
          const totalSize = file.size;
          let offset = 0;
          let buffer = new Uint8Array();
          let headerInfo = null;

          if (btn) setButtonProgress(btn, 0);
          while (offset < totalSize && !headerInfo) {
            const chunk = new Uint8Array(await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer());
            if (!chunk.length) break;

            const combined = new Uint8Array(buffer.length + chunk.length);
            combined.set(buffer);
            combined.set(chunk, buffer.length);

            for (let i = 0; i <= combined.length - MARKER_LEN; i++) {
              if (!markerAt(combined, i)) continue;
              // 封面本身也可能包含同样的字节，只有元数据自洽的命中才算有效
              headerInfo = await readDisguiseHeader(file, offset - buffer.length + i);
              if (headerInfo) break;
            }

            if (headerInfo) break;

            buffer = chunk.slice(-MARKER_LEN);
            offset += chunk.length;

            if (btn) setButtonProgress(btn, Math.min(0.98, offset / totalSize));
          }

          if (!headerInfo) throw new Error("未找到标记，无法还原");

          const { isEncrypted, originalName } = headerInfo;
          const ext = originalName.split(".").pop();
          const restoredMime = getExtensionMime(ext);
          const fileKeyId = headerInfo.v2 ? headerInfo.v2.keyId : null;
          const stored = lookupKeyEntry(fileKeyId, file.name);
          const typedKey = keyInput || (stored && stored.password ? stored.password : "");

          const box = document.getElementById("restoreResult");
          box.innerHTML = "";

          // ===== v2：PBKDF2-HMAC-SHA256 + AES-256-GCM =====
          if (isEncrypted === FLAG_V2_GCM) {
            const v2 = headerInfo.v2;

            updateStatus(restoreStatus, "正在派生密钥…", true, { autoHide: false });
            let gcmKey = null;
            let firstPlain = null;
            if (stored && stored.rawKey) {
              // “在此设备记住”存的是该文件的派生密钥，直接导入，省掉一次 PBKDF2
              gcmKey = await importAesKey(stored.rawKey);
            } else {
              // 没有输入口令时依次尝试内置默认密钥；输入了口令就只认口令
              const candidates = typedKey ? [typedKey] : DEFAULT_KEYS;
              for (const candidate of candidates) {
                const candidateKey = await deriveAesKey(candidate, v2.salt, v2.iterations);
                const plain = await probeFirstRecord(file, v2, candidateKey);
                if (plain) {
                  gcmKey = candidateKey;
                  firstPlain = plain;
                  break;
                }
              }
              if (!gcmKey) {
                throw new Error(typedKey
                  ? "密钥不正确，或文件已被篡改"
                  : "密钥不正确，或文件已损坏；如果这是你设置过口令的文件，请输入口令后重试");
              }
            }

            if (wantDirectSave(v2.payloadLen)) {
              try {
                writable = await openFileSink(originalName);
              } catch (e) {
                if (e && e.name === "AbortError") {
                  updateStatus(restoreStatus, "已取消保存", false);
                  if (btn) clearButtonProgress(btn);
                  return;
                }
                writable = null;
              }
            }

            if (writable) {
              let written = 0;
              for await (const plain of decryptedRecords(file, v2, gcmKey, firstPlain)) {
                await writable.write(plain);
                written += plain.length;
                if (btn) setButtonProgress(btn, Math.min(1, written / Math.max(1, v2.payloadLen)));
              }
              await writable.close();
              writable = null;
              const done = document.createElement("div");
              done.className = "download-link";
              done.textContent = "已保存还原文件: " + originalName;
              box.appendChild(done);
              updateStatus(restoreStatus, getRandomStatus("reveal-done"), true);
              if (btn) clearButtonProgress(btn);
              return;
            }

            if (inMemoryTooLarge(v2.payloadLen)) {
              const warn = document.createElement("div");
              warn.textContent = memoryHint(v2.payloadLen);
              warn.style.color = "#f59e0b";
              warn.style.fontSize = "0.95rem";
              box.appendChild(warn);
            }

            const plainChunks = [];
            let bytesRead = 0;
            for await (const plain of decryptedRecords(file, v2, gcmKey, firstPlain)) {
              plainChunks.push(plain);
              bytesRead += plain.length;
              if (btn) setButtonProgress(btn, Math.min(1, bytesRead / Math.max(1, v2.payloadLen)));
            }
            const typedBlob = new Blob(plainChunks, { type: restoredMime });

            if (restoreObjectURL) URL.revokeObjectURL(restoreObjectURL);
            const url = URL.createObjectURL(typedBlob);
            restoreObjectURL = url;

            const a = document.createElement("a");
            a.href = url;
            a.download = originalName;
            a.textContent = "下载还原文件: " + originalName;
            a.className = "download-link";
            box.appendChild(a);

            updateStatus(restoreStatus, getRandomStatus("reveal-done"), true);
            renderPreview(preview, restoredMime, url);
            if (btn) clearButtonProgress(btn);
            return;
          }

          // ===== 旧格式（flag 0/1/2）：保持原有逻辑，避免历史文件失效 =====
          // 注意：旧文件可能完全没有设置密钥（flag 0），这类文件不需要任何口令。
          const { hashStart, contentStart } = headerInfo;
          let contentStream = file.slice(hashStart).stream();
          let restoredName = originalName;
          let decryptionFailed = false;

          if (isEncrypted) {
            if (!typedKey) {
              decryptionFailed = true;
              restoredName = Math.random().toString(36).substring(2, 10);
            } else {
              const hashBuffer = new Uint8Array(await file.slice(hashStart, hashStart + 16).arrayBuffer());
              const expectedHash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(typedKey))).slice(0, 16);
              const isMatch = hashBuffer.length === expectedHash.length && hashBuffer.every((b, i) => b === expectedHash[i]);
              if (!isMatch) {
                decryptionFailed = true;
                restoredName = Math.random().toString(36).substring(2, 10);
              } else if (isEncrypted === 1) {
                contentStream = file.slice(contentStart).stream().pipeThrough(createXORTransformStream(typedKey));
                restoredName = originalName;
              } else {
                const nonceBuf = new Uint8Array(await file.slice(contentStart - 12, contentStart).arrayBuffer());
                contentStream = file.slice(contentStart).stream().pipeThrough(createAesCtrTransformStream(typedKey, nonceBuf, false));
                restoredName = originalName;
              }
            }
          }

          const contentTotal = Math.max(1, totalSize - contentStart);
          const reader = contentStream.getReader();
          const chunks = [];
          let bytesRead = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            const byteLen = value && (value.byteLength || value.length || 0);
            bytesRead += byteLen;
            if (btn) setButtonProgress(btn, Math.min(1, bytesRead / contentTotal));
          }
          const typedBlob = new Blob(chunks, { type: restoredMime });

          if (restoreObjectURL) URL.revokeObjectURL(restoreObjectURL);
          const url = URL.createObjectURL(typedBlob);
          restoreObjectURL = url;

          const a = document.createElement("a");
          a.href = url;
          a.download = restoredName;
          a.textContent = (restoredName === originalName ? "下载还原文件: " : "密钥错误，下载解密失败数据: ") + restoredName;
          a.className = "download-link";

          updateStatus(restoreStatus, getRandomStatus("reveal-done"), true);
          box.appendChild(a);

          if (!decryptionFailed) {
            renderPreview(preview, restoredMime, url);
          } else {
            const note = document.createElement("div");
            note.textContent = "密钥不正确或数据已损坏，仅可下载未解密的原始数据。";
            note.style.opacity = "0.88";
            note.style.fontSize = "0.95rem";
            preview.appendChild(note);
          }

        if (btn) clearButtonProgress(btn);

        } catch (err) {
          if (writable) {
            try { await writable.abort(); } catch (e) {}
          }
          document.getElementById("restoreResult").innerHTML = "";
          document.getElementById("restorePreview").innerHTML = "";
          const isNotDisguised = err.message && err.message.includes("未找到标记");
          if (isNotDisguised) {
            updateStatus(restoreStatus, "不是伪装文件", false);
          } else {
            updateStatus(restoreStatus, "处理出错: " + (err && err.message ? err.message : String(err)), false);
          }

          const btnErr = document.getElementById("restoreBtn");
          if (btnErr) clearButtonProgress(btnErr);
        }
      }
    
      const overlayPanel = document.getElementById("overlayPanel");
      const overlayOpacityInput = document.getElementById("overlayOpacityInput");
      const overlayBlurInput = document.getElementById("overlayBlurInput");
      const bgDisplayMode = document.getElementById("bgDisplayMode");
      const modeToggleBtn = document.getElementById("modeToggleBtn");
      const customizeBtn = document.getElementById("customizeBtn");
      const customizePanel = document.getElementById("customizePanel");
      const bgImageInput = document.getElementById("bgImageInput");
      const resetBtn = document.getElementById("resetBtn");
        
      overlayOpacityInput.oninput = () => {
        localStorage.setItem("overlayOpacity", overlayOpacityInput.value);
        overlayPanel.style.opacity = parseInt(overlayOpacityInput.value) / 100;
      };
    
      overlayBlurInput.oninput = () => {
        const blurValue = overlayBlurInput.value;
        overlayPanel.style.backdropFilter = `blur(${blurValue}px)`;
        overlayPanel.style.webkitBackdropFilter = `blur(${blurValue}px)`;
        localStorage.setItem("overlayBlur", blurValue);
      };
    
      async function applyNormalModeSettings() {
        const textColor = localStorage.getItem("textColor") || "#333";
        const bgColor = localStorage.getItem("bgColor") || "#f7f8fc";
        const overlayColor = localStorage.getItem("overlayColor") || "#ffffff";
        const overlayOpacity = localStorage.getItem("overlayOpacity") || "100";
        const overlayBlur = localStorage.getItem("overlayBlur") || "5";
        const bgDisplay = localStorage.getItem("bgDisplay") || "stretch";
      
        overlayPanel.style.backdropFilter = `blur(${overlayBlur}px)`;
        overlayPanel.style.webkitBackdropFilter = `blur(${overlayBlur}px)`;
        overlayPanel.style.opacity = Number(overlayOpacity) / 100;
        document.getElementById("overlayOpacityInput").value = overlayOpacity;
        document.getElementById("overlayOpacityValue").value = overlayOpacity;
        document.getElementById("overlayBlurInput").value = overlayBlur;
        document.getElementById("overlayBlurValue").value = overlayBlur;
      
        const bgImage = await loadBgFromIDB(); 
        if (bgImage) {
          document.body.style.backgroundImage = `url(${bgImage})`;
          document.body.style.backgroundRepeat = (bgDisplay === "repeat") ? "repeat" : "no-repeat";
          if (bgDisplay === "stretch") {
            document.body.style.backgroundSize = "100% 100%";
            document.body.style.backgroundPosition = "center center";
          } else if (bgDisplay === "cover") {
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center center";
          } else if (bgDisplay === "center") {
            document.body.style.backgroundSize = "auto";
            document.body.style.backgroundPosition = "center";
          }
          overlayPanel.style.display = "block";
        } else {
          document.body.style.backgroundImage = "";
          overlayPanel.style.display = "none";
        }
      
        bgDisplayMode.value = bgDisplay;
      }
    
      async function clearIDB() {
        const db = await openIDB();
        const tx = db.transaction("images", "readwrite");
        tx.objectStore("images").delete("bgImage");
      }
    
      function switchMode(toMode = null) {
        const currentMode = localStorage.getItem("displayMode") || "dark";
        const newMode = toMode || (currentMode === "dark" ? "normal" : "dark");
        document.body.classList.toggle("normal-mode", newMode === "normal");
        localStorage.setItem("displayMode", newMode);
        document.getElementById("modeToggleBtn").textContent = newMode === "normal" ? "🌙" : "💡";
        document.getElementById("customizeBtn").classList.toggle("hidden", newMode !== "normal");
        document.getElementById("overlayPanel").style.display = newMode === "normal" ? "block" : "none";
      if (newMode === "normal") applyNormalModeSettings();
        else {
          document.body.removeAttribute("style");
          document.querySelectorAll("*:not(#customizePanel):not(#customizePanel *)").forEach(el => {
            el.style.color = "";
          });
        }
      }
    
      function enableDragAndDrop(labelId, inputId) {
        const label = document.getElementById(labelId);
        const input = document.getElementById(inputId);
      
        label.addEventListener("dragover", e => {
          e.preventDefault();
          label.style.background = "rgba(255,255,255,0.35)";
        });
      
        label.addEventListener("dragleave", e => {
          e.preventDefault();
          label.style.background = "";
        });
      
        label.addEventListener("drop", e => {
          e.preventDefault();
          label.style.background = "";
          input.files = e.dataTransfer.files;
        
          const event = new Event("change", { bubbles: true });
          input.dispatchEvent(event);
        });
      }

      function rearrangeElements() {
        const keyPanel = document.getElementById("keyPanel");
        const keysets = document.querySelector(".keysets");
        const headerSection = document.querySelector(".header-section");
          if (window.innerWidth <= 780) {
            if (keyPanel.parentElement === keysets) {
              headerSection.insertBefore(keyPanel, keysets.nextSibling);
            }
          } else {
            if (keyPanel.parentElement !== keysets) {
              keysets.insertBefore(keyPanel, document.getElementById("clearKeyBtn"));
            }
          }
      }    
      rearrangeElements();    
      window.addEventListener("resize", rearrangeElements);

      enableDragAndDrop("coverLabel", "fakeCover");
      enableDragAndDrop("hiddenLabel", "fakeInput");
      enableDragAndDrop("bgLabel", "bgImageInput");
      enableDragAndDrop("restoreLabel", "restoreInput")
            
      bindSliderWithNumber("overlayOpacityInput", "overlayOpacityValue", (val) => {
        localStorage.setItem("overlayOpacity", val);
        applyNormalModeSettings();
      });
      bindSliderWithNumber("overlayBlurInput", "overlayBlurValue", (val) => {
        localStorage.setItem("overlayBlur", val);
        applyNormalModeSettings();
      });

      const pickrInstances = {};
      let isAnyPickrOpen = false;

      function createColorPicker(elId, localStorageKey, applyStyleCallback, defaultColor) {
        const savedColor = localStorage.getItem(localStorageKey) || defaultColor;
        if ((localStorage.getItem("displayMode") || "dark") === "normal") {
          applyStyleCallback(savedColor);
        }
        document.querySelector(elId).style.backgroundColor = savedColor;
      
        const pickr = Pickr.create({
          el: elId,
          theme: "monolith",
          default: savedColor,
          components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
              hex: true,
              rgba: true,
              input: true,
              clear: false,
              save: false
            }
          }
        });
      
        pickr.on("change", (color) => {
          const rgba = color.toRGBA().toString();
          applyStyleCallback(rgba);
          localStorage.setItem(localStorageKey, rgba);
          const buttonEl = pickr.getRoot().button;
          if (buttonEl) buttonEl.style.setProperty('--pcr-color', rgba);
        });
      
        pickrInstances[localStorageKey] = {
          pickr,
          defaultColor,
          elId,
          callback: applyStyleCallback
        };
        pickr.on('show', () => isAnyPickrOpen = true);
        pickr.on('hide', () => isAnyPickrOpen = false);

        return pickr;
      }
    
      modeToggleBtn.onclick = () => switchMode();
      customizeBtn.onclick = () => customizePanel.classList.toggle("hidden");

      // 原本写在内联 onclick 属性里；CSP 禁止内联事件后改为显式绑定
      document.getElementById("keycfg").addEventListener("click", (e) => toggleKey(e.currentTarget));
      document.getElementById("clearKeyBtn").addEventListener("click", () => clearKeyMapping());
      document.getElementById("disguiseBtn").addEventListener("click", () => disguiseFile());
      document.getElementById("restoreBtn").addEventListener("click", () => restoreFile());
    
      bgImageInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
          const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result;
          await saveBgToIDB(base64);
           applyNormalModeSettings(); 
        } catch (e) {
          updateStatus(document.getElementById("clearKeyStatus"), "图片太大，无法保存背景图", false);
        }
      };
      reader.onerror = () => {
        updateStatus(document.getElementById("clearKeyStatus"), "读取文件时出错", false);
      };
        reader.readAsDataURL(file);
      };
    
      bgDisplayMode.oninput = () => {
        localStorage.setItem("bgDisplay", bgDisplayMode.value);
        applyNormalModeSettings();
      };
    
      document.addEventListener("click", (e) => {
        if (
          !customizePanel.contains(e.target) && 
          !document.getElementById("customizeBtn").contains(e.target) &&
          !isAnyPickrOpen
        ) {
          customizePanel.classList.add("hidden");
        }
      });
    
      document.getElementById("fakeCover").addEventListener("change", function () {
        const span = document.getElementById("coverText");
        span.textContent = this.files.length === 0 ? "请选择表面文件" : this.files[0].name;
      });
    
      document.getElementById("fakeInput").addEventListener("change", function () {
        const span = document.getElementById("hiddenText");
        span.textContent =
          this.files.length === 0
            ? "请选择隐藏文件"
            : this.files.length === 1
            ? this.files[0].name
            : "已选择 " + this.files.length + " 个文件";
      });
    
      document.getElementById("restoreInput").addEventListener("change", function () {
        const span = document.getElementById("restoreText");
        span.textContent = this.files.length === 0 ? "请选择伪装文件" : this.files[0].name;
      });
    
      document.getElementById("bgImageInput").addEventListener("change", function () {
        const fileName = this.files[0].name;
        document.getElementById("bgText").textContent = "当前背景:" + fileName;
        localStorage.setItem("bgImageName", fileName); 
      });
    
      document.getElementById("resetBtn").onclick = () => {
        if (confirm("确定要还原默认外观设置吗？")) {
          localStorage.removeItem("textColor");
          localStorage.removeItem("bgColor");
          localStorage.removeItem("overlayColor");
          localStorage.removeItem("overlayOpacity");
          localStorage.removeItem("bgDisplay");
          localStorage.removeItem("overlayBlur");
          localStorage.removeItem("bgImageName");
          document.getElementById("bgImageInput").value = "";
          document.getElementById("bgText").textContent = "选择背景图";
          for (const key in pickrInstances) {
            const { pickr, defaultColor, elId, callback } = pickrInstances[key];
            pickr.setColor(defaultColor);
            localStorage.setItem(key, defaultColor);
            callback(defaultColor);
          }
          clearIDB();
          applyNormalModeSettings();
        }
      };

      (function () {
        const ANNOTATIONS = [
          { selector: '.title-section', title: '加密选项', text: '加密使用 AES-256-GCM，密钥由 PBKDF2-SHA256（60 万次）从口令派生。未填写口令时使用内置默认密钥——它公开在源码中，只用于阻止常规工具直接读取文件，不提供保密性。文件名不参与校验，改名不影响解密。', highlightSelector: "#keycfg", highlightDuration: 'persistent'},
          { selector: '.card', title: '功能区', text: '帮助文本', highlightDuration: 'persistent' },
          { selector: '#modeToggleBtn', title: '外观切换', text: '点击可在正常模式与黑夜模式之间切换。仅正常模式支持外观自定义。', highlightDuration: 'persistent'}
        ];

        const helpBtn = document.getElementById('helpBtn');
        const helpOverlay = document.getElementById('helpOverlay');
        let tipEntries = [];
        let closeHandler = null;
        let repositionObserver = null;
        let isPositioning = false;
        let resizeDebounce = null;
        let mutationDebounce = null;

        function buildTips() {
          tipEntries.forEach(t => {
            if (t.tipEl && t.tipEl.parentNode) t.tipEl.parentNode.removeChild(t.tipEl);
            if (t.highlightEl && t.highlightEl.parentNode) t.highlightEl.parentNode.removeChild(t.highlightEl);
            if (t.highlightTimer) clearTimeout(t.highlightTimer);
          });
          tipEntries = [];

          ANNOTATIONS.forEach((ann) => {
            const nodes = Array.from(document.querySelectorAll(ann.selector));
            if (!nodes.length) return;
            nodes.forEach((node, idx) => {
              const tip = document.createElement('div');
              tip.className = 'help-tip';

              const title = document.createElement('h3');
              const titleText = (node.dataset && node.dataset.helpTitle) ? node.dataset.helpTitle : (ann.title + (nodes.length > 1 ? ` ${idx + 1}` : ''));
              title.textContent = titleText;
              const p = document.createElement('p');
              const textContent = (node.dataset && node.dataset.helpText) ? node.dataset.helpText : ann.text;
              p.textContent = textContent;
              tip.appendChild(title);
              tip.appendChild(p);
              document.body.appendChild(tip);


              const highlightSpec = node.dataset && node.dataset.helpHighlight ? node.dataset.helpHighlight : (ann.highlightSelector ? ann.highlightSelector : null);
              const durationAttr = (node.dataset && node.dataset.helpHighlightDuration) ? node.dataset.helpHighlightDuration : (ann.highlightDuration !== undefined ? String(ann.highlightDuration) : null);
              let highlightDuration = null;
              if (durationAttr) {
                const da = String(durationAttr).trim().toLowerCase();
                if (da === 'persistent' || da === 'stay' || da === 'infinite' || da === '0') {
                  highlightDuration = 'persistent';
                } else {
                  const n = parseInt(da, 10);
                  if (!isNaN(n) && n > 0) highlightDuration = n;
                }
              }
              tipEntries.push({ targetEl: node, tipEl: tip, highlightSpec: highlightSpec, highlightDuration: highlightDuration, highlightEl: null, highlightTimer: null });
            });
          });
        }

        function positionTips() {

          if (isPositioning) return;
          isPositioning = true;

          window.requestAnimationFrame(() => {
            try {

              if (repositionObserver) {
                try { repositionObserver.disconnect(); } catch (e) {}
              }

              tipEntries.forEach((entry) => {
                const { targetEl, tipEl } = entry;

                if (!document.body.contains(targetEl)) {
                  if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
                  return;
                }

                const rect = targetEl.getBoundingClientRect();
                tipEl.style.opacity = '0';
                tipEl.style.left = '0px';
                tipEl.style.top = '0px';

                const tipRect = tipEl.getBoundingClientRect();

                let tipLeft = rect.left + (rect.width - tipRect.width) / 2;

                let tipTop = rect.top + (rect.height - tipRect.height) / 2;


                if (tipTop < 8) {
                  tipTop = rect.bottom + 4;
                }

                const viewportW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                if (tipLeft < 8) tipLeft = 8;
                if (tipLeft + tipRect.width > viewportW - 8) tipLeft = Math.max(8, viewportW - tipRect.width - 8);

                tipEl.style.left = (tipLeft) + 'px';
                tipEl.style.top = (tipTop) + 'px';
                tipEl.style.opacity = '1';
                tipEl.style.transform = 'translateY(0) scale(1)';

                if (entry.highlightEl) {
                  updateHighlightPosition(entry);
                }
              });

              updateHighlights();
            } catch (err) {
            } finally {

              setTimeout(() => {
                if (helpOverlay.style.display === 'block') {
                  if (!repositionObserver) {
                    repositionObserver = new MutationObserver(mutationHandler);
                  }
                  try {
                    repositionObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style','class'] });
                  } catch (e) {}
                }
                isPositioning = false;
              }, 40);
            }
          });
        }

        function updateHighlightPosition(entry) {
          if (!entry || !entry.highlightEl) return;
          let highlightTarget = null;
          if (entry.highlightSpec) {
            try { highlightTarget = document.querySelector(entry.highlightSpec); } catch (e) { highlightTarget = null; }
          }
          if (!highlightTarget) highlightTarget = entry.targetEl;
          if (!highlightTarget || !document.body.contains(highlightTarget)) return;

          const r = highlightTarget.getBoundingClientRect();
          const prev = entry._lastHLRect;
          const needUpdate = !prev || prev.left !== Math.round(r.left) || prev.top !== Math.round(r.top) || prev.width !== Math.round(r.width) || prev.height !== Math.round(r.height);
          if (!needUpdate) return;

          entry._lastHLRect = { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
          const hl = entry.highlightEl;
          hl.style.left = r.left + 'px';
          hl.style.top = r.top + 'px';
          hl.style.width = r.width + 'px';
          hl.style.height = r.height + 'px';
        }

        function updateHighlights() {
          for (const entry of tipEntries) {
            if (entry.highlightEl) updateHighlightPosition(entry);
          }
        }

        function createHighlightForEntry(entry) {
          let highlightTarget = null;
          if (entry.highlightSpec) {
            try { highlightTarget = document.querySelector(entry.highlightSpec); } catch (e) { highlightTarget = null; }
          }
          if (!highlightTarget) highlightTarget = entry.targetEl;

          if (!highlightTarget || !document.body.contains(highlightTarget)) return;

          const rect = highlightTarget.getBoundingClientRect();
          const hl = document.createElement('div');
          hl.className = 'help-highlight';
          hl.style.left = rect.left + 'px';
          hl.style.top = rect.top + 'px';
          hl.style.width = rect.width + 'px';
          hl.style.height = rect.height + 'px';
          hl.style.opacity = '0';
          hl.style.transform = 'scale(0.98)';
          document.body.appendChild(hl);

          entry._lastHLRect = { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };


          requestAnimationFrame(() => {
            hl.style.transition = 'opacity 300ms ease, transform 300ms ease';
            hl.style.opacity = '1';
            hl.style.transform = 'scale(1)';
          });

          const dur = (entry.highlightDuration === 'persistent') ? 'persistent' : (typeof entry.highlightDuration === 'number' ? entry.highlightDuration : 1200);

          if (dur === 'persistent') {
            entry.highlightEl = hl;
            entry.highlightTimer = null;
            return;
          }
          const t = setTimeout(() => {
            try {
              hl.style.opacity = '0';
              hl.style.transform = 'scale(1.02)';
              setTimeout(() => { if (hl && hl.parentNode) hl.parentNode.removeChild(hl); }, 350);
            } catch (e) {}
          }, dur);

          entry.highlightEl = hl;
          entry.highlightTimer = t;
        }

        function mutationHandler(mutations) {
          let relevant = false;
          for (const m of mutations) {
            const target = m.target;

            if (target && target.closest && (target.closest('.help-tip') || target.closest('.help-highlight'))) continue;
            relevant = true;
            break;
          }
          if (!relevant) return;

          if (mutationDebounce) clearTimeout(mutationDebounce);
          mutationDebounce = setTimeout(positionTips, 80);
        }

        function openHelp() {
          buildTips();
          helpOverlay.style.display = 'block';
          helpOverlay.setAttribute('aria-hidden', 'false');

          positionTips();

          requestAnimationFrame(() => {
            tipEntries.forEach((entry) => createHighlightForEntry(entry));
          });

          window.addEventListener('resize', () => {
            if (resizeDebounce) clearTimeout(resizeDebounce);
            resizeDebounce = setTimeout(positionTips, 80);
          });
          window.addEventListener('scroll', () => {
            if (resizeDebounce) clearTimeout(resizeDebounce);
            resizeDebounce = setTimeout(positionTips, 80);
          }, true);

          if (!repositionObserver) {
            repositionObserver = new MutationObserver(mutationHandler);
          }

          try {
            repositionObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style','class'] });
          } catch (e) {}

          setTimeout(() => {
            closeHandler = () => closeHelp();
            document.addEventListener('click', closeHandler);
          }, 0);
        }

        function closeHelp() {

          tipEntries.forEach(t => {
            if (t.tipEl && t.tipEl.parentNode) t.tipEl.parentNode.removeChild(t.tipEl);
            if (t.highlightEl && t.highlightEl.parentNode) t.highlightEl.parentNode.removeChild(t.highlightEl);
            if (t.highlightTimer) clearTimeout(t.highlightTimer);
          });
          tipEntries = [];
          helpOverlay.style.display = 'none';
          helpOverlay.setAttribute('aria-hidden', 'true');

          window.removeEventListener('resize', positionTips);
          window.removeEventListener('scroll', positionTips, true);
          if (repositionObserver) {
            try { repositionObserver.disconnect(); } catch (e) {}
            repositionObserver = null;
          }
          if (closeHandler) {
            document.removeEventListener('click', closeHandler);
            closeHandler = null;
          }
          if (resizeDebounce) { clearTimeout(resizeDebounce); resizeDebounce = null; }
          if (mutationDebounce) { clearTimeout(mutationDebounce); mutationDebounce = null; }
        }

        helpBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const isOpen = helpOverlay.style.display === 'block';
          if (isOpen) {
            closeHelp();
          } else {
            openHelp();
          }
        });

        function triggerAnimation(el, cls) {
          if (!el) return;
          el.classList.remove(cls);
          void el.offsetWidth;
          el.classList.add(cls);
          const onEnd = () => { el.classList.remove(cls); el.removeEventListener('animationend', onEnd); };
          el.addEventListener('animationend', onEnd);
        }
        customizeBtn.addEventListener('click', (e) => {
          triggerAnimation(customizeBtn, 'rotate-center');
        });
        helpBtn.addEventListener('click', (e) => {
          triggerAnimation(helpBtn, 'rotate-bottom');
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && helpOverlay.style.display === 'block') closeHelp();
        });

        window.addEventListener('orientationchange', () => { if (helpOverlay.style.display === 'block') positionTips(); });
      })();
    
      window.addEventListener("DOMContentLoaded", async () => {
        const missingDeps = missingDependencies();
        const missingCaps = missingCapabilities();
        if (missingDeps.length || missingCaps.length) {
          const message = [
            missingDeps.length ? "依赖未加载：" + missingDeps.join("、") + "（请确认 docs/vendor/ 已一起部署）" : "",
            missingCaps.length ? "缺少 " + missingCaps.join("、") + "，无法加密与还原。请通过 https 或 localhost 打开本页" : "",
          ].filter(Boolean).join("；");
          showBanner(message);
        }
        configureZip();

        const savedMode = localStorage.getItem("displayMode") || "dark";
        switchMode(savedMode);
        const savedBgName = localStorage.getItem("bgImageName");
        if (savedBgName) {
          document.getElementById("bgText").textContent = "当前背景:" + savedBgName;
        }

        if (typeof Pickr !== "undefined") {
          createColorPicker("#textColorInput", "textColor", (val) => {
            document.body.style.color = val;
          }, "rgba(56,56,56,1)");

          createColorPicker("#bgColorInput", "bgColor", (val) => {
            document.body.style.backgroundColor = val;
          }, "rgba(255,255,255,1)");

          createColorPicker("#overlayColorInput", "overlayColor", (val) => {
            document.getElementById("overlayPanel").style.backgroundColor = val;
          }, "rgba(255,255,255,0)");
        } else {
          // 取色器不可用时隐藏对应行，其余外观设置照常
          const colorGroup = document.querySelector(".color-group");
          if (colorGroup) colorGroup.classList.add("hidden");
        }

        const rememberCheckbox = document.getElementById("rememberKey");
        const directSaveCheckbox = document.getElementById("directSave");
        const clearBtn = document.getElementById("clearKeyBtn");
        const keyPanel = document.getElementById("keyPanel");
        const button = document.getElementById("keycfg");
        const keyPanelOpen = localStorage.getItem("keyPanelOpen") === "true";      
        if (keyPanelOpen) {
          clearBtn.classList.remove("hidden");
          keyPanel.classList.remove("hidden");
        } else {
          clearBtn.classList.add("hidden");
          keyPanel.classList.add("hidden");
        }
        const isHidden = keyPanel.classList.contains("hidden");
        button.textContent = isHidden ? "加密处理配置" : "隐藏加密配置";
        // 部署后新旧文件可能短暂混用（GitHub Pages 缓存约 10 分钟）：
        // 找不到元素时降级，而不是让整个初始化抛错
        if (rememberCheckbox) {
          rememberCheckbox.checked = rememberPreferred();
          rememberCheckbox.addEventListener("change", () => {
            setRememberPreferred(rememberCheckbox.checked);
            if (!rememberCheckbox.checked) {
              // 关掉开关时把已保存的设备端密钥一并清掉
              try { localStorage.removeItem(KEY_DEVICE_STORE); } catch (e) {}
            }
          });
        }
        if (directSaveCheckbox) {
          directSaveCheckbox.checked = directSaveEnabled();
          directSaveCheckbox.addEventListener("change", () => {
            setDirectSave(directSaveCheckbox.checked);
          });
        }
        // 旧版本遗留的键，清理掉避免残留在存储里
        localStorage.removeItem("useAdvancedAES");
        localStorage.removeItem("skipEncryption");
      });

        function _resolveBtn(elOrId) {
          if (typeof elOrId === 'string') return document.getElementById(elOrId);
          return elOrId;
        }

        function setButtonProgress(btnOrId, fraction) {
          const btn = _resolveBtn(btnOrId);
          if (!btn) return;
          const f = Math.max(0, Math.min(1, Number(fraction) || 0));
          btn.classList.add('progressing');
          btn.classList.remove('finished');
          btn.style.setProperty('--progress', (f * 100) + '%');
          btn.setAttribute('aria-valuemin', '0');
          btn.setAttribute('aria-valuemax', '100');
          btn.setAttribute('aria-valuenow', Math.round(f * 100));
        }

        function clearButtonProgress(btnOrId) {
          const btn = _resolveBtn(btnOrId);
          if (!btn) return;
          btn.classList.add('finished');
          setTimeout(() => {
            btn.classList.remove('progressing', 'finished');
            btn.style.setProperty('--progress', '0%');
            btn.removeAttribute('aria-valuenow');
          }, 260);
        }
    