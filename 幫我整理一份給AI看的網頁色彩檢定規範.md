<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 幫我整理一份給AI看的網頁色彩檢定規範

網頁色彩檢定主要依據 WCAG（Web Content Accessibility Guidelines）無障礙規範，確保文字與背景對比度足夠，讓視障用戶也能清楚閱讀。[^1][^2]

## WCAG 等級標準

WCAG 分為 AA 和 AAA 等級，AI 檢定時應優先檢查對比度比例（Contrast Ratio），計算公式為 (L1 + 0.05) / (L2 + 0.05)，其中 L1 為較亮顏色亮度，L2 為較暗者。[^7][^1]


| 元素類型 | AA 等級 | AAA 等級 |
| :-- | :-- | :-- |
| 一般文字 (<18pt 或 <14pt 粗體) | 4.5:1 | 7:1 [^2][^9] |
| 大型/粗體文字 (≥18pt 或 ≥14pt 粗體) | 3:1 | 4.5:1 [^4][^7] |
| UI 圖示/圖表 | 3:1 | 未定義 [^7] |

## 檢定步驟

- 輸入前景色（如文字 \#000000）和背景色（如 \#FFFFFF）的 RGB/HEX 值，計算對比度。
- 綠色 AAA 表示最佳（≥7:1），綠色 AA 表示及格（≥4.5:1），紅色則失敗。[^3]
- 檢查重點：避免低對比配色如淺灰文字配白底；大字體放寬至 3:1。[^5][^1]


## 推薦工具

使用 Color.review 或 Chrome Lighthouse 自動驗證，AI 可模擬滴管選色並輸出 PASS/FAIL 結果。[^3][^5]
<span style="display:none">[^10][^6][^8]</span>

<div align="center">⁂</div>

[^1]: https://www.webdong.dev/zh-tw/shortpost/guideline-for-color-contrast-in-web/

[^2]: https://metabiz.tw/elementor-tutorials-color-text-rule/

[^3]: https://free.com.tw/color-review/

[^4]: https://www.vtsh.tc.edu.tw/user_guide/guide_html/1-5-%E9%A1%8F%E8%89%B2%E5%BB%BA%E8%AD%B0/

[^5]: https://hackmd.io/@dqry/ryWXzMiOY

[^6]: https://blakecrosley.com/zh-Hant/blog/color-science-interfaces

[^7]: https://web.dev/articles/testing-web-design-color-contrast?hl=zh-tw

[^8]: https://www.eztrust.com.tw/網站視覺設計與常用配色

[^9]: https://design.pdis.tw/docs/style/color/

[^10]: https://ir.lib.nycu.edu.tw/bitstream/11536/43725/1/452201.pdf

