# dsh-plugin-tabs

为 DeepSeek Harness 添加会话标签栏，支持多会话切换、拖动排序和批量关闭。

![插件界面预览](https://raw.githubusercontent.com/happyqu/dsh-plugin-tabs/master/assets/screenshot.png)

## 功能

- 点击切换会话，拖动调整标签顺序。
- 标签宽度随标题调整，长标题自动省略。
- 标签较多时，可通过左右箭头滚动查看。
- 支持关闭当前、其他、左侧、右侧或全部标签。
- 双击修改标签显示名称，鼠标中键关闭标签。
- 支持深浅主题和中英文界面，自动保存已打开的标签与排列顺序。

关闭标签不会删除历史会话，关闭全部后进入新会话界面。

## 安装

在 DSH 的插件管理页面选择「添加插件」，输入以下包名，安装后重启应用：

```text
dsh-plugin-tabs
```

命令行安装（以 `web` profile 为例）：

```bash
dsh plugin --profile web add dsh-plugin-tabs
```

安装后重启对应的 DSH 进程并刷新页面。

## 使用

打开会话后自动添加标签。点击 `+` 新建会话，点击 `×` 关闭标签，点击右侧 `…` 管理标签。

| 快捷键 | 操作 |
| --- | --- |
| Ctrl / Cmd + Tab | 下一个标签 |
| Ctrl / Cmd + Shift + Tab | 上一个标签 |
| Ctrl / Cmd + W | 关闭当前标签 |
| Ctrl / Cmd + 1–9 | 切换到对应位置的标签 |

快捷键在输入框外生效，部分组合键可能被浏览器优先处理。
