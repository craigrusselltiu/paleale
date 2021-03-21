FROM burbon/deployment:0.1

ENV KLOSTER_MODE production
ENV KLOSTER_CONFIG /var/lib/kloster/kloster.toml

RUN set -x \
# create kloster user and group
    && addgroup --system --gid 126 kloster \
    && adduser --system --disabled-login --ingroup kloster --no-create-home --home /nonexistent --gecos "kloster user" --shell /bin/false --uid 126 kloster \
    && mkdir /var/lib/kloster \
    && chown kloster:kloster /var/lib/kloster

COPY default.conf /etc/nginx/conf.d/default.conf

COPY paleale/. /usr/share/nginx/html

COPY kloster.toml /var/lib/kloster/kloster.toml
COPY kloster /opt

RUN touch /var/log/kloster.log \
    && ln -sf /dev/stdout /var/log/kloster.log

RUN mkdir /etc/service/kloster
COPY kloster.sh /etc/service/kloster/run
RUN chmod +x /etc/service/kloster/run
