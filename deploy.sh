#!/bin/sh

set -e

if [ -z "${1%@*}" ] || [ -z "${1#*@}" ]; then
    echo "Please specify a valid ssh connection! (user@host)" >&2
    exit 1
fi

cd "$(dirname "$0")"

if [ "$2" != "--skip-build" ] && [ "$2" != "-s" ]; then
    npm run build
    printf "\n"
fi

ssh "$1" /bin/sh <<'EOF'
set -e
rm -rf "$HOME/emexlabs"
EOF

scp -rC ./build "$1:~/emexlabs"

ssh "$1" /bin/sh <<'EOF'
set -e
find "$HOME/emexlabs" -type d -exec chmod 755 {} \;
find "$HOME/emexlabs" -type f -exec chmod 644 {} \;
set +e
diff -qr "$HOME/emexlabs/bootstrap" "/var/www/emexlabs/bootstrap" >/dev/null 2>&1
bootstrap_diff=$?
set -e
if [ $bootstrap_diff -ne 0 ]; then
    if [ $bootstrap_diff -eq 1 ]; then
        printf "Bootstrap is different! Replace it? [y/N] "
    else
        printf "Bootstrap check failed! Continue anyway? [y/N] "
    fi
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) ;;
        *) exit 1 ;;
    esac
fi
mv --exchange -T "$HOME/emexlabs" "/var/www/emexlabs"
printf "\n\033[32;1mDeployed successfully!\033[0m\n"

mkdir -p "$HOME/backups"
backup_timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="backups/website-${backup_timestamp}"
i=0
while [ -e "$HOME/$backup_path" ]; do
    i=$((i + 1))
    backup_path="backups/website-${backup_timestamp}-$i"
done
mv "$HOME/emexlabs" "$HOME/$backup_path"
printf "\n\033[33;1mBackup successful!\033[0m\n"
EOF
