FROM httpd:2.4-alpine

RUN echo "AddType text/cache-manifest .manifest" >> /usr/local/apache2/conf/httpd.conf

RUN apk --no-cache update && apk --no-cache add git nodejs yarn dumb-init

RUN adduser -D -h /opt/ror-player -s /bin/sh beatbox
USER beatbox
WORKDIR /opt/ror-player/

COPY --chown=beatbox ./ ./

RUN yarn install && yarn build && rm -rf node_modules

USER root
RUN mv dist/* /usr/local/apache2/htdocs/

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

ENV TITLE RoR Player
ENV DESCRIPTION A pattern-based drumming machine.

CMD [ "/bin/sh", "-c", "sed -ri /usr/local/apache2/htdocs/index.html -e \"s@<title>[^<]*</title>@<title>$TITLE</title>@\" -e \"s@(<meta name=\\\"description\\\" content=\\\")[^\\\"]*(\\\">)@\\\\1$DESCRIPTION\\\\2@\" && httpd-foreground" ]
