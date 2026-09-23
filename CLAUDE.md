@AGENTS.md

## Claude Code 專屬的設定

共用的內容都在上面引入的 `AGENTS.md`，這裡只放 Claude Code 才讀得到的部分。

### `.claude/agents/`

七個 subagent 對應[貢獻者百科](https://anoni.net/docs/community/contributor-handbook/)「AI 協作」一節的角色。角色的做法與回報格式寫在百科，agent 檔只負責掛上工具與模型，所以要調整角色先改百科。

| agent | 百科裡的角色 | 時機 |
|---|---|---|
| `news-scout` | 選題雷達 | 動筆前 |
| `angle-strategist` | 切角顧問 | 動筆前 |
| `post-research` | 資料蒐集 | 動筆前 |
| `structure-editor` | 結構審查 | 審稿 |
| `line-editor` | 文字潤稿 | 審稿 |
| `fact-checker` | 事實查核 | 審稿 |
| `target-reader` | 目標讀者 | 審稿 |

### `.claude/skills/drawio/`

取自上游 [jgraph/drawio-mcp](https://github.com/jgraph/drawio-mcp)（Apache-2.0，授權全文在同目錄的 `LICENSE`），開頭加了一段這個 repo 的用法：原始檔放 `docs/diagrams/`、存成 `.drawio.svg`、不覆蓋同名檔。上游更新時整份換掉再補回那一段。

### 不進版控的部分

`.claude/settings.local.json`（個人的權限設定）與 `.claude/worktrees/`（本機 worktree）留在各自的電腦上。
