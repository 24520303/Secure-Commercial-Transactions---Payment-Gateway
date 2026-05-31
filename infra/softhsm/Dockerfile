# softhsm/Dockerfile
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    softhsm2 \
    opensc \
    libengine-pkcs11-openssl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Thư mục lưu token (sẽ mount volume)
RUN mkdir -p /var/lib/softhsm/tokens && \
    chmod 700 /var/lib/softhsm/tokens

# Config mặc định trỏ đến thư mục tokens
RUN echo "directories.tokendir = /var/lib/softhsm/tokens/" > /etc/softhsm2.conf && \
    echo "objectstore.backend = file" >> /etc/softhsm2.conf && \
    echo "log.level = INFO" >> /etc/softhsm2.conf

ENV SOFTHSM2_CONF=/etc/softhsm2.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/var/lib/softhsm/tokens"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["tail", "-f", "/dev/null"]