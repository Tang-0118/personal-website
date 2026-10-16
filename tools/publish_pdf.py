# -*- coding: utf-8 -*-
"""把生成好的 PDF 发布到目标路径（目标被预览器占用时自动重试）。
Usage: python tools/publish_pdf.py <src.pdf> <dst.pdf> [retries] [interval_sec]
"""

import os
import shutil
import sys
import time


def main() -> int:
    src, dst = sys.argv[1], sys.argv[2]
    tries = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    interval = float(sys.argv[4]) if len(sys.argv) > 4 else 6.0
    if not os.path.exists(src):
        print(f"FAILED: 源文件不存在 {src}")
        return 1
    for i in range(tries):
        try:
            shutil.copyfile(src, dst)
            print(f"published {os.path.basename(src)} -> {dst}  ({os.path.getsize(dst) / 1024:.0f} KB)")
            return 0
        except PermissionError:
            if i < tries - 1:
                time.sleep(interval)
    print(f"FAILED: {dst} 一直被占用（多半是 PDF 预览器开着它）——"
          f"已保留生成结果 {src}，关掉预览器后重跑本命令即可")
    return 1


if __name__ == "__main__":
    sys.exit(main())
