FROM nginx:alpine

RUN rm /usr/share/nginx/html/index.html \
  && apk update && apk add -u gettext

COPY ./dist /usr/share/nginx/html
COPY ./.dockerfiles/nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
