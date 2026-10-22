# kexin.uno 迁移到 Cloudflare：操作清单

目标：把演示地址从「每天变的 trycloudflare 临时域名」换成固定的 **demo.kexin.uno**。

## 迁移前现状（已核对）

| 记录 | 值 | 说明 |
|---|---|---|
| NS | `dns17.hichina.com` / `dns18.hichina.com` | 阿里云托管 |
| A `@` | 185.199.108.153 / .109 / .110 / .111 | GitHub Pages |
| CNAME `www` | `tang-0118.github.io` | GitHub Pages |
| MX | 无 | **没有企业邮箱，迁移不会断邮件** |
| TXT | 无 | 无 SPF / 无验证记录 |

结论：只有 2 类记录要搬，5 分钟能搬完。

## 第一步（你的操作）：把域名加进 Cloudflare

1. 打开 https://dash.cloudflare.com/sign-up 注册（免费）
2. 首页点 **Add a site** → 输入 `kexin.uno` → 选 **Free** 套餐
3. Cloudflare 会自动扫描现有记录，**核对它扫到的 5 条**，缺的补上：

| 类型 | 名称 | 内容 | 代理状态 |
|---|---|---|---|
| A | `@` | `185.199.108.153` | **仅 DNS（灰云）** |
| A | `@` | `185.199.109.153` | **仅 DNS（灰云）** |
| A | `@` | `185.199.110.153` | **仅 DNS（灰云）** |
| A | `@` | `185.199.111.153` | **仅 DNS（灰云）** |
| CNAME | `www` | `tang-0118.github.io` | **仅 DNS（灰云）** |

> ⚠️ **必须是灰云（DNS only）**。开橙云会让 GitHub Pages 的 HTTPS 证书签发失败，站点会 526。

4. 记下 Cloudflare 给你的两个 NS，形如：
   ```
   alina.ns.cloudflare.com
   pete.ns.cloudflare.com
   ```

## 第二步（你的操作）：在阿里云改 NS

1. 登录阿里云 → 域名控制台 → `kexin.uno` → **DNS 修改 / 修改 DNS 服务器**
2. 把 `dns17/dns18.hichina.com` 换成 Cloudflare 给的那两个
3. 保存。生效时间通常 10 分钟到 2 小时，最长 24 小时

期间用这个命令看进度：

```powershell
Resolve-DnsName kexin.uno -Type NS
# 看到 xxx.ns.cloudflare.com 就是生效了
```

**这期间网站可能短暂打不开**，属正常。GitHub Pages 的记录已经在 Cloudflare 里，切换完成后自动恢复。

## 第三步（我的操作）：建命名隧道

NS 生效后告诉我，我跑：

```powershell
# 浏览器登录授权（只需一次）
& "E:\Deepseek_projects\tools\cloudflared.exe" tunnel login

# 建隧道 + 绑域名 + 配开机自启（脚本自动完成）
powershell -ExecutionPolicy Bypass -File tools\setup_named_tunnel.ps1
```

脚本会做四件事：

1. `cloudflared tunnel create bagcheck-copilot`
2. `cloudflared tunnel route dns bagcheck-copilot demo.kexin.uno`
3. 写 `%USERPROFILE%\.cloudflared\config.yml`（把 `demo.kexin.uno` 指向本机 `127.0.0.1:8081`）
4. 注册登录自启的计划任务，并自检 `https://demo.kexin.uno/health`

## 第四步：收尾

- 网站 `/demo` 页永久指向 `https://demo.kexin.uno`，**再也不用改**
- 简历上的 `kexin.uno/demo` 保持不变（它只是个跳转）
- 临时隧道脚本 `start_demo.ps1` 可以留着备用

## 出问题怎么回滚

阿里云控制台把 NS 改回 `dns17/dns18.hichina.com`，15 分钟内恢复原状。**旧记录不会因为换 NS 被删除**，所以回滚是安全的。
