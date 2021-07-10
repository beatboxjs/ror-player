FROM httpd:2.4-alpine

RUN echo "AddType text/cache-manifest .manifest" >> /usr/local/apache2/conf/httpd.conf

RUN apk --no-cache update && apk --no-cache add git nodejs npm dumb-init

COPY ./ /opt/ror-player/

RUN adduser -D -h /opt/ror-player -s /bin/sh beatbox

WORKDIR /opt/ror-player/

RUN chmod 777 . && chmod 666 package-lock.json && su beatbox -c 'npm install && npm run build' && mv dist/* /usr/local/apache2/htdocs && rm -rf dist node_modules

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

ENV TITLE RoR Player
ENV DESCRIPTION A pattern-based drumming machine.

CMD [ "/bin/sh", "-c", "sed -ri /usr/local/apache2/htdocs/index.html -e \"s@<title>[^<]*</title>@<title>$TITLE</title>@\" -e \"s@(<meta name=\\\"description\\\" content=\\\")[^\\\"]*(\\\">)@\\\\1$DESCRIPTION\\\\2@\" && httpd-foreground" ]
