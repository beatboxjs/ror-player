FROM httpd:2.4-alpine

RUN echo "AddType text/cache-manifest .manifest" >> /usr/local/apache2/conf/httpd.conf

RUN apk --no-cache update && apk --no-cache add git nodejs nodejs-npm dumb-init

COPY ./ /opt/angular-beatbox/

RUN adduser -D -h /opt/angular-beatbox -s /bin/bash beatbox

WORKDIR /opt/angular-beatbox/

RUN chmod 777 . && su beatbox -c 'npm install && npm run build' && mv build/* /usr/local/apache2/htdocs && rm -rf build node_modules bower_components

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

ENV TITLE Angular Beatbox
ENV DESCRIPTION A pattern-based drumming machine.

CMD [ "/bin/bash", "-c", "sed -ri /usr/local/apache2/htdocs/index.html -e \"s@<title>.*</title>@<title>$TITLE</title>@\" -e \"s@(<meta name=\\\"description\\\" content=\\\").*(\\\">)@\\\\1$DESCRIPTION\\\\2@\" && httpd-foreground" ]
