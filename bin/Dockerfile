FROM node:12.22-alpine
ENV GOSU_VERSION 1.12

# Install gosu
RUN set -eux; \
    \
    apk add --no-cache --virtual .gosu-deps \
        ca-certificates \
        dpkg \
        gnupg \
    ; \
    \
    dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
    wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
    wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
    \
# verify the signature
    export GNUPGHOME="$(mktemp -d)"; \
    gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
    gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
    command -v gpgconf && gpgconf --kill all || :; \
    rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc; \
    \
# clean up fetch dependencies
    apk del --no-network .gosu-deps; \
    \
    chmod +x /usr/local/bin/gosu; \
# verify that the binary works
    gosu --version; \
    gosu nobody true

RUN mkdir /runner
RUN addgroup -S runners && adduser -S runner -G runners
COPY ./bin/docker-cryptor.sh /runner/cryptor.sh
COPY ./target/index.js /runner/
RUN chown runner /runner
RUN chmod +x /runner/cryptor.sh
ENTRYPOINT ["/runner/cryptor.sh"]
CMD ["--help"]
