# 发布到 npm

## 首次配置

将项目和 `.github/workflows/publish.yml` 推送到公开仓库 `happyqu/dsh-plugin-tabs`。

在 npm 包设置的 **Trusted publishing** 中选择 **GitHub Actions**，填写：

| 配置项 | 值 |
| --- | --- |
| Organization or user | `happyqu` |
| Repository | `dsh-plugin-tabs` |
| Workflow filename | `publish.yml` |
| Environment name | 留空 |
| Allowed actions | 允许 `npm publish` |

流程通过 OIDC 发布，无需 `NPM_TOKEN` 或本地 GitHub CLI。配置说明见 [npm 官方文档](https://docs.npmjs.com/trusted-publishers/)。

## 发布版本

先在 `master` 提交所有代码，确保工作区干净，然后执行：

```bash
npm run release
```

脚本默认升级 patch 版本，自动生成版本提交和 `v版本号` 标签，并将分支和该标签一起推送到 `origin`。例如 `0.1.0` 会升级为 `0.1.1`。版本提交和标签说明包含本次提交记录。

也可以指定升级类型：

```bash
npm run release -- minor
npm run release -- major
```

GitHub Actions 收到 `v*` 标签后，校验标签与包版本一致，运行测试、检查打包内容，再发布 npm。正式版使用 `latest`，预发布版使用 `next`。普通代码推送不会发布；已发布的 npm 版本会跳过。

`npm run release` 返回成功表示版本提交和标签已推送，最终发布结果请查看仓库 Actions 页面。

## 失败后重试

如果推送失败，脚本会显示重试命令。按提示推送已生成的版本提交与 tag，不要重复执行版本升级。

如果 Actions 发布失败，修复配置后重跑失败任务，无需删除或重新生成 tag。如果需要修改发布内容，请提交修改并执行新的版本发布。
