#!/bin/bash

# 显示最新的远程标签
function get_latest_remote_tag() {
  latest_tag=$(git ls-remote --tags origin | awk -F '/' '{print $3}' | sort -t. -k1,1n -k2,2n -k3,3n | tail -n1)
  echo "$latest_tag"
}

# 显示用法信息
function display_usage() {
  echo "用法: $0"
}

# 获取最新的远程标签
latest_tag=$(get_latest_remote_tag)

if [ -z "$latest_tag" ]; then
  echo "远程仓库中未找到标签。"
else
  echo "最新的远程标签为: $latest_tag"
fi

# 提示用户输入版本号和标签信息
read -p "请输入版本号（格式为 x.y.z）: " version

# 验证版本号格式（应为 x.y.z 格式）
if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "无效的版本号格式。版本号应为 x.y.z 格式。"
  exit 1
fi

# 提示用户输入标签信息
read -p "请输入标签信息: " tag_message

# 提交更改并创建带有提供的信息的带注释标签
git add .
git commit -m "版本 $version"
git tag -a "$version" -m "$tag_message"

# 推送提交和标签到远程仓库
git push origin main
git push origin "$version"

echo "标签 $version 已创建并推送到远程仓库。"
