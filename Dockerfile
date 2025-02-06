FROM nginx:latest
LABEL authors="wxl"
EXPOSE 80

# 复制 dist文件夹内所有文件到 Nginx 的默认 HTML 目录
COPY dist /usr/share/nginx/html

# 复制自定义的 Nginx 配置文件到容器
COPY default.conf /etc/nginx/conf.d/default.conf
